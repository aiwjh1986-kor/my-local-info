const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function rewriteBooks() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY가 없습니다.');
    return;
  }

  const postsDir = path.join(__dirname, '../src/content/posts');
  const files = fs.readdirSync(postsDir);
  const bookFiles = files.filter(f => f.endsWith('.md') && 
    (fs.readFileSync(path.join(postsDir, f), 'utf8').includes('category: book') || 
     fs.readFileSync(path.join(postsDir, f), 'utf8').includes('category: 도서정보')));

  console.log(`Found ${bookFiles.length} book files to rewrite.`);

  for (const file of bookFiles) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const fmMatch = content.match(/^(---\n[\s\S]+?\n---)\n([\s\S]*)$/);
    if (!fmMatch) continue;

    const frontmatter = fmMatch[1];
    const body = fmMatch[2];

    const prompt = `너는 '용인시 용인시정보 및 여행가이드' 블로그의 전문 에디터야.
주의: '루미예요', '루미가 추천해요'와 같은 가상의 이름이나 오글거리는 인사말은 절대 넣지 마.
아래는 기존의 도서 추천 관련 블로그 포스트 본문이야.
이 내용을 바탕으로, 책에 대한 깊이 있는 서평과 독후감, 추천 이유 등을 덧붙여서 **한글 공백 포함 최소 1,500자 이상**으로 매우 길고 상세하게 다시 작성해줘.

작성 지침:
1. 톤앤매너: 친절하고 상냥한 말투 (해요체).
2. 분량: 한글 공백 포함 최소 1,500자 이상. 분량이 짧으면 절대 안 됨.
3. 내용 구성: 흥미로운 도입부 -> 책 줄거리 및 상세 내용 -> 깊이 있는 감상평 3가지 -> 용인시 도서관 대출 꿀팁.
4. 형식: 마크다운 형식을 사용. 다른 설명 없이 본문 내용만 출력해. (프론트매터는 출력하지 마)

기존 본문:
${body}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      console.log(`Rewriting ${file}...`);
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        console.error(`Failed to rewrite ${file}`);
        continue;
      }

      let cleanContent = aiResponse;
      if (cleanContent.startsWith('\`\`\`markdown')) {
        cleanContent = cleanContent.replace(/^\`\`\`markdown\n/, '').replace(/\n\`\`\`$/, '');
      } else if (cleanContent.startsWith('\`\`\`')) {
        cleanContent = cleanContent.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }

      const newFullContent = `${frontmatter}\n\n${cleanContent.trim()}\n`;
      fs.writeFileSync(filePath, newFullContent, 'utf8');
      console.log(`Success: ${file}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.error(e);
    }
  }
}

rewriteBooks();
