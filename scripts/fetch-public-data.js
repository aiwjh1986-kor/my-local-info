const fs = require('fs');
const path = require('path');
const { getAllFilesRecursive } = require('./utils');
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const text = await res.text();
      try {
        const weatherData = JSON.parse(text);
        const current = weatherData.current_condition[0];
        return {
          temp: current.temp_C,
          desc: current.lang_ko ? current.lang_ko[0].value : current.weatherDesc[0].value,
          humidity: current.humidity
        };
      } catch (parseErr) {
        // wttr.in이 가끔 JSON이 아닌 텍스트(오류 메시지 등)를 보낼 때가 있음
        console.warn('날씨 데이터 파싱 실패 (JSON이 아님):', text.substring(0, 50));
        return null;
      }
    } catch (err) {
      console.error('날씨 정보를 가져오는 중 오류 발생:', err.message);
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

      // 제외어 (지원금, 지원사업, 수계 등 아이와 무관한 행정/지원 제외)
      if (serviceName.includes('지원사업') || serviceName.includes('지원금') || serviceName.includes('수계') || serviceName.includes('수당') || serviceName.includes('융자')) {
        return false;
      }

      // 1. 용인 및 근교(수원, 성남, 광주, 화성) 관련 키워드 체크
      const isYongin = serviceName.includes('용인') || agencyName.includes('용인') || summary.includes('용인') || target.includes('용인');
      const isSuwon = serviceName.includes('수원') || agencyName.includes('수원') || summary.includes('수원') || target.includes('수원');
      const isSeongnam = serviceName.includes('성남') || agencyName.includes('성남') || summary.includes('성남') || target.includes('성남');
      const isGwangju = serviceName.includes('경기 광주') || agencyName.includes('경기 광주') || summary.includes('경기 광주') || target.includes('경기 광주') || agencyName.includes('경기도 광주시');
      const isHwaseong = serviceName.includes('화성') || agencyName.includes('화성') || summary.includes('화성') || target.includes('화성');

      const isTargetArea = isYongin || isSuwon || isSeongnam || isGwangju || isHwaseong;
      
      // 2. 문화/지역행사/관광 정보 확장
      const isCulture = serviceName.includes('행사') || serviceName.includes('축제') || 
                        serviceName.includes('공연') || serviceName.includes('관광') ||
                        serviceName.includes('박물관') || serviceName.includes('미술관') ||
                        serviceName.includes('도서관') || serviceName.includes('전시');

      // 3. 아이/가족/체험 중심 정보
      const isKids = serviceName.includes('어린이') || serviceName.includes('가족') || 
                     serviceName.includes('체험') || serviceName.includes('유아') || 
                     summary.includes('어린이') || summary.includes('가족');

      // 해당 지역이면서 문화행사이거나 아이 관련 행사인 경우만 통과
      if (isTargetArea && (isCulture || isKids)) return true;

      return false;
    });

    console.log(`총 ${result.data.length}개 중 ${targetItems.length}개의 데이터를 용인 중심 필터링으로 선정했습니다.`);

    // 홈페이지에 이미 게시된 글 제목들 가져오기
    const postsDir = path.join(__dirname, '../src/content/posts');
    const existingFilesPaths = getAllFilesRecursive(postsDir);
    const postTitles = existingFilesPaths.map(filePath => {
      if (!filePath.endsWith('.md')) return '';
      const content = fs.readFileSync(filePath, 'utf8');
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
      const dateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(new Date());
      localData.lastUpdate = dateStr;
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
