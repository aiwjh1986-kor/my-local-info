const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function generateBlogPosts() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const postsDir = path.join(__dirname, '../src/content/posts');
  const localInfoPath = path.join(__dirname, '../public/data/local-info.json');

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY가 없습니다.');
    return;
  }

  try {
    const localInfo = JSON.parse(fs.readFileSync(localInfoPath, 'utf8'));
    // events와 benefits 합치기
    const allItems = [...(localInfo.events || []), ...(localInfo.benefits || [])];
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // 날짜 기반 필터링: 종료된 행사는 제외
    const activeItems = allItems.filter(item => {
      const endDate = item.endDate || item.date;
      if (endDate && endDate !== '상시' && endDate !== '2099-12-31') {
        const d = new Date(endDate);
        // 날짜만 비교하기 위해 시간을 0으로 설정
        d.setHours(23, 59, 59, 999); 
        if (d < now) return false;
      }
      return true;
    });

    // 이미 작성된 글 제목 리스트 가져오기 (매 루프마다 갱신하지 않고 초기에 한 번)
    const existingFiles = fs.readdirSync(postsDir);
    const postTitles = existingFiles.map(file => {
      if (!file.endsWith('.md')) return '';
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)/);
      if (!titleMatch) return '';
      // 제목에서 특수문자 및 [용인] 등 말머리 제거 후 비교용 문자열 생성
      return titleMatch[1].replace(/\[.*?\]/g, '').replace(/[^\wㄱ-ㅎ가-힣]/g, '').trim();
    }).filter(t => t !== '');

    let generatedCount = 0;
    const MAX_POSTS_PER_RUN = 3; 

    for (const item of activeItems) {
      if (generatedCount >= MAX_POSTS_PER_RUN) break;

      const itemNameRaw = item.name || item.title || '';
      // 비교용 이름 생성 (말머리 제거 및 특수문자 제거)
      const itemNameClean = itemNameRaw.replace(/\[.*?\]/g, '').replace(/[^\wㄱ-ㅎ가-힣]/g, '').trim();
      if (!itemNameClean) continue;

      // 이미 작성된 글인지 확인
      const isAlreadyWritten = existingFiles.some(file => item.id && file.includes(item.id)) || 
                               postTitles.some(pt => {
                                 // 매우 짧은 제목은 완전 일치만 확인
                                 if (pt.length < 5 || itemNameClean.length < 5) return pt === itemNameClean;
                                 
                                 // 제목의 전체 텍스트가 서로를 포함하는지 확인
                                 return pt.includes(itemNameClean) || itemNameClean.includes(pt);
                               });

      if (isAlreadyWritten) {
        // console.log(`  - 이미 작성된 포스트 스킵: ${itemNameRaw}`);
        continue;
      }

      console.log(`- 새로운 포스트 생성 중: ${itemNameRaw}`);

      const weatherText = item.weather
        ? `현재 용인 날씨: ${item.weather.desc}, 기온: ${item.weather.temp}°C`
        : '날씨 정보 없음';

      const prompt = `너는 '용인시 생활정보 및 여행가이드' 블로그의 전문 에디터 '루미'야.
아래 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(item)}
날씨: ${weatherText}

작성 지침:
1. 톤앤매너: 친절하고 상냥한 말투 (해요체).
2. 내용 구성: 흥미로운 도입부 -> 상세 내용 -> 루미의 추천 이유 3가지 -> 팁.
3. 형식: 마크다운 형식을 사용. 다른 설명 없이 마크다운 내용만 출력해.
4. 파일명 키워드: 글 마지막에 FILENAME_KEYWORD: [keyword] 형식으로 영문 키워드 1개를 꼭 포함해줘.

출력 형식:
---
title: "[용인] ${item.name || item.title}"
date: ${new Date().toISOString()}
summary: "${item.summary || '용인시 최신 소식을 전해드립니다.'}"
category: ${item.category === 'event' || item.category === '지역행사' ? '지역행사' : '생활정보'}
image: new_01.png
link: "${item.link || ''}"
tags: [용인시, 실생활정보, 루미가이드]
---

(본문 내용)`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        console.error('AI 응답 생성 실패');
        continue;
      }

      const keywordMatch = aiResponse.match(/FILENAME_KEYWORD:\s*([a-zA-Z0-9-]+)/);
      const keyword = keywordMatch ? keywordMatch[1].toLowerCase() : 'info';
      let cleanContent = aiResponse.replace(/FILENAME_KEYWORD:\s*.+$/, '').trim();
      if (cleanContent.startsWith('```markdown')) {
        cleanContent = cleanContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
      }

      const currentFiles = fs.readdirSync(postsDir);
      const todayFiles = currentFiles.filter(f => f.startsWith(today));
      let nextNum = todayFiles.length + 1;
      const nextNumStr = String(nextNum).padStart(2, '0');
      const fileName = `${today}-${nextNumStr}-${keyword}.md`;

      fs.writeFileSync(path.join(postsDir, fileName), cleanContent, 'utf8');
      console.log(`  - 생성 완료: ${fileName}`);
      generatedCount++;

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n총 ${generatedCount}개의 블로그 포스트를 생성했습니다.`);

  } catch (error) {
    console.error('블로그 생성 중 오류 발생:', error);
  }
}

generateBlogPosts();
