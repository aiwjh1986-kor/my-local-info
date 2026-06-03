const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../public/data/featured-cards.json');
const mdPath = path.join(__dirname, '../src/content/posts/도서정보/2026-06-03-01-yongin-library.md');

const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Strip frontmatter
const parts = mdContent.split('---');
// parts[0] is empty, parts[1] is frontmatter, parts[2...] is content
const body = parts.slice(2).join('---').trim();

jsonData[0].content = body;

fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
console.log('Updated successfully');
