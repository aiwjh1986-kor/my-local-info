const fs = require('fs');
const path = require('path');
const postsDir = path.join(__dirname, '../src/content/posts');
const files = fs.readdirSync(postsDir);

files.forEach(file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // title 항목이 아예 없거나, title: 뒤에 아무것도 없는 경우
    const hasTitle = /title:\s*".+"/.test(content) || /title:\s*[^"\n\r\s]+/.test(content);
    
    if (!hasTitle) {
      console.log('Deleting file without title: ' + file);
      fs.unlinkSync(filePath);
    }
  }
});
