const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../public/data/featured-cards.json');
const mdPath = path.join(__dirname, '../src/content/posts/도서정보/2026-06-03-02-gosiwon-review.md');

const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Strip frontmatter
const parts = mdContent.split('---');
const body = parts.slice(2).join('---').trim();

const newCard = {
  category: "도서정보",
  title: "도서 추천 : 고시원 기담 (전건우 작가)",
  summary: "단순한 공포가 아닌 사람 냄새 나는 따뜻한 호러 소설, 전건우 작가의 '고시원 기담' 리뷰",
  content: body,
  date: "2026-06-03",
  region: "용인시",
  image: "book/05.png",
  slug: "2026-06-03-02-gosiwon-review"
};

// Insert at the top of the array
jsonData.unshift(newCard);

fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
console.log('Successfully added the review to featured-cards.json');
