const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../public/data/local-info.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

if (data.benefits) {
  data.benefits.forEach(b => {
    if (b.category === '혜택' || b.category === '지원금') b.category = 'grant';
  });
}
if (data.events) {
  data.events.forEach(e => {
    if (e.category === '행사' || e.category === '축제') e.category = 'event';
  });
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('데이터 세탁 완료! (혜택 -> grant)');
