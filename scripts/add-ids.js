const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts');
const files = fs.readdirSync(postsDir);

files.forEach(file => {
  if (file.startsWith('2026-05-03') && file.endsWith('.md')) {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 파일명에서 ID 추출 (예: 2026-05-03-b3.md -> b3)
    const idMatch = file.match(/-([eb]\d+)\.md$/) || file.match(/-(e\d+-\d+)\.md$/);
    if (idMatch) {
      const id = idMatch[1];
      if (!content.includes('id:')) {
        content = content.replace(/---\n/, `---\nid: ${id}\n`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Added ID ${id} to ${file}`);
      }
    }
  }
});
