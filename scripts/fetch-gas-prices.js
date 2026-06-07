const fs = require('fs');
const path = require('path');
const { getAllFilesRecursive } = require('./utils');
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
    const districtPoints = [
      { id: 'suji', name: '수지구', x: 318841, y: 524163 },
      { id: 'giheung', name: '기흥구', x: 322332, y: 517079 },
      { id: 'cheoin', name: '처인구', x: 330149, y: 513973 }
    ];

    const results = { suji: null, giheung: null, cheoin: null };

    for (const point of districtPoints) {
      console.log(`${point.name} 주변 데이터 수집 중...`);
      const brandMap = {
        'SKE': 'SK에너지', 'GSC': 'GS칼텍스', 'HDO': '현대오일뱅크', 'SOL': 'S-OIL',
        'RTE': '자가상표', 'FTX': '알뜰주유소', 'NHO': '농협알뜰'
      };

      // 1. 휘발유 (B027)
      const urlGas = `http://www.opinet.co.kr/api/aroundAll.do?out=json&code=${OPINET_API_KEY}&x=${point.x}&y=${point.y}&radius=5000&prodcd=B027`;
      const resGas = await fetch(urlGas);
      let gasData = null;
      if (resGas.ok) {
        const data = await resGas.json();
        if (data.RESULT && data.RESULT.OIL && data.RESULT.OIL.length > 0) {
          const cheapest = data.RESULT.OIL[0];
          gasData = {
            name: cheapest.OS_NM,
            price: cheapest.PRICE,
            brand: brandMap[cheapest.POLL_DIV_CD] || '일반주유소'
          };
        }
      }

      // 2. 경유 (D047)
      const urlDiesel = `http://www.opinet.co.kr/api/aroundAll.do?out=json&code=${OPINET_API_KEY}&x=${point.x}&y=${point.y}&radius=5000&prodcd=D047`;
      const resDiesel = await fetch(urlDiesel);
      let dieselData = null;
      if (resDiesel.ok) {
        const data = await resDiesel.json();
        if (data.RESULT && data.RESULT.OIL && data.RESULT.OIL.length > 0) {
          const cheapest = data.RESULT.OIL[0];
          dieselData = {
            dieselName: cheapest.OS_NM,
            dieselPrice: cheapest.PRICE,
            dieselBrand: brandMap[cheapest.POLL_DIV_CD] || '일반주유소'
          };
        }
      }

      if (gasData) {
        results[point.id] = { ...gasData, ...dieselData };
      } else {
        console.error(`API 호출 실패 (${point.name})`);
      }
    }

    const jsonContent = {
      success: true,
      timestamp: new Date().toISOString(),
      data: results
    };

    const targetPath = path.join(__dirname, '../public/data/gas-prices.json');
    fs.writeFileSync(targetPath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log('성공적으로 gas-prices.json 파일을 생성했습니다.');

    // --- 하이브리드: 검색 노출(SEO)을 위한 1일 1포스트 자동 생성 및 과거 글 삭제 --- //
    const title = `[용인시] ${displayDate} 구별 주유소 최저가 정보 (휘발유·경유)`;
    const summary = `오늘 우리 동네에서 기름값이 가장 저렴한 곳은 어디일까요? 수지, 기흥, 처인구별 실시간 최저가 정보를 전해드립니다!`;

    let bodyContent = `안녕하세요, 용인시의 알뜰한 소식통입니다! 😊\n\n매일매일 변하는 기름값 때문에 고민 많으시죠? 오늘은 **${displayDate}** 기준, 용인시 각 구별 휘발유 및 경유 최저가 주유소 정보를 알려드립니다!\n\n현재 메인 화면에서 실시간 주유소 전광판 위젯을 통해 가장 빠른 최저가 정보를 확인하실 수 있습니다. ⛽✨\n\n---\n\n`;

    for (const [name, list] of Object.entries(results)) {
      bodyContent += `### 📍 ${name === 'suji' ? '수지구' : name === 'giheung' ? '기흥구' : '처인구'} 최저가 주유소\n\n`;
      if (list) {
        bodyContent += `- **휘발유**: ${list.name} (**${list.price.toLocaleString()}원**, ${list.brand})\n`;
        if (list.dieselPrice) {
          bodyContent += `- **경유**: ${list.dieselName} (**${list.dieselPrice.toLocaleString()}원**, ${list.dieselBrand})\n`;
        }
      } else {
        bodyContent += `* 오늘 데이터가 아직 업데이트되지 않았습니다.\n`;
      }
      bodyContent += `\n`;
    }

    bodyContent += `---\n\n### 💡 알뜰 주유 꿀팁!\n1. **지역화폐 활용**: '용인와이페이' 가맹점인 주유소를 이용하면 추가 혜택을 받을 수 있어요!\n2. **오전 주유**: 기온이 낮은 오전에 주유하면 조금 더 이득이라는 점!\n\n오늘도 알뜰하고 행복한 하루 되세요! ❤️🐰\n\n---\n*본 정보는 오피넷(Opinet) 실시간 API 데이터를 바탕으로 작성되었습니다.*\n`;

    let content = `---\ntitle: "${title}"\ndate: ${kstDate.toISOString()}\nsummary: "${summary}"\ncategory: 용인시정보\nimage: info-gas.png\ntags: [용인시, 최저가주유소, 기름값정보, 실시간위젯]\n---\n\n${bodyContent}`;

    const postsDir = path.join(__dirname, '../src/content/posts');
    
    // 오늘 날짜로 생성할 파일명
    const slug = `${dateStr}-01-gas-prices`;
    const fileName = `${slug}.md`;

    const existingFilesPaths = getAllFilesRecursive(postsDir);
    const gasPosts = existingFilesPaths.filter(f => f.endsWith('.md') && f.includes('-gas-prices.md'));
    
    // 이전 gas-prices 포스트 삭제 (있다면)
    gasPosts.forEach(filePath => {
      if (path.basename(filePath) !== fileName) {
        fs.unlinkSync(filePath);
        console.log(`과거 주유소 포스트 삭제됨: ${path.basename(filePath)}`);
      }
    });

    const targetDir = path.join(postsDir, '용인시정보');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, fileName), content, 'utf8');
    console.log(`기름값 SEO용 블로그 포스트 생성 완료: ${fileName}`);

    // Update featured-cards.json automatically
    const featuredCardsPath = path.join(__dirname, '../public/data/featured-cards.json');
    if (fs.existsSync(featuredCardsPath)) {
      let cards = JSON.parse(fs.readFileSync(featuredCardsPath, 'utf8'));
      const newCard = {
        category: '용인시정보',
        title: title,
        summary: summary,
        content: bodyContent,
        date: dateStr,
        region: '용인시',
        image: 'info-gas.png',
        slug: slug
      };
      
      const existingIndex = cards.findIndex(c => c.slug === slug);
      if (existingIndex !== -1) {
          cards[existingIndex] = newCard;
      } else {
          cards.unshift(newCard);
      }
      
      fs.writeFileSync(featuredCardsPath, JSON.stringify(cards, null, 2), 'utf8');
      console.log('메인 화면 featured-cards.json 업데이트 완료');
    }

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

fetchGasPrices();
