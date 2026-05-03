import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  // 관리자 확인
  const isAdmin = request.headers.get('cookie')?.includes('is_admin=true');
  if (!isAdmin) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { slug } = body;

  if (!slug) {
    return NextResponse.json({ success: false, message: '슬러그 정보가 없습니다.' }, { status: 400 });
  }

  try {
    const postsDirectory = path.join(process.cwd(), 'src/content/posts');
    
    // 파일명을 찾기 위한 시도 (slug가 b1인 경우와 2026-05-02-b1인 경우 모두 대응)
    let foundPath = '';
    const possiblePaths = [
      path.join(postsDirectory, `${slug}.md`),
      // 혹시 데이터 파일의 ID만 넘어온 경우를 위해 전체 파일 목록에서 검색
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    // 만약 못 찾았다면 파일 목록에서 ID가 포함된 파일을 찾음 (예: b2 -> 2026-05-02-b2.md)
    if (!foundPath) {
      const files = fs.readdirSync(postsDirectory);
      const matchedFile = files.find(f => f.endsWith(`-${slug}.md`) || f === `${slug}.md`);
      if (matchedFile) {
        foundPath = path.join(postsDirectory, matchedFile);
      }
    }

    if (foundPath && fs.existsSync(foundPath)) {
      fs.unlinkSync(foundPath);
      console.log(`Deleted file: ${foundPath}`);
    }

    // 2. local-info.json 데이터에서도 삭제
    const dataFilePath = path.join(process.cwd(), 'public/data/local-info.json');
    if (fs.existsSync(dataFilePath)) {
      const localData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      
      // events와 benefits에서 해당 slug를 가진 항목 필터링
      localData.events = localData.events.filter((e: any) => e.slug !== slug && e.id !== slug);
      localData.benefits = localData.benefits.filter((b: any) => b.slug !== slug && b.id !== slug);
      
      fs.writeFileSync(dataFilePath, JSON.stringify(localData, null, 2), 'utf8');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ success: false, message: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
