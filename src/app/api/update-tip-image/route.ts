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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update tip image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
