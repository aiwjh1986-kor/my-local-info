const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchGasPrices() {
  const OPINET_API_KEY = process.env.OPINET_API_KEY;

  if (!OPINET_API_KEY) {
    console.error('OPINET_API_KEY가 없습니다.');
    return;
  }

  try {
    console.log('용인시 구별 주유소 가격 정보 가져오는 중 (좌표 기반)...');
    const districtPoints = [
      { id: 'suji', name: '수지구', x: 318841, y: 524163 },
      { id: 'giheung', name: '기흥구', x: 322332, y: 517079 },
      { id: 'cheoin', name: '처인구', x: 330149, y: 513973 }
    ];

    const results = { suji: null, giheung: null, cheoin: null };

    for (const point of districtPoints) {
      console.log(`${point.name} 주변 데이터 수집 중...`);
      const url = `http://www.opinet.co.kr/api/aroundAll.do?out=json&code=${OPINET_API_KEY}&x=${point.x}&y=${point.y}&radius=5000&prodcd=B027`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`API 호출 실패 (${point.name}): ${response.status}`);
        continue;
      }
      const data = await response.json();
      
      if (data.RESULT && data.RESULT.OIL && data.RESULT.OIL.length > 0) {
        // 첫 번째가 최저가
        const cheapest = data.RESULT.OIL[0];
        results[point.id] = {
          name: cheapest.OS_NM,
          price: cheapest.PRICE,
          brand: cheapest.POLL_DIV_CO
        };
      }
    }

    const jsonContent = {
      success: true,
      timestamp: new Date().toISOString(),
      data: results
    };

    const targetPath = path.join(__dirname, '../public/data/gas-prices.json');
    fs.writeFileSync(targetPath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log('성공적으로 gas-prices.json 파일을 생성했습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

fetchGasPrices();
