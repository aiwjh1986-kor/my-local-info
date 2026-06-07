const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function generate() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const prompt = `너는 '용인시 용인시정보 및 여행가이드' 블로그의 전문 에디터야.
오늘은 경기도 가평에서 열리는 아주 멋진 행사를 소개하는 글을 쓸 거야.
아래 주어진 정보를 바탕으로 아주 길고 풍성하게, 한글 공백 포함 '최소 2000자 이상'의 분량으로 블로그 글을 작성해줘.

[제공된 정보]
행사명: Colorful Garden 자라섬 꽃 페스타
일정: 진행 중 ~ 2026. 6. 14.(일)
장소: 경기도 가평군 자라섬 남도
내용: 양귀비, 델피늄 등 역대 최대 규모(약 10만 9천㎡)의 꽃밭 산책로와 다채로운 포토존을 즐길 수 있는 봄꽃 축제. 
입장료: 7,000원 (이 중 5,000원은 가평 지역화폐로 환급됨)

작성 지침:
1. 톤앤매너: 친절하고 다정한 말투 (해요체).
2. 분량: 한글 공백 포함 최소 2000자 이상. 정보가 부족하다면 교통편, 주변 맛집 추천, 꿀팁, 사진 찍기 좋은 스팟 등 상상력을 발휘하여 여행 코스를 제안하듯 풍성하게 살을 붙여줘.
3. 구성: 흥미로운 도입부 -> 자라섬 꽃 페스타 소개 (규모, 꽃 종류 등) -> 입장료 및 환급 꿀팁 -> 100배 즐기는 관람 팁 및 주변 여행지 -> 마무리
4. 주의: '루미예요', '가상의 이름'은 넣지 마.
5. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.

출력 형식:
---
title: "[가평 여행] 역대 최대 규모! 자라섬 꽃 페스타 관람 꿀팁 총정리 🌸"
date: 2026-05-30T10:00:00.000Z
summary: "약 10만 9천㎡의 광활한 꽃밭! 입장료 환급 꿀팁까지 꽉꽉 눌러 담은 자라섬 꽃 페스타 완벽 가이드입니다."
category: 지역행사
image: event/15.png
link: "https://www.gptour.go.kr/tour/festival.jsp"
tags: [자라섬꽃페스타, 가평여행, 봄꽃축제, 경기도나들이, 주말데이트]
---

(본문 내용)`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const data = await response.json();
  let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!aiResponse) { console.error('실패', data); return; }

  let cleanContent = aiResponse.trim();
  if (cleanContent.startsWith('```markdown')) {
    cleanContent = cleanContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
  }

  const fileName = '2026-05-30-01-jaraseom-flower-fest.md';
  const targetDir = path.join(__dirname, '../src/content/posts/지역행사');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, fileName), cleanContent, 'utf8');

  // Add to featured-cards.json
  const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
  let cards = JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8'));
  cards.unshift({
    category: '지역행사',
    title: '[가평 여행] 역대 최대 규모! 자라섬 꽃 페스타 관람 꿀팁 총정리 🌸',
    summary: '약 10만 9천㎡의 광활한 꽃밭! 입장료 환급 꿀팁까지 꽉꽉 눌러 담은 자라섬 꽃 페스타 완벽 가이드입니다.',
    content: cleanContent.split('---')[2].trim().substring(0, 300) + '...',
    date: '2026-05-30',
    region: '가평군',
    image: 'event/15.png',
    slug: '2026-05-30-01-jaraseom-flower-fest'
  });
  fs.writeFileSync(featuredCardsPath, JSON.stringify(cards, null, 2), 'utf8');

  console.log('생성 완료:', fileName);
}
generate();
