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
      console.error('날씨 정보를 가져오는 중 오류 (텍스트 응답일 수 있음):', err);
      return null;
    }
  }

  try {
    // 1단계: 공공데이터포털 API에서 데이터 가져오기 (더 많은 양을 가져오도록 확대)
    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=500&returnType=JSON&serviceKey=${PUBLIC_DATA_API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      console.log('가져온 데이터가 없습니다.');
      return;
    }

    // 카테고리별 성격에 맞게 데이터 분류 및 필터링 (용인 최우선)
    let targetItems = result.data.filter(item => {
      const serviceName = item['서비스명'] || '';
      const agencyName = item['소관기관명'] || '';
      const summary = item['서비스목적요약'] || '';
      const target = item['지원대상'] || '';

      // 1. 용인 관련 키워드 체크 (이름, 기관, 요약, 대상 등 어디라도 있으면 통과)
      const isYongin = serviceName.includes('용인') || 
                       agencyName.includes('용인') || 
                       summary.includes('용인') || 
                       target.includes('용인');

      if (isYongin) return true;
      
      // 2. 지역행사/관광 정보 확장 (축제, 행사, 공연, 관광, 박물관, 미술관, 도서관, 전시)
      const isCulture = serviceName.includes('행사') || serviceName.includes('축제') || 
                        serviceName.includes('공연') || serviceName.includes('관광') ||
                        serviceName.includes('박물관') || serviceName.includes('미술관') ||
                        serviceName.includes('도서관') || serviceName.includes('전시');

      if (isCulture) return true; 

      // 3. 경기도 단위 정보 (지원금 등 혜택 위주)
      const isGyeonggi = serviceName.includes('경기') || agencyName.includes('경기');
      if (isGyeonggi) return true;

      return false;
    });

    console.log(`총 ${result.data.length}개 중 ${targetItems.length}개의 데이터를 용인 중심 필터링으로 선정했습니다.`);

    // 홈페이지에 이미 게시된 글 제목들 가져오기
    const postsDir = path.join(__dirname, '../src/content/posts');
    const existingFiles = fs.readdirSync(postsDir);
    const postTitles = existingFiles.map(file => {
      if (!file.endsWith('.md')) return '';
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const titleMatch = content.match(/title:\s*"(.*)"/) || content.match(/title:\s*(.*)/);
      return titleMatch ? titleMatch[1].replace(/[^\wㄱ-ㅎ가-힣]/g, '') : '';
    }).filter(t => t !== '');

    console.log(`홈페이지에서 ${postTitles.length}개의 기존 게시글 제목을 확인했습니다.`);

    const weatherInfo = await fetchWeather('Yongin');
    let addedCount = 0;

    for (const item of targetItems) {
      const serviceNameRaw = item['서비스명'] || '';
      const serviceNameClean = serviceNameRaw.replace(/[^\wㄱ-ㅎ가-힣]/g, '');

      // 1. local-info.json 데이터와 비교
      const isInData = localData.events.some(e => (e.name || '').replace(/[^\wㄱ-ㅎ가-힣]/g, '').includes(serviceNameClean.substring(0, 10))) ||
                       localData.benefits.some(b => (b.name || '').replace(/[^\wㄱ-ㅎ가-힣]/g, '').includes(serviceNameClean.substring(0, 10)));
      
      // 2. 실제 게시글(마크다운) 제목과 비교
      const isInPosts = postTitles.some(pt => pt.includes(serviceNameClean.substring(0, 10)) || serviceNameClean.includes(pt.substring(0, 10)));

      if (isInData || isInPosts) {
        // console.log(`- 중복 제외: ${serviceNameRaw}`);
        continue;
      }

      // 3단계: Gemini AI로 가공 (v1 엔드포인트 및 최신 모델 사용)
      const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: 'event' 또는 'grant' 또는 'info' 또는 'book', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
- 지원금/복지/혜택이며 지금 신청 가능하면 'grant'
- 축제/행사/공연/관광지/박물관/전시면 'event'
- 용인시 도서관 정보나 도서 관련 소식이면 'book'
- 그 외 실생활에 유용한 정보(생활꿀팁 등)는 'info'
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터 내용:
${JSON.stringify(item)}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
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
