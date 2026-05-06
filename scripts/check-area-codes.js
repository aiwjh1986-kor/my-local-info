const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function searchDistrictCode() {
  const OPINET_API_KEY = process.env.OPINET_API_KEY;
  // 모든 경기도 시군구 리스트를 가져와서 용인 포함된 것 찾기
  const url = `http://www.opinet.co.kr/api/areaCode.do?out=json&code=${OPINET_API_KEY}&area=02`;
  const response = await fetch(url);
  const data = await response.json();
  
  const yongin = data.RESULT.OIL.find(a => a.AREA_NM.includes('용인'));
  console.log('용인시 코드:', yongin);
  
  if (yongin) {
    const subUrl = `http://www.opinet.co.kr/api/areaCode.do?out=json&code=${OPINET_API_KEY}&area=${yongin.AREA_CD}`;
    const subResponse = await fetch(subUrl);
    const subData = await subResponse.json();
    console.log('용인시 하위 코드:', JSON.stringify(subData, null, 2));
  }
}

searchDistrictCode();
