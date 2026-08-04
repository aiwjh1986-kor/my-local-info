const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchRegionCodes() {
  const API_KEY = process.env.TOUR_API_KEY || process.env.PUBLIC_DATA_API_KEY;

  if (!API_KEY) {
    console.error('API 키가 설정되지 않았습니다.');
    return;
  }

  try {
    const encodedKey = encodeURIComponent(API_KEY);
    
    // 1. 시/도 코드 가져오기
    const areaUrl = `https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${encodedKey}&numOfRows=50&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json`;
    const areaRes = await fetch(areaUrl);
    const areaData = await areaRes.json();
    
    if (!areaData.response?.body?.items?.item) {
      console.error('시/도 코드 데이터를 가져오지 못했습니다.');
      return;
    }

    const areas = areaData.response.body.items.item;
    const regionMapping = [];

    // 2. 각 시/도별 시/군/구 코드 가져오기
    for (const area of areas) {
      const sigunguUrl = `https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${encodedKey}&numOfRows=50&pageNo=1&MobileOS=ETC&MobileApp=AppTest&areaCode=${area.code}&_type=json`;
      const sigunguRes = await fetch(sigunguUrl);
      const sigunguData = await sigunguRes.json();
      
      const sigungus = sigunguData.response?.body?.items?.item || [];
      
      regionMapping.push({
        code: area.code,
        name: area.name,
        sigungus: sigungus.map(s => ({ code: s.code, name: s.name }))
      });
      
      // API 속도 제한 고려
      await new Promise(r => setTimeout(r, 200));
    }

    const targetDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(targetDir, 'region-codes.json'), JSON.stringify(regionMapping, null, 2), 'utf8');
    console.log('✨ 전국 지역 코드 (시/도 및 시/군/구) 수집 완료!');

  } catch (error) {
    console.error('에러 발생:', error);
  }
}

fetchRegionCodes();
