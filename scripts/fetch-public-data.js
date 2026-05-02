const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchPublicData() {
  const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!PUBLIC_DATA_API_KEY || !GEMINI_API_KEY) {
    console.error('필요한 환경변수가 없습니다. (PUBLIC_DATA_API_KEY 또는 GEMINI_API_KEY)');
    return;
  }

  const dataFilePath = path.join(__dirname, '../public/data/local-info.json');
  let localData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  // 날씨 정보 가져오기 함수 (wttr.in 사용)
  async function fetchWeather(location = 'Yongin') {
    try {
      const weatherUrl = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
      const res = await fetch(weatherUrl);
      const weatherData = await res.json();
      const current = weatherData.current_condition[0];
      return {
        temp: current.temp_C,
        desc: current.lang_ko ? current.lang_ko[0].value : current.weatherDesc[0].value,
        humidity: current.humidity
      };
    } catch (err) {
      console.error('날씨 정보를 가져오는 중 오류:', err);
      return null;
    }
  }

  try {
    // 1단계: 공공데이터포털 API에서 데이터 가져오기 (더 많이 가져오기)
    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=100&returnType=JSON&serviceKey=${PUBLIC_DATA_API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      console.log('가져온 데이터가 없습니다.');
      return;
    }

    // 필터링 규칙 적용 (여러 개 찾기)
    const filterKeyword = (item, keyword) => {
      return (item.서비스명 && item.서비스명.includes(keyword)) ||
             (item.서비스목적요약 && item.서비스목적요약.includes(keyword)) ||
             (item.지원대상 && item.지원대상.includes(keyword)) ||
             (item.소관기관명 && item.소관기관명.includes(keyword));
    };

    // 용인 또는 경기 또는 전국 공통 정보를 모두 수집
    const targetItems = result.data.filter(item => 
      filterKeyword(item, '용인') || 
      filterKeyword(item, '경기')
    );

    if (targetItems.length === 0) {
      console.log('조건에 맞는 데이터가 없습니다.');
      return;
    }

    console.log(`${targetItems.length}개의 후보 데이터를 발견했습니다.`);

    // 2단계: 기존 데이터와 비교 및 루프 실행
    const weatherInfo = await fetchWeather('Yongin');
    let addedCount = 0;

    for (const item of targetItems) {
      const allExistingNames = [
        ...localData.events.map(e => e.name),
        ...localData.benefits.map(b => b.name)
      ];

      if (allExistingNames.includes(item.서비스명)) {
        continue; // 이미 있으면 건너뛰기
      }

      // 3단계: Gemini AI로 가공
      const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터 내용:
${JSON.stringify(item)}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const geminiResult = await geminiResponse.json();
      if (!geminiResult.candidates) continue;

      let aiText = geminiResult.candidates[0].content.parts[0].text;
      aiText = aiText.replace(/```json|```/g, '').trim();
      const newItem = JSON.parse(aiText);
      
      if (weatherInfo) newItem.weather = weatherInfo;

      // ID 부여
      if (newItem.category === '행사') {
        newItem.id = `e${localData.events.length + 1}`;
        localData.events.push(newItem);
      } else {
        newItem.id = `b${localData.benefits.length + 1}`;
        localData.benefits.push(newItem);
      }
      addedCount++;
      console.log(`- 데이터 추가 중: ${newItem.name}`);
    }

    if (addedCount > 0) {
      localData.lastUpdate = new Date().toISOString().split('T')[0];
      fs.writeFileSync(dataFilePath, JSON.stringify(localData, null, 2), 'utf8');
      console.log(`총 ${addedCount}개의 새로운 데이터를 추가했습니다!`);
    } else {
      console.log('새로 추가할 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

fetchPublicData();
