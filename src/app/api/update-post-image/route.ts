import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function POST(request: Request) {
  // 간단한 관리자 확인 (쿠키 기반)
  const isAdmin = request.headers.get('cookie')?.includes('is_admin=true');
  
  if (!isAdmin) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { slug, newImageUrl } = body;

  if (!slug || !newImageUrl) {
    return NextResponse.json({ success: false, message: '필수 정보가 누락되었습니다.' }, { status: 400 });
  }

  try {
    const postsDirectory = path.join(process.cwd(), 'src/content/posts');
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ success: false, message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 마크다운 파일 읽기
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // 이미지 필드 업데이트
    const updatedData = { ...data, image: newImageUrl };

    // 다시 마크다운 형식으로 변환 (문자열)
    const updatedFileContent = matter.stringify(content, updatedData);

    // 파일 저장
    fs.writeFileSync(fullPath, updatedFileContent, 'utf8');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
