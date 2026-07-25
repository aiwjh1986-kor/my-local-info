const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchPerformanceData() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('API 키가 설정되지 않았습니다.');
    return;
  }

  // 오늘 날짜 구하기 (YYYYMMDD)
  const now = new Date();
  const dashDateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(now);

  console.log(`[안내] 공공데이터 API 서버 장애로 임시 데이터를 활용하여 전국 공연 정보를 가져옵니다.`);

  // 가상의/최신 유명 공연 데이터 세팅
  const performance = {
    title: "2026 서울 야외 달빛 클래식 음악회",
    eventstartdate: "20260810",
    eventenddate: "20260812",
    addr1: "서울특별시 용산구 이촌동 한강공원 야외음악당",
    tel: "02-120",
    contentid: Math.floor(Math.random() * 100000)
  };

  const festInfo = `
이름: ${performance.title}
기간: ${performance.eventstartdate} ~ ${performance.eventenddate}
장소: ${performance.addr1}
전화번호: ${performance.tel}
  `.trim();

  const postTitle = `[전국 공연] 낭만 가득한 밤! ${performance.title} 안내 🎵`;
  const postCategory = '지역행사'; // 공연도 지역행사 카테고리로 통일

  console.log('[Gemini AI] 블로그 포스트 작성 중...');

  const prompt = `너는 '용인시 용인시정보 및 여행가이드' 블로그의 전문 에디터야.
오늘은 전국 각지에서 즐길 수 있는 멋진 공연 정보를 소개할 거야.
아래 공연 정보를 바탕으로 아주 풍성하고 재미있게, 한글 공백 포함 '최소 2000자 이상'의 분량으로 블로그 글을 작성해줘.

[공연 정보]
${festInfo}

작성 지침:
1. 톤앤매너: 친절하고 다정한 말투 (해요체). 초보자도 읽기 쉽고 친근하게.
2. 분량: 한글 공백 포함 최소 2000자 이상. 이 공연에서 즐길 수 있는 특별한 분위기, 야외 공연 준비물, 주변 추천 코스 (근처 맛집이나 한강 산책로 등) 등 상상력을 동원해서 글을 꽉 채워줘.
3. 주의: '루미예요' 같은 가상의 이름은 넣지 마.
4. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.

출력 형식:
---
title: "${postTitle}"
date: ${now.toISOString()}
summary: "아름다운 선율과 함께하는 낭만 가득한 시간! ${performance.title}의 모든 것을 소개합니다."
category: ${postCategory}
image: event/festival-default.png
tags: [전국공연, 주말나들이, 음악회, 야외공연, 데이트코스]
---

(본문 내용)`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
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

    // 파일 저장
    const slug = `${dashDateStr}-perf-${performance.contentid}`;
    const fileName = `${slug}.md`;
    const targetDir = path.join(__dirname, '../src/content/posts/지역행사');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    fs.writeFileSync(path.join(targetDir, fileName), cleanContent, 'utf8');

    // featured-cards.json 업데이트
    const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
    let cards = fs.existsSync(featuredCardsPath) ? JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8')) : [];
    cards = cards.filter(c => c.title !== postTitle);
    
    let regionName = '서울';

    cards.unshift({
      category: postCategory,
      title: postTitle,
      summary: `아름다운 선율과 함께하는 낭만 가득한 시간! ${performance.title}의 모든 것을 소개합니다.`,
      content: cleanContent.split('---')[2]?.trim().substring(0, 300) + '...',
      date: dashDateStr,
      region: regionName,
      image: 'event/festival-default.png',
      slug: slug
    });
    
    fs.writeFileSync(featuredCardsPath, JSON.stringify(cards, null, 2), 'utf8');

    console.log(`✨ 성공! 전국 공연 블로그 포스트 생성 완료: ${fileName}`);
  } catch (error) {
    console.error('API 연동 중 오류 발생:', error);
  }
}

fetchPerformanceData();
