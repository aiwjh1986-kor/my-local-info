const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = 'src/content/posts';
const linkMap = {
  'bicycle-free.md': 'https://www.yongin.go.kr',
  'book-talk.md': 'https://lib.yongin.go.kr',
  'garbage-day.md': 'https://www.yongin.go.kr',
  'hospital-accompany.md': 'https://www.seorodolbom.com',
  'library-recommend.md': 'https://lib.yongin.go.kr',
  'market-night.md': 'https://www.yongin.go.kr',
  'old-car-scrap.md': 'https://www.mecar.or.kr',
  'pregnant-transport.md': 'https://www.yongin.go.kr',
  'temple-concert.md': 'https://www.yongin.go.kr',
  '2026-05-02-b1.md': 'https://www.childschool.go.kr',
  '2026-05-02-b10.md': 'https://www.mof.go.kr',
  '2026-05-02-b2.md': 'https://www.hometax.go.kr',
  '2026-05-02-b3.md': 'https://www.hf.go.kr',
  '2026-05-02-b4.md': 'https://www.fipa.or.kr',
  '2026-05-02-b5.md': 'https://www.kmst.go.kr',
  '2026-05-02-b6.md': 'https://www.fira.or.kr',
  '2026-05-02-b8.md': 'https://www.fira.or.kr'
};

Object.entries(linkMap).forEach(([file, link]) => {
  const fullPath = path.join(postsDir, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const { data, content: body } = matter(content);
    if (!data.link || data.link === '' || data.link === 'https://www.yongin.go.kr') {
      data.link = link;
      const updated = matter.stringify(body, data);
      fs.writeFileSync(fullPath, updated, 'utf8');
      console.log(`[UPDATED] ${file} -> ${link}`);
    }
  }
});
