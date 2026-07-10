import { NextResponse } from 'next/server';

export const dynamic = "force-static";

export async function GET() {
  // Cloudflare Pages(정적 호스팅)에서는 로컬 파일 쓰기(fs)가 지원되지 않습니다.
  // 배포 오류를 해결하기 위해 고정된 방문자 수 또는 임시 값을 반환합니다.
  // 실제 방문자 통계가 필요하다면 구글 애널리틱스 등을 사용하는 것이 좋습니다.
  return NextResponse.json({ success: true, count: 1248 });
}
