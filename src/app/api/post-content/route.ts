import { NextResponse } from 'next/server';
import { getPostData } from '@/lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ success: false, message: "No slug provided" }, { status: 400 });
  }

  try {
    const postData = getPostData(slug);
    if (!postData) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, content: postData.content });
  } catch (error) {
    console.error("Error fetching post data:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
