const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchGasPrices() {
  const OPINET_API_KEY = process.env.OPINET_API_KEY;

  if (!OPINET_API_KEY) {
    console.error('OPINET_API_KEY가 없습니다.');
    return;
  }

  // 항상 한국 시간(KST) 기준 날짜 생성
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(now);
  const kstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const displayDate = `${kstDate.getFullYear()}년 ${kstDate.getMonth() + 1}월 ${kstDate.getDate()}일`;

  try {
    console.log('용인시 구별 주유소 가격 정보 가져오는 중 (좌표 기반)...');

    
    // 각 구별 중심 좌표 (오피넷 KATEC 좌표계)
    const districtPoints = [
      { name: '수지구1', x: 318841, y: 524163 }, // 수지구청 인근
      { name: '수지구2', x: 319600, y: 521800 }, // 상현동 인근
      { name: '수지구3', x: 317500, y: 525500 }, // 동천/신봉 인근
      { name: '기흥구', x: 322332, y: 517079 }, // 기흥역 인근
      { name: '처인구', x: 330149, y: 513973 }  // 처인구청 인근
    ];

    const districts = {
      '수지구': [],
      '기흥구': [],
      '처인구': []
    };

    // 각 좌표 주변 5km 이내의 모든 주유소 수집
    for (const point of districtPoints) {
      console.log(`${point.name} 주변 데이터 수집 중...`);
      const url = `http://www.opinet.co.kr/api/aroundAll.do?out=json&code=${OPINET_API_KEY}&x=${point.x}&y=${point.y}&radius=5000&prodcd=B027`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`API 호출 실패 (${point.name}): ${response.status}`);
        continue;
      }
      const data = await response.json();
      
      if (data.RESULT && data.RESULT.OIL) {
        // 상위 15개에 대해서만 주소 확인 (검색 범위 확대)
        const topCandidates = data.RESULT.OIL.slice(0, 15);
        
        for (const candidate of topCandidates) {
          // 이미 찾은 주유소면 건너뜀
          if (Object.values(districts).flat().find(d => d.UNI_ID === candidate.UNI_ID)) continue;

          console.log(`  - 주유소 상세 정보 확인 중: ${candidate.OS_NM}`);
          const detailUrl = `http://www.opinet.co.kr/api/detailById.do?out=json&code=${OPINET_API_KEY}&id=${candidate.UNI_ID}`;
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();
          
          if (detailData.RESULT && detailData.RESULT.OIL && detailData.RESULT.OIL[0]) {
            const oil = detailData.RESULT.OIL[0];
            const address = oil.VAN_ADR || oil.NEW_ADR || '';
            
            let district = '';
            // 구 이름이 직접 포함된 경우 우선
            if (address.includes('수지구')) district = '수지구';
            else if (address.includes('기흥구')) district = '기흥구';
            else if (address.includes('처인구')) district = '처인구';
            
            // 구 이름이 없고 동 이름만 있는 경우 보정
            if (!district) {
              if (/풍덕천|죽전|동천|상현|성복|신봉|고기/.test(address)) district = '수지구';
              else if (/신갈|구갈|상갈|하갈|보정|마북|언남|청덕|영덕|기흥|서농|구성/.test(address)) district = '기흥구';
              else if (/역북|삼가|남동|유방|고림|마평|운학|호동|해곡|포곡|모현|남사|이동|원삼|백암|양지/.test(address)) district = '처인구';
            }
            
            if (district && districts[district]) {
              districts[district].push({
                OS_NM: oil.OS_NM,
                PRICE: candidate.PRICE, // aroundAll의 가격 사용
                VAN_ADR: address,
                UNI_ID: oil.UNI_ID
              });
            }
          }
        }
      }
    }


    // 각 구별로 가격순 정렬
    for (const name in districts) {
      districts[name].sort((a, b) => a.PRICE - b.PRICE);
    }


    const title = `[용인시] ${displayDate} 구별 주유소 최저가 TOP 5 정보 (휘발유)`;
    const summary = `오늘 우리 동네에서 기름값이 가장 저렴한 곳은 어디일까요? 수지, 기흥, 처인구별 최저가 정보를 전해드립니다!`;

    // 블로그 포스트 내용(본문) 생성
    let bodyContent = `안녕하세요, 용인시의 알뜰한 소식통입니다! 😊

매일매일 변하는 기름값 때문에 고민 많으시죠? 오늘은 **${displayDate}** 기준, 용인시 각 구별 휘발유 최저가 주유소 TOP 5를 정리했습니다! 

주유하시기 전에 꼭 확인하시고 조금이라도 더 알뜰하게 주유하세요! ⛽✨

---

`;

    for (const [name, list] of Object.entries(districts)) {

      bodyContent += `### 📍 ${name} 최저가 주유소\n\n`;
      if (list.length > 0) {
        list.slice(0, 5).forEach((oil, idx) => {
          bodyContent += `${idx + 1}. **${oil.OS_NM}**: **${oil.PRICE.toLocaleString()}원**\n`;
          bodyContent += `   - 주소: ${oil.VAN_ADR}\n`;
        });
      } else {
        bodyContent += `* 해당 지역의 오늘 데이터가 아직 업데이트되지 않았습니다.\n`;
      }
      bodyContent += `\n`;
    }

    bodyContent += `---

### 💡 알뜰 주유 꿀팁!
1. **지역화폐 활용**: '용인와이페이' 가맹점인 주유소를 이용하면 추가 혜택을 받을 수 있어요!
2. **오전 주유**: 기온이 낮은 오전에 주유하면 조금 더 이득이라는 점!
3. **정속 주행**: 급출발, 급제동을 삼가면 기름을 더 아낄 수 있습니다. 😊

오늘도 알뜰하고 행복한 하루 되세요! ❤️🐰

---
*본 정보는 오피넷(Opinet) 실시간 API 데이터를 바탕으로 작성되었습니다.*
`;

    // 블로그 포스트 전체 내용 조립
    let content = `---
title: "${title}"
date: ${kstDate.toISOString()}
summary: "${summary}"
category: 생활정보
image: info-gas.png
tags: [용인시, 최저가주유소, 기름값정보, 수지구, 기흥구, 처인구]
---

${bodyContent}`;

    // 1. 블로그 포스트 저장
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
    const slug = `${dateStr}-${nextNumStr}-gas-prices`;
    const fileName = `${slug}.md`;
    fs.writeFileSync(path.join(postsDir, fileName), content, 'utf8');
    
    console.log(`기름값 블로그 포스트 생성 완료: ${fileName}`);

    // 2. featured-cards.json 업데이트 (맨 앞으로 보내기)
    const featuredPath = path.join(__dirname, '../public/data/featured-cards.json');
    if (fs.existsSync(featuredPath)) {
      let featuredCards = JSON.parse(fs.readFileSync(featuredPath, 'utf8'));
      
      // 기존 주유소 카드 제거 (중복 방지)
      featuredCards = featuredCards.filter(card => !card.slug.includes('gas-prices'));
      
      // 새 주유소 카드 생성
      const newCard = {
        category: "생활정보",
        title: title,
        summary: summary,
        content: bodyContent,
        date: dateStr,
        region: "용인시",
        image: "info-gas.png",
        slug: slug
      };
      
      // 맨 앞에 추가
      featuredCards.unshift(newCard);
      
      // 최대 개수 제한 (예: 10개)
      if (featuredCards.length > 10) {
        featuredCards = featuredCards.slice(0, 10);
      }
      
      fs.writeFileSync(featuredPath, JSON.stringify(featuredCards, null, 2), 'utf8');
      console.log(`메인 화면(featured-cards)에 주유소 정보가 가장 먼저 노출되도록 업데이트했습니다.`);
    }

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

fetchGasPrices();
