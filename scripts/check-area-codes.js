const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function searchDistrictCode() {
  const OPINET_API_KEY = process.env.OPINET_API_KEY;
  const url = `http://www.opinet.co.kr/api/areaCode.do?out=json&code=${OPINET_API_KEY}&area=02`;
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('경기도 시군구 목록:', JSON.stringify(data.RESULT.OIL, null, 2));
}

searchDistrictCode();
