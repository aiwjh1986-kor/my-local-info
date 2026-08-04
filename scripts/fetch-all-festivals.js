const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchAllFestivals() {
  const API_KEY = process.env.TOUR_API_KEY || process.env.PUBLIC_DATA_API_KEY;

  if (!API_KEY) {
    console.error('API 키가 설정되지 않았습니다.');
    return;
  }

  // 올해 기준 시작일 (예: 20240101)
  const now = new Date();
  const year = now.getFullYear();
  const eventStartDate = `${year}0101`;
  
  console.log(`[TourAPI] 전국 행사 정보 수집 시작... (기준일: ${eventStartDate})`);

  try {
    const encodedKey = encodeURIComponent(API_KEY);
    // 100개 가져오기
    const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${encodedKey}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=A&eventStartDate=${eventStartDate}`;

    const res = await fetch(url);
    const text = await res.text();

    if (text.includes('SERVICE_ACCESS_DENIED_ERROR') || text.includes('Unexpected errors') || text.includes('<OpenAPI_ServiceResponse>')) {
      console.log('\n[알림] API 권한 에러 또는 응답 에러가 발생했습니다.\n');
      return;
    }

    const data = JSON.parse(text);
    if (!data.response || !data.response.body || !data.response.body.items || !data.response.body.items.item) {
      console.log('API 응답에 행사 데이터가 없습니다.');
      return;
    }

    const items = data.response.body.items.item;
    
    // public/data 디렉토리 확인
    const dataDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const festivalsPath = path.join(dataDir, 'festivals.json');
    let existingFestivals = [];
    
    if (fs.existsSync(festivalsPath)) {
      try {
        existingFestivals = JSON.parse(fs.readFileSync(festivalsPath, 'utf8'));
      } catch(e) {
        console.error("기존 데이터 파싱 오류", e);
      }
    }

    // 기존 데이터 id 수집 (contentid 기준)
    const existingIds = new Set(existingFestivals.map(f => f.contentid));
    let newCount = 0;

    for (const item of items) {
      if (!existingIds.has(item.contentid)) {
        
        // 지역명 파싱 (예: "서울특별시 중구" -> "서울")
        let regionGroup = "기타";
        if (item.addr1) {
          const firstWord = item.addr1.split(' ')[0]; // "서울특별시"
          if (firstWord.includes('서울')) regionGroup = "서울";
          else if (firstWord.includes('경기')) regionGroup = "경기";
          else if (firstWord.includes('인천')) regionGroup = "인천";
          else if (firstWord.includes('강원')) regionGroup = "강원";
          else if (firstWord.includes('충청') || firstWord.includes('충남') || firstWord.includes('충북') || firstWord.includes('대전') || firstWord.includes('세종')) regionGroup = "충청";
          else if (firstWord.includes('전라') || firstWord.includes('전남') || firstWord.includes('전북') || firstWord.includes('광주')) regionGroup = "전라";
          else if (firstWord.includes('경상') || firstWord.includes('경남') || firstWord.includes('경북') || firstWord.includes('부산') || firstWord.includes('대구') || firstWord.includes('울산')) regionGroup = "경상";
          else if (firstWord.includes('제주')) regionGroup = "제주";
        }
        
        item.regionGroup = regionGroup;
        existingFestivals.push(item);
        newCount++;
      }
    }

    // eventstartdate 최신순 정렬 (내림차순)
    existingFestivals.sort((a, b) => b.eventstartdate.localeCompare(a.eventstartdate));

    fs.writeFileSync(festivalsPath, JSON.stringify(existingFestivals, null, 2), 'utf8');
    
    console.log(`✨ 수집 완료! 총 ${items.length}개 중 ${newCount}개의 새로운 행사를 저장했습니다. (총 누적 데이터: ${existingFestivals.length}개)`);

  } catch (error) {
    console.error('API 연동 중 오류 발생:', error);
  }
}

fetchAllFestivals();
