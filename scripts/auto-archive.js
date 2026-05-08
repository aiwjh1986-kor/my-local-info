const fs = require('fs');
const path = require('path');

async function autoArchive() {
  const postsDir = path.join(__dirname, '../src/content/posts');
  const featuredPath = path.join(__dirname, '../public/data/featured-cards.json');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let archivedPostsCount = 0;
  let archivedCardsCount = 0;

  // 1. 마크다운 파일 정리
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
    if (!frontmatterMatch) continue;

    const frontmatter = frontmatterMatch[1];
    const deadlineMatch = frontmatter.match(/deadline:\s*([\d-]+)/);
    const endDateMatch = frontmatter.match(/endDate:\s*([\d-]+)/);
    
    let targetDateStr = deadlineMatch ? deadlineMatch[1] : (endDateMatch ? endDateMatch[1] : null);

    // 주유소 및 지방선거 정보글인 경우 당일이 지나면 종료처리하기 위해 date를 마감일로 간주
    if ((file.includes('gas-prices') || file.includes('election-news')) && !targetDateStr) {
      const dateMatch = frontmatter.match(/date:\s*([\d-]+)/);
      if (dateMatch) {
        targetDateStr = dateMatch[1];
      }
    }

    if (targetDateStr) {
      const targetDate = new Date(targetDateStr);
      if (targetDate < today) {
        let updatedFrontmatter = frontmatter;
        let modified = false;

        if (!updatedFrontmatter.includes('title: "[종료]') && !updatedFrontmatter.includes("title: '[종료]")) {
          updatedFrontmatter = updatedFrontmatter.replace(/title:\s*"(?!\[종료\])(.+)"/, 'title: "[종료] $1"');
          updatedFrontmatter = updatedFrontmatter.replace(/title:\s*'(?!\[종료\])(.+)'/, "title: '[종료] $1'");
          modified = true;
        }

        if (!updatedFrontmatter.includes('date: 2020-01-01')) {
          updatedFrontmatter = updatedFrontmatter.replace(/date:\s*.+/, 'date: 2020-01-01T00:00:00.000Z');
          modified = true;
        }

        if (modified) {
          const updatedContent = content.replace(/^---\n[\s\S]+?\n---/, `---\n${updatedFrontmatter}\n---`);
          fs.writeFileSync(filePath, updatedContent, 'utf8');
          archivedPostsCount++;
        }
      }
    }
  }

  // 2. featured-cards.json 정리
  if (fs.existsSync(featuredPath)) {
    let cards = JSON.parse(fs.readFileSync(featuredPath, 'utf8'));
    let modified = false;

    cards = cards.map(card => {
      // featured-cards에는 deadline이 없을 수 있으므로 post 파일을 찾아봄
      let targetDeadline = card.deadline;
      if (!targetDeadline && card.slug) {
        // 주유소 및 선거뉴스 카드인 경우 date를 기준으로 만료 체크
        if (card.slug.includes('gas-prices') || card.slug.includes('election-news')) {
          targetDeadline = card.date;
        } else {
          const postPath = path.join(postsDir, `${card.slug}.md`);
          if (fs.existsSync(postPath)) {
            const postContent = fs.readFileSync(postPath, 'utf8');
            const m = postContent.match(/deadline:\s*([\d-]+)/) || postContent.match(/endDate:\s*([\d-]+)/);
            if (m) targetDeadline = m[1];
          }
        }
      }

      if (targetDeadline) {
        const d = new Date(targetDeadline);
        if (d < today) {
          if (!card.title.startsWith('[종료]')) {
            card.title = `[종료] ${card.title}`;
            card.date = "2020-01-01"; // 뒤로 보내기
            modified = true;
            archivedCardsCount++;
          }
        }
      }
      return card;
    });

    if (modified) {
      fs.writeFileSync(featuredPath, JSON.stringify(cards, null, 2), 'utf8');
    }
  }

  console.log(`\n정리 완료: 마크다운 ${archivedPostsCount}개, 메인 카드 ${archivedCardsCount}개`);
}

autoArchive();
