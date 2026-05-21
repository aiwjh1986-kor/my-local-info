import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: '이메일이 없습니다.' }, { status: 400 });
    }

    // 저장할 파일 경로 (프로젝트 최상단 폴더의 subscribers.txt)
    const filePath = path.join(process.cwd(), 'subscribers.txt');
    
    // 현재 시간과 이메일을 함께 저장
    const date = new Date().toISOString();
    const dataToSave = `${date} - ${email}\n`;

    // 파일에 내용 추가 (파일이 없으면 자동으로 만듦)
    await fs.appendFile(filePath, dataToSave, 'utf8');

    return NextResponse.json({ success: true, message: '구독 성공' });
  } catch (error) {
    console.error('구독 저장 실패:', error);
    return NextResponse.json({ success: false, message: '서버 에러' }, { status: 500 });
  }
}
