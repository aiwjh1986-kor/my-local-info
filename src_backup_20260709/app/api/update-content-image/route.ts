import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllFilesRecursive } from '@/lib/posts';

export async function POST(request: Request) {
  // 관리자 확인
  const isAdmin = request.headers.get('cookie')?.includes('is_admin=true');
  if (!isAdmin) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { slug, oldImageUrl, newImageUrl } = body;

  if (!slug || !oldImageUrl || !newImageUrl) {
    return NextResponse.json({ success: false, message: '필수 정보가 누락되었습니다.' }, { status: 400 });
  }

  try {
    const postsDirectory = path.join(process.cwd(), 'src/content/posts');
    const allFiles = getAllFilesRecursive(postsDirectory);
    const fullPath = allFiles.find(f => path.basename(f) === `${slug}.md`);

    if (!fullPath) {
      return NextResponse.json({ success: false, message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 파일 읽기
    let fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // 본문 내용에서 이전 이미지 주소를 새 주소로 모두 변경
    // 정규표현식 등을 쓰지 않고 단순히 문자열 치환을 하되, 
    // 혹시 모를 오작동을 방지하기 위해 마크다운 이미지 형식 안의 주소인지 확인하는 것이 좋지만
    // 초보자용이므로 일단 전체 치환으로 구현 (보통 이미지 주소는 유니크하므로)
    if (!fileContents.includes(oldImageUrl)) {
      return NextResponse.json({ success: false, message: '변경할 이미지를 파일에서 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatedFileContents = fileContents.split(oldImageUrl).join(newImageUrl);

    // 파일 저장
    fs.writeFileSync(fullPath, updatedFileContents, 'utf8');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Content Image Update error:', err);
    return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
