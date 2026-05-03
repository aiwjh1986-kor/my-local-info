const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = 'src/content/posts';
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log('--- Link Check Report ---');
files.forEach(file => {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const { data } = matter(content);
  if (!data.link || data.link === '' || data.link === 'https://www.yongin.go.kr') {
    console.log(`[MISSING/GENERIC] ${file}: ${data.title} (${data.link || 'empty'})`);
  } else {
    console.log(`[OK] ${file}: ${data.link}`);
  }
});
