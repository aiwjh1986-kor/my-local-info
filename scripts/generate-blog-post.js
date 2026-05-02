const fs = require('fs');
const path = require('path');

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
  
  // 1단계: 최신 데이터 확인
  const allItems = [...localData.events, ...localData.benefits];
  if (allItems.length === 0) {
    console.log('가공할 데이터가 없습니다.');
    return;
  }

  // ID와 상관없이 가장 마지막에 추가된 항목을 찾기 위해 간단히 배열 끝을 선택
  // (실제 로직상 push로 추가하므로 마지막이 최신)
  const latestItem = allItems[allItems.length - 1];

  // 기존 파일들과 비교해서 이미 같은 name으로 글이 있는지 확인
  const existingFiles = fs.readdirSync(postsDir);
  for (const file of existingFiles) {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      if (content.includes(`title: "${latestItem.name}"`) || content.includes(`title: '${latestItem.name}'`)) {
        console.log('이미 작성된 글입니다.');
        return;
      }
    }
  }

  // 2단계: Gemini AI로 블로그 글 생성
  const today = new Date().toISOString().split('T')[0];
  const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: ${today}-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    if (!result.candidates) {
      console.error('Gemini API 응답 오류:', JSON.stringify(result));
      return;
    }

    let aiResponse = result.candidates[0].content.parts[0].text;

    // 3단계: 파일 저장
    const fileNameMatch = aiResponse.match(/FILENAME:\s*(.+)$/m);
    if (!fileNameMatch) {
      console.error('파일명(FILENAME)을 찾을 수 없습니다.');
      return;
    }

    let fileName = fileNameMatch[1].trim();
    if (!fileName.endsWith('.md')) fileName += '.md';

    // 파일명 줄 제외하고 본문만 추출
    const content = aiResponse.replace(/FILENAME:\s*.+$/m, '').trim();

    const finalPath = path.join(postsDir, fileName);
    fs.writeFileSync(finalPath, content, 'utf8');
    console.log(`블로그 글 생성 완료: ${fileName}`);

  } catch (error) {
    console.error('글 생성 중 오류 발생:', error);
  }
}

generateBlogPost();
