const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../src/content/posts');

function runMigration() {
  const files = fs.readdirSync(postsDir);
  let movedCount = 0;

  files.forEach(file => {
    const fullPath = path.join(postsDir, file);
    
    // Only process markdown files directly in postsDir
    if (!fs.statSync(fullPath).isFile() || !file.endsWith('.md')) {
      return;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const m = matter(content);
      
      let cat = '생활정보'; // default
      if (m.data.category) {
        cat = String(m.data.category).replace(/['"]/g, '').trim();
      }

      // 윈도우에서 사용할 수 없는 문자 제거
      cat = cat.replace(/[<>:"/\\|?*]/g, '_');
      
      const targetDir = path.join(postsDir, cat);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetPath = path.join(targetDir, file);
      fs.renameSync(fullPath, targetPath);
      movedCount++;
      console.log(`Moved: ${file} -> ${cat}/${file}`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  });

  console.log(`\nMigration complete. Moved ${movedCount} files into category subfolders.`);
}

runMigration();
