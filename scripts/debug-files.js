const fs = require('fs');
const path = require('path');

const dir = 'src/content/posts';
const files = fs.readdirSync(dir);

console.log(`총 파일 개수: ${files.length}`);
files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const titleMatch = content.match(/title:\s*(.*)/);
  console.log(`파일명: ${file} | 제목: ${titleMatch ? titleMatch[1] : '없음'}`);
});
