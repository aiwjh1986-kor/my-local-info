const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const dir = path.join(__dirname, '../src/content/posts');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
const categories = new Set();
const map = {};

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const m = matter(content);
  if (m.data.category) {
    const cat = String(m.data.category).replace(/['"]/g, '').trim();
    categories.add(cat);
    if(!map[cat]) map[cat] = [];
    map[cat].push(f);
  } else {
    categories.add('생활정보'); // default
    if(!map['생활정보']) map['생활정보'] = [];
    map['생활정보'].push(f);
  }
});

console.log('Categories:', Array.from(categories));
for(const cat in map) {
  console.log(`\nCategory [${cat}]: ${map[cat].length} files`);
}
