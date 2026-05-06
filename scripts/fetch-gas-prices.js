const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function fetchGasPrices() {
  const OPINET_API_KEY = process.env.OPINET_API_KEY;

  if (!OPINET_API_KEY) {
    console.error('OPINET_API_KEY가 없습니다.');
    return;
  }

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const displayDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  try {
    console.log('용인시 전체 주유소 가격 정보 가져오는 중...');
    
    const url = `http://www.opinet.co.kr/api/lowTop10.do?out=json&code=${OPINET_API_KEY}&area=0220&prodcd=B027`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.RESULT || !data.RESULT.OIL || data.RESULT.OIL.length === 0) {
      console.log('가져온 주유소 정보가 없습니다.');
      return;
    }

    const oils = data.RESULT.OIL;
    const districts = {
      '수지구': [],
      '기흥구': [],
      '처인구': []
    };

    oils.forEach(oil => {
      let district = '기타';
      if (oil.VAN_ADR.includes('수지구')) district = '수지구';
      else if (oil.VAN_ADR.includes('기흥구')) district = '기흥구';
      else if (oil.VAN_ADR.includes('처인구')) district = '처인구';
      
      if (districts[district]) {
        districts[district].push(oil);
      }
    });

    // 블로그 포스트 생성
    let content = `---
title: "[용인시] ${displayDate} 구별 주유소 최저가 TOP 5 정보 (휘발유 기준)"
date: ${today.toISOString()}
summary: "오늘 우리 동네에서 기름값이 가장 저렴한 곳은 어디일까요? 수지, 기흥, 처인구별 최저가 주유소 정보를 루미가 정리해 드립니다!"
category: 생활정보
image: info-gas.png
tags: [용인시, 최저가주유소, 기름값정보, 수지구, 기흥구, 처인구]
---

안녕하세요, 용인시의 알뜰한 소식통 루미입니다! 😊

매일매일 변하는 기름값 때문에 주유소 앞에서 망설이셨던 적 많으시죠? 오늘은 **${displayDate}** 기준, 용인시 각 구별로 휘발유 가격이 가장 저렴한 주유소 TOP 5를 가져왔습니다! 

주유하시기 전에 꼭 확인하시고 조금이라도 더 알뜰하게 주유하세요! ⛽✨

---

`;

    for (const [name, list] of Object.entries(districts)) {
      content += `### 📍 ${name} 최저가 주유소\n\n`;
      if (list.length > 0) {
        list.slice(0, 5).forEach((oil, idx) => {
          content += `${idx + 1}. **${oil.OS_NM}**: <span style="color: #2563eb; font-weight: bold;">${oil.PRICE.toLocaleString()}원</span>\n`;
          content += `   - 주소: ${oil.VAN_ADR}\n`;
        });
      } else {
        content += `* 해당 지역의 오늘 데이터가 아직 업데이트되지 않았습니다.\n`;
      }
      content += `\n`;
    }

    content += `---

### 💡 루미의 알뜰 주유 꿀팁!
1. **지역화폐 활용**: '용인와이페이' 가맹점인 주유소를 이용하면 추가 혜택을 받을 수 있어요!
2. **오전 주유**: 기온이 낮은 오전에 주유하면 기름의 밀도가 높아져 아주 미세하게나마 더 많이 들어간다는 사실, 알고 계셨나요?
3. **정속 주행**: 가장 좋은 절약법은 역시 급출발, 급제동을 삼가는 경제 운전이겠죠? 😊

오늘도 루미와 함께 알뜰하고 행복한 하루 되세요! 다음에 또 알찬 소식으로 찾아오겠습니다! ❤️🐰

---
*본 정보는 오피넷(Opinet) 실시간 API 데이터를 바탕으로 작성되었습니다.*
`;

    const fileName = `${dateStr}-gas-prices.md`;
    const postsDir = path.join(__dirname, '../src/content/posts');
    fs.writeFileSync(path.join(postsDir, fileName), content, 'utf8');
    
    console.log(`기름값 블로그 포스트 생성 완료: ${fileName}`);

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

fetchGasPrices();
