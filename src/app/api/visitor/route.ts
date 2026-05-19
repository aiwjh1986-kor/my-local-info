import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'visitor.json');
    
    let visitorData = { count: 1248 };
    
    // 파일이 존재하는 경우 읽어오기
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      visitorData = JSON.parse(fileContent);
    }
    
    // 방문자 수 1 증가
    visitorData.count += 1;
    
    // 변경된 데이터를 파일에 저장
    fs.writeFileSync(dataPath, JSON.stringify(visitorData, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, count: visitorData.count });
  } catch (error) {
    console.error('방문자 카운트 업데이트 중 오류:', error);
    // 에러 발생 시 임시로 1248 반환
    return NextResponse.json({ success: false, count: 1248 });
  }
}
