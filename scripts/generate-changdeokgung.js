const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function generate() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const prompt = `너는 '용인시 생활정보 및 여행가이드' 블로그의 전문 에디터야.
오늘은 우리 지역 분들이 서울로 나들이 갈 때 아주 좋을 만한 고궁 행사를 소개하는 글을 쓸 거야.
아래 주어진 정보를 바탕으로 아주 길고 풍성하게, 한글 공백 포함 '최소 2000자 이상'의 분량으로 블로그 글을 작성해줘.

[제공된 정보]
행사명: 2026년 창덕궁 달빛기행(상반기)
일정: 2026. 4. 16. ~ 2026. 5. 31. (매주 목~일 운영)
시간: 1부(19:10, 19:15, 19:20), 2부(20:00, 20:05, 20:10)
장소: 창덕궁 일원
가격: 1인 30,000원
내용: 은은한 달빛 아래 청사초롱을 들고 창덕궁 후원을 거니는 특별한 야간 탐방. 대금 연주, 궁중정재 등 다채로운 전통예술공연 관람 포함.
예매: 티켓링크 사전 예매 필수

작성 지침:
1. 톤앤매너: 친절하고 다정한 말투 (해요체).
2. 분량: 한글 공백 포함 최소 2000자 이상. 정보가 부족하다면 용인에서 서울 안국역(창덕궁)까지 가는 교통편 꿀팁, 창덕궁 달빛기행만의 매력 포인트(청사초롱, 야경, 후원), 예매 성공 팁 등 상상력을 발휘하여 풍성하게 살을 붙여줘.
3. 구성: 흥미로운 도입부 -> 창덕궁 달빛기행 소개 -> 관람 포인트 (전통공연 등) -> 예매 방법 및 꿀팁 -> 용인에서 가는 길 및 주변 맛집 제안 -> 마무리
4. 주의: '루미예요', '가상의 이름'은 넣지 마.
5. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.

출력 형식:
---
title: "[서울 나들이] 티켓팅 필수! 2026 창덕궁 달빛기행 완벽 가이드 🌙"
date: 2026-05-30T10:00:00.000Z
summary: "용인에서 출발하는 로맨틱한 고궁 야간 나들이! 청사초롱 들고 걷는 창덕궁 달빛기행의 모든 것을 알려드립니다."
category: 지역행사
image: event/changdeokgung.png
tags: [창덕궁달빛기행, 고궁야간개장, 서울나들이, 주말데이트, 티켓링크예매]
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

  const fileName = '2026-05-30-02-changdeokgung.md';
  const targetDir = path.join(__dirname, '../src/content/posts/지역행사');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, fileName), cleanContent, 'utf8');

  // Add to featured-cards.json
  const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
  let cards = JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8'));
  cards.unshift({
    category: '지역행사',
    title: '[서울 나들이] 티켓팅 필수! 2026 창덕궁 달빛기행 완벽 가이드 🌙',
    summary: '용인에서 출발하는 로맨틱한 고궁 야간 나들이! 청사초롱 들고 걷는 창덕궁 달빛기행의 모든 것을 알려드립니다.',
    content: cleanContent.split('---')[2].trim().substring(0, 300) + '...',
    date: '2026-05-30',
    region: '서울 종로구',
    image: 'event/changdeokgung.png',
    slug: '2026-05-30-02-changdeokgung'
  });
  fs.writeFileSync(featuredCardsPath, JSON.stringify(cards, null, 2), 'utf8');

  console.log('생성 완료:', fileName);
}
generate();
