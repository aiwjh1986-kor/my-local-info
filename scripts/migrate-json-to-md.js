const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../public/data/featured-cards.json');
const postsDir = path.join(__dirname, '../src/content/posts');

if (!fs.existsSync(jsonPath)) {
  console.error('JSON 파일이 없습니다.');
  process.exit(1);
}

const cards = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const catMap = {
  '지원금': 'grant',
  '행사': 'event',
  '생활정보': 'info',
  '도서정보': 'book'
};

cards.forEach(card => {
  const slug = card.slug || `post-${Date.now()}`;
  const filePath = path.join(postsDir, `${slug}.md`);
  
  if (fs.existsSync(filePath)) {
    console.log(`- 이미 존재함: ${slug}.md (건너뜀)`);
    return;
  }

  const category = catMap[card.category] || card.category;
  
  // YAML Frontmatter 생성
  const yaml = `---
title: "${card.title.replace(/\n/g, '\\n')}"
date: "${card.date.replace(/\./g, '-')}"
category: ${category}
summary: "${card.summary}"
image: "${card.image}"
is_popular: ${card.is_popular || false}
is_urgent: ${card.is_urgent || false}
deadline: ${card.deadline ? `"${card.deadline}"` : 'null'}
link: "${card.link || ''}"
tags: ["용인", "${card.category}"]
---

${card.detail || card.summary}
`;

  fs.writeFileSync(filePath, yaml, 'utf8');
  console.log(`- 변환 완료: ${slug}.md`);
});

console.log('데이터 이사 완료! 🏮🚀');
