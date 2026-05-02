const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function generateBlogPost() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('필요한 환경변수가 없습니다. (GEMINI_API_KEY)');
    return;
  }

  const dataFilePath = path.join(__dirname, '../public/data/local-info.json');
  const postsDir = path.join(__dirname, '../src/content/posts');
  
  if (!fs.existsSync(dataFilePath)) {
    console.error('데이터 파일이 없습니다.');
    return;
  }

  const localData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  
  try {
    const allItems = [...localData.events, ...localData.benefits];
    if (allItems.length === 0) {
      console.log('가공할 데이터가 없습니다.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    let generatedCount = 0;

    console.log(`- 현재 검사 중인 폴더: ${postsDir}`);
    const existingFiles = fs.readdirSync(postsDir);
    console.log(`- 감지된 기존 파일(${existingFiles.length}개): ${existingFiles.join(', ')}`);

    for (const item of allItems) {
      let isAlreadyPosted = false;
      for (const file of existingFiles) {
        if (file.endsWith('.md')) {
          const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
          if (content.includes(item.name)) {
            isAlreadyPosted = true;
            break;
          }
        }
      }

      if (isAlreadyPosted) {
        console.log(`- 이미 포스팅됨: ${item.name}`);
        continue;
      }

      console.log(`- 블로그 글 생성 중: ${item.name}`);

      const weatherText = item.weather 
        ? `현재 ${item.location || '지역'} 날씨: ${item.weather.desc}, 기온: ${item.weather.temp}°C` 
        : '날씨 정보 없음';

      const prompt = `너는 '용인시 생활정보 및 여행가이드' 블로그의 전문 에디터 '루미'야. 우리 블로그의 이름은 '루미의 우리동네 소식통'이야.
아래 공공서비스 정보와 실시간 날씨 정보를 바탕으로 주민들에게 도움이 되는 블로그 글을 작성해줘.

정보: ${JSON.stringify(item)}
날씨: ${weatherText}

작성 지침:
1. 톤앤매너: 아주 친절하고 상냥한 이웃집 언니/누나 같은 말투를 사용해줘 (해요체).
2. 타겟: 용인시 주민 혹은 전국 여행 정보를 찾는 사람들.
3. 내용 구성: 흥미로운 도입부 -> 서비스 상세 내용 -> 루미가 추천하는 이유 3가지 -> 신청 방법 및 꿀팁.
4. 날씨 정보 반영: 제공된 실시간 날씨 정보를 자연스럽게 섞어줘.
5. 루미 정체성: '루미'라는 이름을 본문에 한 번 이상 언급해줘.

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상)

글 맨 마지막에는 아래와 같이 실제 서비스로 연결되는 링크를 마크다운 형식으로 반드시 포함해줘:
👉 [공식 홈페이지에서 자세히 보기 및 신청하기](${item.link})

마지막 줄에 FILENAME: ${today}-${item.id} 형식으로 파일명도 출력해줘.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const result = await response.json();
      if (!result.candidates) {
        console.error(`- ${item.name} 생성 오류:`, JSON.stringify(result));
        continue;
      }

      let aiResponse = result.candidates[0].content.parts[0].text;
      const fileNameMatch = aiResponse.match(/FILENAME:\s*(.+)$/m);
      let fileName = fileNameMatch ? fileNameMatch[1].trim() : `${today}-${item.id}.md`;
      if (!fileName.endsWith('.md')) fileName += '.md';

      const content = aiResponse.replace(/FILENAME:\s*.+$/m, '').trim();
      fs.writeFileSync(path.join(postsDir, fileName), content, 'utf8');
      generatedCount++;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (generatedCount > 0) {
      console.log(`총 ${generatedCount}개의 새로운 블로그 포스팅이 생성되었습니다!`);
    } else {
      console.log('새로 생성할 포스팅이 없습니다.');
    }
  } catch (error) {
    console.error('글 생성 중 오류 발생:', error);
  }
}

generateBlogPost();
