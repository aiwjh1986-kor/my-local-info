const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchTourData() {
  const API_KEY = process.env.TOUR_API_KEY || process.env.PUBLIC_DATA_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY || !GEMINI_API_KEY) {
    console.error('API 키가 설정되지 않았습니다.');
    return;
  }

  // 오늘 날짜 구하기 (YYYYMMDD)
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' })
    .format(now).replace(/\. /g, '').replace('.', '');
  const dashDateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(now);

  console.log(`[TourAPI] 경기도(31) 지역 축제 정보 수집 시작... (기준일: ${dateStr})`);

  try {
    const encodedKey = encodeURIComponent(API_KEY);
    // areaCode=31 (경기도), eventStartDate=오늘날짜
    const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${encodedKey}&numOfRows=5&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=A&eventStartDate=${dateStr}&areaCode=31`;

    const res = await fetch(url);
    const text = await res.text();

    let items = [];
    if (text.includes('SERVICE_ACCESS_DENIED_ERROR') || text.includes('Unexpected errors') || text.includes('<OpenAPI_ServiceResponse>')) {
      console.log('\n[알림] TourAPI 권한 동기화 대기 중... (임시로 관광공사 샘플 데이터를 사용하여 글을 생성합니다!)\n');
      items = [{
        title: "2026 에버랜드 장미축제 (장미원)",
        eventstartdate: "20260515",
        eventenddate: "20260616",
        addr1: "경기도 용인시 처인구 포곡읍 에버랜드로 199",
        addr2: "(에버랜드 장미원)",
        tel: "031-320-5000"
      }];
    } else {
      const data = JSON.parse(text);
      if (!data.response || !data.response.body || !data.response.body.items || !data.response.body.items.item) {
        console.log('오늘 새롭게 올라온 경기도 지역 축제 정보가 없습니다.');
        return;
      }
      items = data.response.body.items.item;
    }
    console.log(`총 ${items.length}개의 축제 정보를 찾았습니다. 첫 번째 축제로 블로그 글을 생성합니다.`);

    const festival = items[0];
    const festInfo = `
행사명: ${festival.title}
기간: ${festival.eventstartdate} ~ ${festival.eventenddate}
장소: ${festival.addr1} ${festival.addr2 || ''}
전화번호: ${festival.tel || '정보 없음'}
    `.trim();

    console.log('[Gemini AI] 블로그 포스트 작성 중...');

    const prompt = `너는 '용인시 용인시정보 및 여행가이드' 블로그의 전문 에디터야.
오늘은 경기도 지역의 신나는 축제 정보를 소개할 거야.
아래 한국관광공사에서 받아온 축제 정보를 바탕으로 아주 풍성하고 재미있게, 한글 공백 포함 '최소 2000자 이상'의 분량으로 블로그 글을 작성해줘.

[축제 정보]
${festInfo}

작성 지침:
1. 톤앤매너: 친절하고 다정한 말투 (해요체).
2. 분량: 한글 공백 포함 최소 2000자 이상. 정보가 단순하므로, 이 축제의 예상되는 즐길 거리, 주변 여행 코스 추천, 가족/연인과 가기 좋은 이유 등 상상력과 배경지식을 동원해 아주 풍성하게 살을 붙여줘.
3. 주의: '루미예요' 같은 가상의 이름은 넣지 마.
4. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.

출력 형식:
---
title: "[경기도 축제] 이번 주말 나들이 추천! ${festival.title} 완벽 가이드 🎉"
date: ${now.toISOString()}
summary: "경기도에서 열리는 꿀잼 보장 축제! ${festival.title}의 모든 것을 소개합니다."
category: 지역행사
image: event/festival-default.png
tags: [경기도축제, 주말나들이, ${festival.title.replace(/\s+/g, '')}, 가족여행, 데이트코스]
---

(본문 내용)`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const geminiData = await geminiRes.json();
    let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) { console.error('AI 생성 실패'); return; }

    let cleanContent = aiResponse.trim();
    if (cleanContent.startsWith('```markdown')) {
      cleanContent = cleanContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    }

    const slug = `${dashDateStr}-01-tour-festival`;
    const fileName = `${slug}.md`;
    const targetDir = path.join(__dirname, '../src/content/posts/지역행사');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    fs.writeFileSync(path.join(targetDir, fileName), cleanContent, 'utf8');

    // featured-cards.json 업데이트
    const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
    let cards = JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8'));
    
    // 기존에 같은 slug가 있으면 삭제
    cards = cards.filter(c => c.slug !== slug);
    
    cards.unshift({
      category: '지역행사',
      title: `[경기도 축제] 이번 주말 나들이 추천! ${festival.title} 완벽 가이드 🎉`,
      summary: `경기도에서 열리는 꿀잼 보장 축제! ${festival.title}의 모든 것을 소개합니다.`,
      content: cleanContent.split('---')[2].trim().substring(0, 300) + '...',
      date: dashDateStr,
      region: '경기도',
      image: 'event/festival-default.png',
      slug: slug
    });
    
    fs.writeFileSync(featuredCardsPath, JSON.stringify(cards, null, 2), 'utf8');

    console.log(`✨ 성공! 블로그 포스트 생성 완료: ${fileName}`);

  } catch (error) {
    console.error('API 연동 중 오류 발생:', error);
  }
}

fetchTourData();
