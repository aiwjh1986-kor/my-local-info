const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts');
const files = fs.readdirSync(postsDir);

files.forEach(file => {
  if (file.startsWith('2026-05-03') && file.endsWith('.md')) {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // image 필드가 있으면 교체, 없으면 추가
    if (content.includes('image:')) {
      content = content.replace(/image:.*\n/, 'image: new_01.png\n');
    } else {
      content = content.replace(/---\n/, '---\nimage: new_01.png\n');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
