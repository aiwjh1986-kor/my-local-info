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
    // 1단계: 공공데이터포털 API에서 데이터 가져오기
    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=100&returnType=JSON&serviceKey=${PUBLIC_DATA_API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      console.log('가져온 데이터가 없습니다.');
      return;
    }

    // 필터링 규칙 적용
    const filterKeyword = (item, keyword) => {
      const serviceName = item['서비스명'] || '';
      const serviceSummary = item['서비스목적요약'] || '';
      const supportTarget = item['지원대상'] || '';
      const agencyName = item['소관기관명'] || '';
      
      return serviceName.includes(keyword) || 
             serviceSummary.includes(keyword) || 
             supportTarget.includes(keyword) || 
             agencyName.includes(keyword);
    };

    // 카테고리별 성격에 맞게 데이터 분류 및 필터링
    let targetItems = result.data.filter(item => {
      const serviceName = item['서비스명'] || '';
      const agencyName = item['소관기관명'] || '';
      const summary = item['서비스목적요약'] || '';

      // 1. 지원금: 용인시 정보 최우선
      if (serviceName.includes('지원') || serviceName.includes('수당') || serviceName.includes('혜택')) {
        return agencyName.includes('용인') || serviceName.includes('용인') || summary.includes('용인');
      }
      
      // 2. 지역행사: 전국 범위 (행사, 축제 키워드)
      if (serviceName.includes('행사') || serviceName.includes('축제') || serviceName.includes('공연')) {
        return true; // 전국 데이터 허용
      }

      // 3. 생활정보: 경기도/용인 범위
      return agencyName.includes('경기') || agencyName.includes('용인') || 
             serviceName.includes('경기') || serviceName.includes('용인');
    });

    console.log(`${targetItems.length}개의 데이터를 카테고리별 맞춤 필터링으로 선정했습니다.`);

    const weatherInfo = await fetchWeather('Yongin');
    let addedCount = 0;

    for (const item of targetItems) {
      const allExistingNames = [
        ...localData.events.map(e => e.name),
        ...localData.benefits.map(b => b.name)
      ];

      if (allExistingNames.includes(item['서비스명'])) {
        continue;
      }

      // 3단계: Gemini AI로 가공 (v1 엔드포인트 및 최신 모델 사용)
      const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: 'event' 또는 'grant' 또는 'info', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
- 지원금/복지/혜택이면 'grant' (주로 용인시 대상)
- 축제/행사/공연이면 'event' (전국 범위 가능)
- 그 외 경기도/용인의 유익한 소식은 'info' (생활정보)
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터 내용:
${JSON.stringify(item)}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const geminiResult = await geminiResponse.json();
      if (!geminiResult.candidates) {
        console.error("- AI 가공 오류:", JSON.stringify(geminiResult));
        continue;
      }

      let aiText = geminiResult.candidates[0].content.parts[0].text;
      aiText = aiText.replace(/```json|```/g, '').trim();
      const newItem = JSON.parse(aiText);
      
      if (weatherInfo) newItem.weather = weatherInfo;

      if (newItem.category === 'event') {
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
