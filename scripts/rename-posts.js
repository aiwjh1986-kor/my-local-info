const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/content/posts');
const files = fs.readdirSync(dir);

const counts = {};

// First pass: register already existing nn for each date
files.forEach(f => {
  const match = f.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})-(.*)\.md$/);
  if (match) {
    const d = match[1];
    const n = parseInt(match[2], 10);
    if (!counts[d]) counts[d] = [];
    counts[d].push(n);
  }
});

// Second pass: rename files
files.forEach(f => {
  // If already matches yyyy-mm-dd-nn-keyword, skip
  if (/^\d{4}-\d{2}-\d{2}-\d{2}-.*\.md$/.test(f)) return;
  
  const fullPath = path.join(dir, f);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  let dStr = "2026-05-01"; // fallback
  const dateMatch = content.match(/date:\s*['"]?([^'"\n\s]+)['"]?/);
  if (dateMatch) {
    const rawDate = dateMatch[1];
    const d = rawDate.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      dStr = d;
    }
  }
  
  if (!counts[dStr]) counts[dStr] = [];
  
  // Find next available nn
  let nn = 1;
  while (counts[dStr].includes(nn)) {
    nn++;
  }
  counts[dStr].push(nn);
  
  const nnStr = nn.toString().padStart(2, '0');
  
  let keyword = f.replace(/\.md$/, '');
  // strip existing date prefix if any (e.g. 2026-05-04-book-kim -> book-kim, 2026-asian-pop-fest -> asian-pop-fest)
  keyword = keyword.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  keyword = keyword.replace(/^2026-/, '');
  
  const newName = `${dStr}-${nnStr}-${keyword}.md`;
  console.log(`Renaming ${f} to ${newName}`);
  fs.renameSync(fullPath, path.join(dir, newName));
});
