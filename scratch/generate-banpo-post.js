const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function generateBanpoPost() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('API 키가 설정되지 않았습니다.');
    return;
  }

  const prompt = `너는 블로그의 전문 에디터야.
주제: 서울 반포 한강공원 밤산책 (야간 산책) 가이드
작성 지침:
1. 톤앤매너: 친절하고 다정한 말투 (해요체). 초보자도 읽기 쉽고 꼼꼼한 정보형 글.
2. 분량: 한글 공백 포함 '최소 4000자 이상'으로 매우 길고 상세하게 작성해줘. 분량이 매우 중요해!
3. 이모지 금지: 글 전체에 걸쳐 이모지를 단 하나도 절대 사용하지 마. 오직 텍스트로만 작성해.
4. 내용 구성: 반포 한강공원 가는 법, 추천 산책 코스, 세빛섬 야경, 달빛무지개분수 운영 시간 및 명당자리, 밤산책 준비물, 주변 편의시설 등 정보 위주로 구체적으로 적어줘.
5. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.

출력 형식:
---
title: "[추천 코스] 서울 야경의 끝판왕, 반포 한강공원 완벽 밤산책 가이드"
date: 2026-07-29T20:00:00.000Z
summary: "선선한 여름밤, 서울 반포 한강공원에서 즐기는 완벽한 야간 산책 코스와 야경 감상 꿀팁을 소개합니다."
category: 추천코스
image: event/44.png
tags: [반포한강공원, 밤산책, 서울야경, 세빛섬, 무지개분수, 주말나들이]
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
    if (cleanContent.startsWith('\`\`\`markdown')) {
      cleanContent = cleanContent.replace(/^\`\`\`markdown\n/, '').replace(/\n\`\`\`$/, '');
    }

    const fileName = '2026-07-29-banpo-night-walk.md';
    const targetDir = path.join(__dirname, '../src/content/posts/추천코스');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    fs.writeFileSync(path.join(targetDir, fileName), cleanContent, 'utf8');

    // Update featured-cards.json
    const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
    let cards = fs.existsSync(featuredCardsPath) ? JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8')) : [];
    
    cards.unshift({
      category: '추천코스',
      title: '[추천 코스] 서울 야경의 끝판왕, 반포 한강공원 완벽 밤산책 가이드',
      summary: '선선한 여름밤, 서울 반포 한강공원에서 즐기는 완벽한 야간 산책 코스와 야경 감상 꿀팁을 소개합니다.',
      content: cleanContent.split('---')[2]?.trim().substring(0, 300) + '...',
      date: '2026-07-29',
      region: '서울',
      image: 'event/44.png',
      slug: '2026-07-29-banpo-night-walk'
    });
    
    fs.writeFileSync(featuredCardsPath, JSON.stringify(cards, null, 2), 'utf8');

    console.log(`성공! 포스트 생성 완료: ${fileName}`);
  } catch (error) {
    console.error('API 에러:', error);
  }
}

generateBanpoPost();
