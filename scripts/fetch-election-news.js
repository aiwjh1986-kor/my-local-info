const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchElectionNews() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY가 없습니다.');
    return;
  }

  // 구글 뉴스 RSS: 용인 지방선거 검색 (최근 1일)
  const query = encodeURIComponent('"용인" "지방선거" when:1d');
  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko`;

  try {
    const response = await fetch(rssUrl);
    const text = await response.text();

    // 정규식으로 뉴스 아이템 추출
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const itemText = match[1];
      const titleMatch = itemText.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemText.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemText.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
          link: linkMatch[1].trim(),
          date: pubDateMatch ? pubDateMatch[1].trim() : ''
        });
      }
    }

    if (items.length === 0) {
      console.log('새로운 용인 지방선거 뉴스가 없습니다.');
      return;
    }

    const now = new Date();
    const dateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(now);
    const kstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const displayDate = `${kstDate.getFullYear()}년 ${kstDate.getMonth() + 1}월 ${kstDate.getDate()}일`;

    console.log(`용인 지방선거 뉴스 ${items.length}건 발견. AI 요약 생성 중...`);

    // 주요 뉴스 최대 10건만 요약
    const newsListStr = items.slice(0, 10).map((item, idx) => `${idx + 1}. 제목: ${item.title}\n   링크: ${item.link}`).join('\n\n');

    const prompt = `너는 '용인시 생활정보 및 여행가이드' 블로그의 전문 에디터야.
주의: '루미예요', '루미가 추천해요'와 같은 가상의 이름이나 오글거리는 인사말은 절대 넣지 마.
아래는 오늘 수집된 '용인시 지방선거' 관련 최신 뉴스 헤드라인들이야.

${newsListStr}

위 뉴스들을 바탕으로 용인시 주민들이 오늘의 지방선거 동향을 쉽게 알 수 있도록 블로그 포스트를 작성해줘.

작성 지침:
1. 톤앤매너: 친절하고 상냥한 말투 (해요체).
2. 분량: 한글 공백 포함 최소 1,500자 이상으로, 정치/사회적 의미와 깊이 있는 분석을 포함하여 매우 상세하고 길게 작성할 것.
3. 내용 구성: 도입부 -> 주요 뉴스 2~3가지 요약 및 해설 -> 마무리 (투표 및 지역 현안 관심 어필).
4. 형식: 마크다운 형식을 사용. HTML 태그 절대 금지.
5. 출력은 프론트매터를 포함한 완벽한 마크다운 파일 내용만 반환해. 다른 설명은 하지마.

출력 형식 예시:
---
title: "[용인시] ${displayDate} 용인 지방선거 최신 동향 요약 📰"
date: ${kstDate.toISOString()}
summary: "용인시 지방선거 관련 오늘의 주요 뉴스들을 알기 쉽게 요약해 드립니다!"
category: 생활정보
image: event/지방선거.png
tags: [용인시, 지방선거, 용인뉴스, 선거동향]
---

(여기에 뉴스 요약 및 본문 내용)
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await geminiResponse.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('AI 응답 생성 실패');
      return;
    }

    let cleanContent = aiResponse;
    if (cleanContent.startsWith('\`\`\`markdown')) {
      cleanContent = cleanContent.replace(/^\`\`\`markdown\n/, '').replace(/\n\`\`\`$/, '');
    }

    // 마크다운 파일 저장
    const postsDir = path.join(__dirname, '../src/content/posts');
    const existingFiles = fs.readdirSync(postsDir);
    const todayFiles = existingFiles.filter(f => f.startsWith(dateStr));
    
    let nextNum = 1;
    if (todayFiles.length > 0) {
      const numbers = todayFiles.map(f => {
        const match = f.match(new RegExp(`${dateStr}-(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      });
      nextNum = Math.max(...numbers) + 1;
    }
    const nextNumStr = String(nextNum).padStart(2, '0');
    const slug = `${dateStr}-${nextNumStr}-election-news`;
    const fileName = `${slug}.md`;
    fs.writeFileSync(path.join(postsDir, fileName), cleanContent, 'utf8');
    
    console.log(`지방선거 뉴스 포스트 생성 완료: ${fileName}`);

    // featured-cards.json 업데이트 (팝업에서 바로 상세 내용을 볼 수 있게)
    const featuredPath = path.join(__dirname, '../public/data/featured-cards.json');
    if (fs.existsSync(featuredPath)) {
      let featuredCards = JSON.parse(fs.readFileSync(featuredPath, 'utf8'));
      
      // 기존 선거 뉴스 카드 제거 (오늘 여러 번 돌릴 경우 중복 방지)
      featuredCards = featuredCards.filter(card => !card.slug || !card.slug.includes('election-news'));
      
      // 본문만 추출
      let bodyContent = cleanContent;
      const fmMatch = cleanContent.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
      if (fmMatch) {
        bodyContent = fmMatch[2].trim();
      }

      const electionDate = new Date('2026-06-03');
      const diffTime = electionDate - kstDate;
      const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dDayStr = dDay > 0 ? `(D-${dDay})` : dDay === 0 ? "(D-Day)" : "(종료)";

      const newCard = {
        category: "생활정보",
        title: `[용인시] ${dDayStr} ${displayDate} 용인 지방선거 최신 동향 요약 📰`,
        summary: "용인시 지방선거 관련 오늘의 주요 뉴스들을 알기 쉽게 요약해 드립니다!",
        content: bodyContent,
        date: dateStr,
        region: "용인시",
        image: "event/지방선거.png",
        slug: slug
      };
      
      featuredCards.unshift(newCard); // 맨 앞에 추가
      
      if (featuredCards.length > 10) {
        featuredCards = featuredCards.slice(0, 10);
      }
      
      fs.writeFileSync(featuredPath, JSON.stringify(featuredCards, null, 2), 'utf8');
      console.log(`메인 화면(featured-cards)에 선거 뉴스 정보가 가장 먼저 노출되도록 업데이트했습니다.`);
    }

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

fetchElectionNews();
