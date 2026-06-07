const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function expandShortPosts() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY가 없습니다.');
    return;
  }

  const dirs = [
    path.join(__dirname, '../src/content/posts'),
    path.join(__dirname, '../src/content/tips')
  ];

  let expandedCount = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // If the file length is less than 1000 characters
      if (fileContents.length < 1000) {
        console.log(`- 짧은 글 발견 (확장 중...): ${file} (현재 ${fileContents.length}자)`);
        
        const matterResult = matter(fileContents);
        const originalContent = matterResult.content.trim();
        const frontmatterObj = matterResult.data;

        // Skip if there's no actual content to expand
        if (!originalContent) {
            console.log(`  - 본문 내용이 비어있어 스킵: ${file}`);
            continue;
        }

        const prompt = `너는 친절하고 전문적인 용인시정보/가이드 블로그 에디터야.
아래는 현재 분량이 너무 짧은 블로그 글의 원본 내용이야. 
이 내용을 바탕으로 관련된 유용한 정보, 구체적인 팁, 주의사항, 배경 지식 등을 아주 풍부하게 추가해서 한글 공백 포함 최소 1,500자 이상의 매우 상세하고 긴 글로 다시 작성해 줘.

주의: 
1. 톤앤매너: 친절하고 상냥한 말투 (해요체)
2. '안녕하세요', '루미예요' 같은 인사말이나 불필요한 서론은 제외하고 본문 내용부터 바로 시작할 것.
3. 마크다운 형식(소제목, 리스트 등)을 적극적으로 활용할 것.
4. 다른 설명 없이 순수하게 생성된 마크다운 본문 내용만 출력해. (코드 블록 기호 쓰지 말 것)

원본 내용:
${originalContent}
`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        
        try {
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
                console.error(`  - AI 응답 생성 실패: ${file}`);
                continue;
            }

            let cleanContent = aiResponse.trim();
            if (cleanContent.startsWith('\`\`\`markdown')) {
                cleanContent = cleanContent.replace(/^\`\`\`markdown\n/, '').replace(/\n\`\`\`$/, '');
            } else if (cleanContent.startsWith('\`\`\`')) {
                cleanContent = cleanContent.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
            }

            // Create new file content preserving original frontmatter
            const newFileContent = matter.stringify(cleanContent, frontmatterObj);
            
            fs.writeFileSync(fullPath, newFileContent, 'utf8');
            console.log(`  - 확장 완료: ${file} (완료 후 약 ${newFileContent.length}자)`);
            expandedCount++;

            // Rate limiting delay (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
            console.error(`  - 에러 발생 (${file}):`, error.message);
        }
      }
    }
  }

  console.log(`\n총 ${expandedCount}개의 파일 내용을 1000자 이상으로 확장했습니다!`);
}

expandShortPosts();
