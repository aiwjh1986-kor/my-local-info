import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areaCode = searchParams.get('areaCode');
  const sigunguCode = searchParams.get('sigunguCode');
  const contentTypeId = searchParams.get('contentTypeId');

  const API_KEY = process.env.TOUR_API_KEY || process.env.PUBLIC_DATA_API_KEY;

  if (!API_KEY || !areaCode || !sigunguCode || !contentTypeId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=15&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=O&contentTypeId=${contentTypeId}&areaCode=${areaCode}&sigunguCode=${sigunguCode}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json({ items: data.response?.body?.items?.item || [] });
  } catch (error) {
    console.error('TourAPI Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
