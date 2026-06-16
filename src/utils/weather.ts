export async function fetchKmaWeather() {
  try {
    const apiKey = '92a89b899c53464e7bc2822b70cbb04236e5c27972e09adabe807f8acd77e6cf';
    
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const h = kst.getUTCHours();
    const m = kst.getUTCMinutes();
    
    let targetH = h;
    let targetD = new Date(kst);
    
    if (h < 2 || (h === 2 && m < 10)) { targetH = 23; targetD.setUTCDate(kst.getUTCDate() - 1); }
    else if (h < 5 || (h === 5 && m < 10)) { targetH = 2; }
    else if (h < 8 || (h === 8 && m < 10)) { targetH = 5; }
    else if (h < 11 || (h === 11 && m < 10)) { targetH = 8; }
    else if (h < 14 || (h === 14 && m < 10)) { targetH = 11; }
    else if (h < 17 || (h === 17 && m < 10)) { targetH = 14; }
    else if (h < 20 || (h === 20 && m < 10)) { targetH = 17; }
    else if (h < 23 || (h === 23 && m < 10)) { targetH = 20; }
    else { targetH = 23; }

    const yyyy = targetD.getUTCFullYear();
    const mm = String(targetD.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(targetD.getUTCDate()).padStart(2, '0');
    const hh = String(targetH).padStart(2, '0');

    const baseDate = `${yyyy}${mm}${dd}`;
    const baseTime = `${hh}00`;
    
    // 용인시 처인구(시청 기준)
    const nx = '62';
    const ny = '120';

    // https 사용 필수 (CORS 방지용)
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('API 에러');

    const data = await response.json();
    const items = data.response?.body?.items?.item;
    if (!items) throw new Error('데이터 없음');

    let tmp = null, sky = null, pty = null;

    for (const item of items) {
      if (item.category === 'TMP' && tmp === null) tmp = item.fcstValue;
      if (item.category === 'SKY' && sky === null) sky = item.fcstValue;
      if (item.category === 'PTY' && pty === null) pty = item.fcstValue;
      if (tmp !== null && sky !== null && pty !== null) break;
    }

    let condition = '알 수 없음';
    if (pty === '0') {
      if (sky === '1') condition = '맑음';
      else if (sky === '3') condition = '구름많음';
      else if (sky === '4') condition = '흐림';
    } else {
      if (pty === '1') condition = '비';
      else if (pty === '2') condition = '비/눈';
      else if (pty === '3') condition = '눈';
      else if (pty === '4') condition = '소나기';
    }

    return { temp: tmp || '21', condition };
  } catch (error) {
    console.error(error);
    return { temp: '21', condition: '맑음' };
  }
}
