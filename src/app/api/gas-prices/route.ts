import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 실시간 데이터 조회를 위해 캐시 비활성화

export async function GET() {
  const OPINET_API_KEY = process.env.OPINET_API_KEY;

  if (!OPINET_API_KEY) {
    return NextResponse.json({ error: 'OPINET_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const districtPoints = [
    { id: 'suji', name: '수지구', x: 318841, y: 524163 }, // 수지구청 인근
    { id: 'giheung', name: '기흥구', x: 322332, y: 517079 }, // 기흥역 인근
    { id: 'cheoin', name: '처인구', x: 330149, y: 513973 }  // 처인구청 인근
  ];

  try {
    const results = {};

    // 3개 구의 좌표를 기반으로 각각 주변 5km 이내 주유소 조회
    for (const point of districtPoints) {
      const url = `http://www.opinet.co.kr/api/aroundAll.do?out=json&code=${OPINET_API_KEY}&x=${point.x}&y=${point.y}&radius=5000&prodcd=B027`;
      const response = await fetch(url, { cache: 'no-store' });
      
      if (!response.ok) {
        console.error(`오피넷 API 호출 실패: ${point.name}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.RESULT && data.RESULT.OIL && data.RESULT.OIL.length > 0) {
        // 가격이 가장 저렴한 순서로 정렬됨 (오피넷 기본 정렬), 첫 번째 데이터가 최저가
        const cheapest = data.RESULT.OIL[0];
        results[point.id] = {
          name: cheapest.OS_NM,       // 주유소 이름
          price: cheapest.PRICE,      // 가격
          brand: cheapest.POLL_DIV_CO // 상표 (SKE, GSC, HDO 등)
        };
      } else {
        results[point.id] = null;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: results
    });
  } catch (error) {
    console.error('주유소 정보 조회 중 에러 발생:', error);
    return NextResponse.json({ error: '데이터를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
