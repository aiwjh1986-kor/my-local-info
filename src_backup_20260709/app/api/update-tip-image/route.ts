import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { id, newImageUrl } = await request.json();
    
    if (!id || !newImageUrl) {
      return NextResponse.json({ error: 'ID and newImageUrl are required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public/data/life-tips.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const tips = JSON.parse(fileContent);

    const tipIndex = tips.findIndex((t: any) => t.id === id);
    if (tipIndex === -1) {
      return NextResponse.json({ error: 'Tip not found' }, { status: 404 });
    }

    // 이미지 경로 업데이트
    tips[tipIndex].image = newImageUrl;

    fs.writeFileSync(filePath, JSON.stringify(tips, null, 2));

    // Markdown 파일도 업데이트 (slug를 이용)
    const slug = tips[tipIndex].slug;
    if (slug) {
      const mdPath = path.join(process.cwd(), 'src/content/tips', `${slug}.md`);
      if (fs.existsSync(mdPath)) {
        const matter = require('gray-matter');
        const fileContents = fs.readFileSync(mdPath, 'utf8');
        const { data, content } = matter(fileContents);
        const updatedData = { ...data, image: newImageUrl };
        const updatedFileContent = matter.stringify(content, updatedData);
        fs.writeFileSync(mdPath, updatedFileContent, 'utf8');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update tip image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
