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
    const items = localInfo.items || [];
    const today = new Date().toISOString().split('T')[0];

    let generatedCount = 0;

    for (const item of items) {
      // 이미 작성된 글인지 확인 (중복 방지)
      const existingFiles = fs.readdirSync(postsDir);
      const isAlreadyWritten = existingFiles.some(file => 
        file.includes(item.id) || (item.title && file.toLowerCase().includes(item.title.replace(/\s+/g, '-').toLowerCase()))
      );

      if (isAlreadyWritten) {
        console.log(`- [건너뜀] 이미 작성된 글입니다: ${item.title}`);
        continue;
      }

      console.log(`- 블로그 글 생성 중: ${item.title}`);

      const weatherText = item.weather
        ? `현재 ${item.location || '지역'} 날씨: ${item.weather.desc}, 기온: ${item.weather.temp}°C`
        : '날씨 정보 없음';

      const prompt = `너는 '용인시 생활정보 및 여행가이드' 블로그의 전문 에디터 '루미'야.
아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(item)}
날씨: ${weatherText}

작성 지침:
1. 톤앤매너: 친절하고 상냥한 이웃집 언니 같은 말투 (해요체).
2. 내용 구성: 흥미로운 도입부 -> 상세 내용 -> 루미의 추천 이유 3가지 -> 팁.
3. 형식: 마크다운 형식을 사용해줘. HTML 태그는 절대 사용하지 마.
4. 제목 키워드: 파일명에 사용할 영문 키워드(짧은 단어 2-3개)를 글 마지막에 FILENAME_KEYWORD: [keyword] 형식으로 꼭 출력해줘.

출력 형식:
---
title: [제목]
date: ${new Date().toISOString()}
summary: [한줄요약]
category: ${item.category || 'info'}
image: new_01.png
link: ${item.link}
tags: [태그1, 태그2]
---

(본문 800자 이상)

FILENAME_KEYWORD: [영문-키워드]`;

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

      // 키워드 추출 및 정규화
      const keywordMatch = aiResponse.match(/FILENAME_KEYWORD:\s*([a-zA-Z0-9-]+)/);
      const keyword = keywordMatch ? keywordMatch[1].toLowerCase() : 'news';
      const cleanContent = aiResponse.replace(/FILENAME_KEYWORD:\s*.+$/, '').trim();

      // 🆕 자동 번호 부여 로직
      const currentFiles = fs.readdirSync(postsDir);
      const todayFiles = currentFiles.filter(f => f.startsWith(today));
      
      let nextNum = 1;
      if (todayFiles.length > 0) {
        const numbers = todayFiles.map(f => {
          const m = f.match(new RegExp(`${today}-(\\d+)`));
          return m ? parseInt(m[1]) : 0;
        });
        nextNum = Math.max(...numbers) + 1;
      }
      const nextNumStr = String(nextNum).padStart(2, '0');
      const fileName = `${today}-${nextNumStr}-${keyword}.md`;

      fs.writeFileSync(path.join(postsDir, fileName), cleanContent, 'utf8');
      console.log(`  - 생성 완료: ${fileName}`);
      generatedCount++;

      // API 할당량 제한 방지를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`\n총 ${generatedCount}개의 블로그 포스트를 생성했습니다.`);

  } catch (error) {
    console.error('블로그 생성 중 오류 발생:', error);
  }
}

generateBlogPosts();
