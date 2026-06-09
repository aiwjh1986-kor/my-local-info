const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 사용자가 제공한 관광코스 목록
const COURSES = [
  { name: '남호고택에서의 하룻밤', region: '봉화', location: 'Bonghwa' },
  { name: '천년의 비밀을 지닌 고찰에서 캠핑을하다', region: '영동', location: 'Yeongdong' },
  { name: '밝고 청정한 영양의 산천을 찾아서', region: '영양', location: 'Yeongyang' },
  { name: '켜켜이 쌓인 세월의 아름다움을 찾아서', region: '보은', location: 'Boeun' },
  { name: '속리산이 그려낸 즐거운 나날', region: '괴산, 보은', location: 'Goesan' },
  { name: '청주의 자연에서 배우면서 뒹굴자', region: '청주', location: 'Cheongju' },
  { name: '캠핑을 즐기며 여유롭게 돌아보는 태안', region: '태안', location: 'Taean' },
  { name: '캠핑에 문화와 예술을 더하다', region: '계룡, 논산', location: 'Nonsan' },
  { name: '백제 땅에 캠핑하다', region: '논산', location: 'Nonsan' },
  { name: '서해바다에 안기고 체험마을에 머물다', region: '보령, 서천', location: 'Boryeong' },
  { name: '충청남도의 보물 같은 마을 풍경', region: '예산', location: 'Yesan' },
  { name: '충청남도의 자연에 풍덩 빠져 즐기다', region: '서산', location: 'Seosan' }
];

async function fetchWeather(location) {
  try {
    const weatherUrl = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    const current = data.current_condition[0];
    return {
      temp: current.temp_C,
      desc: current.lang_ko ? current.lang_ko[0].value : current.weatherDesc[0].value,
      humidity: current.humidity
    };
  } catch (err) {
    console.log('기상청/날씨 API 호출 오류, 기본 날씨로 대체합니다.');
    return { temp: '22', desc: '맑음', humidity: '50' };
  }
}

async function fetchTourWeather() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY가 없습니다.');
    return;
  }

  // 매일 1개의 코스를 랜덤 선택 (또는 날짜 기반 선택)
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const course = COURSES[dayOfYear % COURSES.length];

  console.log(`[관광코스 날씨조회] 오늘의 추천 코스: ${course.name} (${course.region})`);

  // 날씨 데이터 조회 (실제로는 기상청 API 파라미터 맵핑이 복잡하므로, wttr로 지역 날씨 대체 조회)
  const weather = await fetchWeather(course.location);
  console.log(`- 현재 ${course.region} 날씨: ${weather.desc}, ${weather.temp}도, 습도 ${weather.humidity}%`);

  const prompt = `너는 '용인시정보 및 여행가이드' 블로그의 전문 에디터야.
오늘은 특별히 기상청과 관광공사가 추천하는 테마 관광코스를 소개할 거야.
아래의 코스 정보와 현재 날씨를 바탕으로, 한글 공백 포함 '최소 3000자 이상'의 분량으로 아주 풍성하고 감성적인 블로그 글을 작성해줘.

[오늘의 추천 코스]
- 코스명: ${course.name}
- 지역: ${course.region}
- 현재 날씨: ${weather.desc}, 기온 ${weather.temp}도

작성 지침:
1. 톤앤매너: 친절하고 다정한 블로거 말투 (해요체).
2. 분량: 한글 공백 포함 최소 3000자 이상. 해당 코스에 대한 상상력, 주변 맛집 추천, 날씨에 따른 준비물(예: 맑으면 선크림, 비오면 우산), 가족/연인과의 여행 꿀팁 등을 동원하여 아주 길고 풍성하게 써야해.
3. 서론에는 오늘 ${course.region}의 날씨(${weather.desc}, ${weather.temp}도)를 언급하며 여행가기 딱 좋은 날이라고 유도할 것.
4. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.
5. 주의: '루미예요' 같은 가상의 이름은 넣지 마.

출력 형식:
---
title: "[추천코스] 날씨와 함께하는 여행! ${course.region} - ${course.name}"
date: ${today.toISOString()}
summary: "오늘의 날씨(${weather.desc})에 딱 맞는 완벽한 여행 코스! ${course.region}의 '${course.name}' 코스를 강력 추천합니다."
category: 추천코스
image: event/festival-default.png
tags: [여행코스, ${course.region}여행, 국내여행, 날씨맞춤여행, 주말나들이]
---

(본문 내용)`;

  console.log('[Gemini AI] 3000자 이상 블로그 포스트 작성 중...');

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const geminiData = await geminiRes.json();
    let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      console.error('AI 생성 실패');
      return;
    }

    let cleanContent = aiResponse.trim();
    if (cleanContent.startsWith('```markdown')) {
      cleanContent = cleanContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    }

    const dateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(today);
    const slug = `${dateStr}-01-tour-course-${course.location.toLowerCase()}`;
    const fileName = `${slug}.md`;
    
    // 카테고리: 지역행사 하부인 '추천코스' 폴더에 저장
    const targetDir = path.join(__dirname, '../src/content/posts/추천코스');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(targetDir, fileName), cleanContent, 'utf8');

    // featured-cards.json 에도 등록 (선택사항, 메인 화면 노출용)
    const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
    if (fs.existsSync(featuredCardsPath)) {
      let cards = JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8'));
      cards = cards.filter(c => c.slug !== slug);
      cards.unshift({
        category: '추천코스',
        title: `[추천코스] 날씨와 함께하는 여행! ${course.region} - ${course.name}`,
        summary: `오늘의 날씨(${weather.desc})에 딱 맞는 완벽한 여행 코스! ${course.region}의 '${course.name}' 코스를 강력 추천합니다.`,
        content: cleanContent.split('---')[2].trim().substring(0, 300) + '...',
        date: dateStr,
        region: course.region,
        image: 'event/festival-default.png',
        slug: slug
      });
      fs.writeFileSync(featuredCardsPath, JSON.stringify(cards, null, 2), 'utf8');
    }

    console.log(`✨ 성공! 추천 코스 포스트 생성 완료 (추천코스 폴더): ${fileName}`);

  } catch (err) {
    console.error('포스트 생성 중 오류:', err);
  }
}

fetchTourWeather();
