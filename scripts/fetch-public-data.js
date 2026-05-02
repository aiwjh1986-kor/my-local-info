const fs = require('fs');
const path = require('path');

async function fetchPublicData() {
  const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!PUBLIC_DATA_API_KEY || !GEMINI_API_KEY) {
    console.error('필요한 환경변수가 없습니다. (PUBLIC_DATA_API_KEY 또는 GEMINI_API_KEY)');
    return;
  }

  const dataFilePath = path.join(__dirname, '../public/data/local-info.json');
  let localData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  try {
    // 1단계: 공공데이터포털 API에서 데이터 가져오기
    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${PUBLIC_DATA_API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      console.log('가져온 데이터가 없습니다.');
      return;
    }

    // 필터링 규칙 적용
    let targetItem = null;
    const filterKeyword = (item, keyword) => {
      return (item.서비스명 && item.서비스명.includes(keyword)) ||
             (item.서비스목적요약 && item.서비스목적요약.includes(keyword)) ||
             (item.지원대상 && item.지원대상.includes(keyword)) ||
             (item.소관기관명 && item.소관기관명.includes(keyword));
    };

    // 1. 용인 포함
    targetItem = result.data.find(item => filterKeyword(item, '용인'));
    // 2. 경기 포함
    if (!targetItem) {
      targetItem = result.data.find(item => filterKeyword(item, '경기'));
    }
    // 3. 전체 데이터 중 첫 번째 (전국 공통 등)
    if (!targetItem) {
      targetItem = result.data[0];
    }

    // 2단계: 기존 데이터와 비교
    const allExistingNames = [
      ...localData.events.map(e => e.name),
      ...localData.benefits.map(b => b.name)
    ];

    if (allExistingNames.includes(targetItem.서비스명)) {
      console.log('새로운 데이터가 없습니다. (이미 존재하는 항목)');
      return;
    }

    // 3단계: Gemini AI로 가공
    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터 내용:
${JSON.stringify(targetItem)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const geminiResult = await geminiResponse.json();
    let aiText = geminiResult.candidates[0].content.parts[0].text;
    
    // 마크다운 코드블록 제거
    aiText = aiText.replace(/```json|```/g, '').trim();
    const newItem = JSON.parse(aiText);

    // ID 부여 (기존 데이터 형식에 맞춰 b나 e 접두어 사용)
    const today = new Date().toISOString().split('T')[0];
    if (newItem.category === '행사') {
      newItem.id = `e${localData.events.length + 1}`;
      localData.events.push(newItem);
    } else {
      newItem.id = `b${localData.benefits.length + 1}`;
      localData.benefits.push(newItem);
    }
    
    localData.lastUpdate = today;

    // 4단계: 파일 저장
    fs.writeFileSync(dataFilePath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`추가 성공: ${newItem.name}`);

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

fetchPublicData();
