const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts/특별소식');
const archiveDir = path.join(__dirname, '../archive/worldcup');

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

const files = fs.readdirSync(postsDir);
let count = 0;

for (const file of files) {
  if (file.endsWith('.md')) {
    const fullPath = path.join(postsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    // Check if it's world cup related
    if (
      content.includes('월드컵') ||
      content.includes('축구') ||
      content.includes('16강') ||
      file.includes('worldcup') ||
      file.includes('match') ||
      file.includes('review') ||
      file.includes('preview') ||
      file.includes('analysis')
    ) {
      const targetPath = path.join(archiveDir, file);
      fs.renameSync(fullPath, targetPath);
      console.log(`Moved: ${file}`);
      count++;
    }
  }
}

console.log(`Total archived: ${count} posts.`);
