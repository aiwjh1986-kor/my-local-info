import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAllFilesRecursive } from '@/lib/posts';

export async function POST(request: Request) {
  // 관리자 확인
  const isAdmin = request.headers.get('cookie')?.includes('is_admin=true');
  if (!isAdmin) {
    return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { slug, newContent } = body;

  if (!slug || newContent === undefined) {
    return NextResponse.json({ success: false, message: '필수 정보가 누락되었습니다.' }, { status: 400 });
  }

  try {
    const postsDirectory = path.join(process.cwd(), 'src/content/posts');
    const allFiles = getAllFilesRecursive(postsDirectory);
    const fullPath = allFiles.find(f => path.basename(f) === `${slug}.md`);

    if (!fullPath) {
      return NextResponse.json({ success: false, message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 기존 파일 읽기 (Frontmatter 유지를 위해)
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    // 새 내용으로 마크다운 생성
    const updatedFileContent = matter.stringify(newContent, data);

    // 파일 저장
    fs.writeFileSync(fullPath, updatedFileContent, 'utf8');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Text Update error:', err);
    return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
