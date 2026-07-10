import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { id, password } = body;

  const adminId = process.env.ADMIN_ID || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (id === adminId && password === adminPassword) {
    const response = NextResponse.json({ success: true });
    
    // 로그인을 유지하기 위한 간단한 쿠키 설정 (보안을 위해 실제 운영시는 더 강화해야 함)
    response.cookies.set('is_admin', 'true', {
      path: '/',
      httpOnly: false, // 클라이언트 측에서 접근 가능하게 설정 (간단한 구현용)
      maxAge: 60 * 60 * 24, // 24시간 유지
    });

    return response;
  }

  return NextResponse.json({ success: false, message: '아이디 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
}
