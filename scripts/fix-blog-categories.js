const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts');
const files = fs.readdirSync(postsDir);

files.forEach(file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 카테고리 교체
    const originalContent = content;
    content = content.replace(/category:\s*혜택/g, 'category: grant');
    content = content.replace(/category:\s*정보/g, 'category: grant');
    content = content.replace(/category:\s*축제/g, 'category: event');
    content = content.replace(/category:\s*행사/g, 'category: event');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`- 수정 완료: ${file}`);
    }
  }
});
console.log('블로그 카테고리 전수 수정 완료!');
