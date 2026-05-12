const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function checkSuji() {
  const k = process.env.OPINET_API_KEY;
  const brands = ['SKE', 'GSC', 'SOL', 'HDO', 'RTC', 'NHO', 'ETC'];
  const prods = ['B027', 'D047'];
  let all = [];

  console.log('브랜드/유종별 전수 조사 시작...');
  for (let b of brands) {
    for (let p of prods) {
      try {
        const url = `http://www.opinet.co.kr/api/lowTop10.do?out=json&code=${k}&area=0220&prodcd=${p}&poll_div_cd=${b}`;
        const r = await fetch(url).then(res => res.json());
        if (r.RESULT && r.RESULT.OIL) {
          all.push(...r.RESULT.OIL);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  const suji = all.filter(o => o.VAN_ADR.includes('수지구'));
  console.log('총 수집된 주유소:', all.length);
  console.log('그 중 수지구 주유소:', suji.length);
  
  if (suji.length > 0) {
    // 중복 제거 및 가격순 정렬
    const uniqueSuji = Array.from(new Set(suji.map(s => s.UNI_ID)))
      .map(id => suji.find(s => s.UNI_ID === id))
      .sort((a, b) => a.PRICE - b.PRICE);
      
    console.log('수지구 최저가 TOP 5:');
    console.log(JSON.stringify(uniqueSuji.slice(0, 5), null, 2));
  }
}

checkSuji();
