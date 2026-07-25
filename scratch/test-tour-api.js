const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function testApi() {
  const API_KEY = process.env.TOUR_API_KEY || process.env.PUBLIC_DATA_API_KEY;
  const encodedKey = encodeURIComponent(API_KEY);
  
  const urls = [
    `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${encodedKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=O&contentTypeId=14`,
    `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${encodedKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=A&keyword=${encodeURIComponent('공연')}&contentTypeId=14`,
    `https://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${encodedKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=A&eventStartDate=20260725`
  ];
  
  for (const url of urls) {
    console.log("Fetching: " + url);
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log("Result:");
      console.log(text.substring(0, 300));
    } catch(e) {
      console.error(e);
    }
  }
}
testApi();
