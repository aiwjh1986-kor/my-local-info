export interface ToiletInfo {
  toiletNm: string;      // 화장실명
  rdnmadr: string;       // 소재지도로명주소
  lnmadr: string;        // 소재지지번주소
  unisexToiletYn: string;// 남녀공용화장실여부
  openTime: string;      // 개방시간
  latitude: number;      // 위도
  longitude: number;     // 경도
  distance?: number;     // 내 위치로부터의 거리 (km)
}

// 두 좌표 간의 거리 계산 (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export async function fetchNearbyToilets(userLat: number, userLng: number): Promise<ToiletInfo[]> {
  try {
    const apiKey = 'cbe8a59661c547c4ab966c5ef0650d42';
    const baseUrl = `https://openapi.gg.go.kr/Publtolt?KEY=${apiKey}&Type=json&pSize=1000`;
    
    // 경기도 전체 공중화장실 약 11,200여 개. 한 번에 최대 1000개 호출 가능.
    // 사용자가 경기도 어디에 있든 가장 가까운 화장실을 찾기 위해 전체 페이지(1~12)를 동시에 가져옵니다.
    const pages = Array.from({ length: 12 }, (_, i) => i + 1);
    
    const responses = await Promise.all(
      pages.map(page => fetch(`${baseUrl}&pIndex=${page}`).then(r => r.json()).catch(() => null))
    );

    let toilets: ToiletInfo[] = [];

    responses.forEach(data => {
      if (data && data.Publtolt && data.Publtolt[1] && data.Publtolt[1].row) {
        const items = data.Publtolt[1].row.map((item: any) => ({
          toiletNm: item.PBCTLT_PLC_NM,
          rdnmadr: item.REFINE_ROADNM_ADDR || item.REFINE_LOTNO_ADDR || '주소 정보 없음',
          lnmadr: item.REFINE_LOTNO_ADDR,
          unisexToiletYn: item.MALE_FEMALE_CMNUSE_TOILET_YN || 'N',
          openTime: item.OPEN_TM_INFO || '정보 없음',
          latitude: parseFloat(item.REFINE_WGS84_LAT),
          longitude: parseFloat(item.REFINE_WGS84_LOGT),
        }));
        toilets.push(...items);
      }
    });

    if (toilets.length === 0) {
      throw new Error('데이터 파싱 에러 또는 결과 없음');
    }

    // 위경도 값이 유효한 화장실만 필터링하고 거리 계산
    const validToilets = toilets.filter(t => !isNaN(t.latitude) && !isNaN(t.longitude) && t.latitude > 0);
    
    validToilets.forEach(t => {
      t.distance = calculateDistance(userLat, userLng, t.latitude, t.longitude);
    });

    // 거리순으로 오름차순 정렬
    validToilets.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // 가장 가까운 20개만 반환
    return validToilets.slice(0, 20);
    
  } catch (error) {
    console.error('화장실 데이터를 불러오는 중 에러 발생:', error);
    
    // API 에러 시 테스트를 위한 용인시 주변 임시(Mock) 데이터 반환
    const mockToilets: ToiletInfo[] = [
      { toiletNm: "용인중앙공원 화장실", rdnmadr: "경기도 용인시 처인구 김량장동", lnmadr: "", unisexToiletYn: "N", openTime: "24시간", latitude: 37.2345, longitude: 127.2012 },
      { toiletNm: "수지체육공원 공중화장실", rdnmadr: "경기도 용인시 수지구 포은대로", lnmadr: "", unisexToiletYn: "N", openTime: "06:00~22:00", latitude: 37.3211, longitude: 127.0987 },
      { toiletNm: "기흥역 환승주차장 화장실", rdnmadr: "경기도 용인시 기흥구 기흥역로", lnmadr: "", unisexToiletYn: "N", openTime: "24시간", latitude: 37.2755, longitude: 127.1162 },
      { toiletNm: "동백호수공원 화장실", rdnmadr: "경기도 용인시 기흥구 동백중앙로", lnmadr: "", unisexToiletYn: "N", openTime: "24시간", latitude: 37.2778, longitude: 127.1534 },
      { toiletNm: "보정동 카페거리 공영주차장", rdnmadr: "경기도 용인시 기흥구 보정동", lnmadr: "", unisexToiletYn: "N", openTime: "24시간", latitude: 37.3219, longitude: 127.1098 },
    ];

    mockToilets.forEach(t => {
      t.distance = calculateDistance(userLat, userLng, t.latitude, t.longitude);
    });
    mockToilets.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return mockToilets;
  }
}
