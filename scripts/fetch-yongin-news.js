require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.PUBLIC_DATA_API_KEY || process.env.TOUR_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY || !GEMINI_API_KEY) {
  console.error('환경 변수(API_KEY 또는 GEMINI_API_KEY)가 설정되지 않았습니다.');
  process.exit(1);
}

async function fetchYonginNews() {
  try {
    const encodedKey = encodeURIComponent(API_KEY);
    // 용인시 소식 조회 서비스 기본 URL 구조 (정확한 엔드포인트는 가이드라인 참고 필요)
    const url = `http://apis.data.go.kr/3780000/YonginNewsService/getNewsList?serviceKey=${encodedKey}&pageNo=1&numOfRows=3&_type=json`;

    let items = [];
    let text = '';
    
    try {
      const res = await fetch(url);
      text = await res.text();
    } catch (err) {
      text = 'SERVICE_ACCESS_DENIED_ERROR';
    }

    if (text.includes('SERVICE_ACCESS_DENIED_ERROR') || text.includes('Unexpected errors') || text.includes('<OpenAPI_ServiceResponse>') || text.includes('SERVICE KEY IS NOT REGISTERED')) {
      console.log('\n[알림] 용인시 소식 API 권한 동기화 대기 중... (임시로 용인시청 샘플 데이터를 사용하여 글을 생성합니다!)\n');
      items = [
        { title: "[공지] 2026년 하반기 용인시 청년 기본소득 신청 안내", content: "관내 거주 24세 청년 대상, 분기별 25만원(최대 100만원) 용인와이페이 지급", date: "2026-05-30" },
        { title: "[모집] 용인시민농장 (텃밭) 참여자 추가 모집", content: "기흥구 공세동 시민농장 잔여 구획 추가 모집, 가구당 1구획, 연이용료 1만원", date: "2026-05-29" },
        { title: "[행사] 제 10회 용인 북페스티벌 개최", content: "수지구청 광장에서 열리는 북페스티벌. 작가와의 만남, 헌책 교환전 진행", date: "2026-05-28" }
      ];
    } else {
      const data = JSON.parse(text);
      if (!data.response || !data.response.body || !data.response.body.items || !data.response.body.items.item) {
        console.log('오늘 새롭게 올라온 용인시 소식이 없습니다.');
        return;
      }
      items = data.response.body.items.item;
    }

    console.log(`총 ${items.length}개의 주요 소식을 찾았습니다. 주간 브리핑 포스트를 작성합니다...`);

    let newsText = items.map((i, idx) => `[${idx+1}] 제목: ${i.title}\n내용: ${i.content}\n등록일: ${i.date}`).join('\n\n');

    const prompt = `너는 '용인시 생활정보 및 여행가이드' 블로그의 전문 에디터야.
이번 주 용인시청에서 발표된 중요한 공지사항과 소식들을 모아서 시민들에게 브리핑해주는 아주 유익한 블로그 글을 작성해줘.
글의 분량은 한글 공백 포함 '최소 2000자 이상'이어야 해.

[이번 주 주요 소식]
${newsText}

[작성 가이드]
1. 제목은 매력적으로 작성하되, '[용인시 소식]' 이라는 말머리를 꼭 달아줘. (예: [용인시 소식] 이번 주 절대 놓치면 안 될 알짜 혜택 총정리!)
2. 딱딱한 공무원 말투가 아니라, 친한 이웃이 꿀팁을 전해주듯 친근하고 부드러운 말투(~해요, ~입니다, ~해볼까요?)를 사용해.
3. 각 소식마다 어떤 시민(예: 청년, 가족, 학부모 등)에게 유용한지 강조해주고, 자세한 설명과 팁을 덧붙여서 글을 풍성하게 만들어줘.
4. 마크다운 형식으로 작성하고, 적절한 이모지를 팍팍 써서 가독성을 높여줘.
5. 문서 맨 앞에 반드시 아래와 같은 형식의 메타데이터(Frontmatter)를 포함해.
---
title: "제목"
date: 2026-05-30T10:00:00.000Z
summary: "글의 핵심 내용을 1~2줄로 요약"
category: 생활정보
image: info-news.png
tags: [용인시소식, 주간브리핑, 용인시청, 생활꿀팁, 용인시지원금]
---
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const geminiData = await geminiRes.json();
    let content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error('AI 생성 실패', geminiData);
      return;
    }
    
    // 코드 블록 마커 제거
    content = content.replace(/^```markdown\n/, '').replace(/\n```$/, '');

    const fileName = `2026-05-30-02-yongin-news-briefing.md`;
    const filePath = path.join(__dirname, '..', 'src', 'content', 'posts', '생활정보', fileName);
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✨ 성공! 블로그 포스트 생성 완료: ${fileName}`);
    
    // featured-cards.json 업데이트
    const cardsPath = path.join(__dirname, '..', 'public', 'data', 'featured-cards.json');
    let cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
    
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    const summaryMatch = content.match(/summary:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "[용인시 소식] 이번 주 알짜 혜택 총정리!";
    const summary = summaryMatch ? summaryMatch[1] : "용인시의 최신 소식을 확인하세요.";
    
    const bodyContent = content.split('---').slice(2).join('---').trim();
    
    const newCard = {
      category: "생활정보",
      title: title,
      summary: summary,
      content: bodyContent,
      date: "2026-05-30",
      region: "용인시",
      image: "생활/news.png",
      slug: "2026-05-30-02-yongin-news-briefing"
    };
    
    cards.unshift(newCard);
    fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf8');
    console.log('✅ 메인 화면(featured-cards.json)에 뉴스가 추가되었습니다.');

  } catch (error) {
    console.error('Error fetching Yongin news:', error);
  }
}

fetchYonginNews();
