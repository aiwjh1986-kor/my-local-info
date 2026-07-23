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

  console.log(`[TourAPI] 전국 지역 축제 정보 수집 시작... (기준일: ${dateStr})`);

  try {
    const encodedKey = encodeURIComponent(API_KEY);
    // 전국 단위 (areaCode 제거), eventStartDate=오늘날짜
    const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${encodedKey}&numOfRows=5&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=A&eventStartDate=${dateStr}`;

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
        console.log('오늘 새롭게 올라온 전국 지역 축제 정보가 없습니다.');
        return;
      }
      items = data.response.body.items.item;
    }
    const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
    let cards = fs.existsSync(featuredCardsPath) ? JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8')) : [];

    let festival = null;
    for (const item of items) {
      const expectedTitle = `[전국 축제] 이번 주말 나들이 추천! ${item.title} 완벽 가이드 🎉`;
      if (!cards.find(c => c.title === expectedTitle)) {
        festival = item;
        break;
      }
    }

    if (!festival) {
      console.log('이미 모든 축제 정보가 등록되어 있습니다. 대신 추천 관광 코스를 찾아봅니다.');
      // 관광코스 (contentTypeId=25) 데이터 호출
      const courseUrl = `https://apis.data.go.kr/B551011/KorService2/areaBasedList1?serviceKey=${encodedKey}&numOfRows=20&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=O&contentTypeId=25`;
      const courseRes = await fetch(courseUrl);
      const courseText = await courseRes.text();
      
      try {
        const courseData = JSON.parse(courseText);
        const courseItems = courseData.response?.body?.items?.item || [];
        
        for (const item of courseItems) {
          const expectedTitle = `[추천 코스] 이번 주말 나들이 추천! ${item.title} 완벽 가이드 🎉`;
          if (!cards.find(c => c.title === expectedTitle)) {
            festival = item;
            festival.isCourse = true;
            break;
          }
        }
      } catch (e) {
        console.error('관광코스 파싱 에러:', e);
      }

      if (!festival) {
        console.log('새로운 관광코스도 찾을 수 없어 이번에는 글을 작성하지 않습니다.');
        return;
      }
      console.log(`새로운 코스 '${festival.title}' 정보로 블로그 글을 생성합니다.`);
    } else {
      console.log(`새로운 축제 '${festival.title}' 정보로 블로그 글을 생성합니다.`);
    }
    const festInfo = `
이름: ${festival.title}
${festival.eventstartdate ? `기간: ${festival.eventstartdate} ~ ${festival.eventenddate}` : ''}
장소: ${festival.addr1 || ''} ${festival.addr2 || ''}
전화번호: ${festival.tel || '정보 없음'}
    `.trim();

    const postTitle = festival.isCourse 
      ? `[추천 코스] 이번 주말 나들이 추천! ${festival.title} 완벽 가이드 🎉`
      : `[전국 축제] 이번 주말 나들이 추천! ${festival.title} 완벽 가이드 🎉`;
    const postCategory = festival.isCourse ? '추천코스' : '지역행사';

    console.log('[Gemini AI] 블로그 포스트 작성 중...');

    const prompt = `너는 '용인시 용인시정보 및 여행가이드' 블로그의 전문 에디터야.
오늘은 전국 각지의 ${festival.isCourse ? '멋진 여행 코스를' : '신나는 축제 정보를'} 소개할 거야.
아래 한국관광공사에서 받아온 정보를 바탕으로 아주 풍성하고 재미있게, 한글 공백 포함 '최소 2000자 이상'의 분량으로 블로그 글을 작성해줘.

[${festival.isCourse ? '코스' : '축제'} 정보]
${festInfo}

작성 지침:
1. 톤앤매너: 친절하고 다정한 말투 (해요체).
2. 분량: 한글 공백 포함 최소 2000자 이상. 정보가 단순하므로, 이 ${festival.isCourse ? '코스의' : '축제의'} 예상되는 즐길 거리, 주변 여행 코스 추천, 가족/연인과 가기 좋은 이유 등 상상력과 배경지식을 동원해 아주 풍성하게 살을 붙여줘.
3. 주의: '루미예요' 같은 가상의 이름은 넣지 마.
4. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.

출력 형식:
---
title: "${postTitle}"
date: ${now.toISOString()}
summary: "전국에서 즐기는 꿀잼 보장 나들이! ${festival.title}의 모든 것을 소개합니다."
category: ${postCategory}
image: event/festival-default.png
tags: [전국나들이, 주말나들이, ${festival.title.replace(/\s+/g, '')}, 가족여행, 데이트코스]
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

    // 고유한 파일명(slug) 생성 (날짜 + 축제ID 또는 랜덤)
    const uniqueId = festival.contentid || Math.floor(Math.random() * 10000);
    const slug = `${dashDateStr}-tour-${uniqueId}`;
    const fileName = `${slug}.md`;
    const targetDir = path.join(__dirname, '../src/content/posts/지역행사');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    fs.writeFileSync(path.join(targetDir, fileName), cleanContent, 'utf8');

    // featured-cards.json 업데이트
    // 기존에 같은 제목이 있으면 삭제 (중복 생성 방지)
    cards = cards.filter(c => c.title !== postTitle);
    
    // 주소에서 지역명 추출 (예: '울산광역시 남구' -> '울산')
    let regionName = '전국';
    if (festival.addr1) {
      const firstWord = festival.addr1.split(' ')[0];
      regionName = firstWord.replace(/광역시|특별시|특별자치시|특별자치도|도$/, '');
    }

    cards.unshift({
      category: postCategory,
      title: postTitle,
      summary: `전국에서 즐기는 꿀잼 보장 나들이! ${festival.title}의 모든 것을 소개합니다.`,
      content: cleanContent.split('---')[2]?.trim().substring(0, 300) + '...',
      date: dashDateStr,
      region: regionName,
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
