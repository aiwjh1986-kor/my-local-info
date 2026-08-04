const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testApi() {
  const API_KEY = process.env.TOUR_API_KEY || process.env.PUBLIC_DATA_API_KEY;
  const areaCode = "1"; // 서울
  const sigunguCode = "1"; // 강남구
  const contentTypeId = "12"; // 관광지
  
  const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList1?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=15&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&listYN=Y&arrange=O&contentTypeId=${contentTypeId}&areaCode=${areaCode}&sigunguCode=${sigunguCode}`;
  
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testApi();
