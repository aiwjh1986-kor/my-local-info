import { Suspense } from "react";
import { getSortedPostsData } from "@/lib/posts";
import DashboardClient from "./DashboardClient";
import fs from 'fs';
import path from 'path';

export default function Page() {
  // 빌드 시점에 마크다운 파일들로부터 블로그 데이터를 가져옵니다.
  const blogPosts = getSortedPostsData().map(p => ({
    category: p.category,
    title: p.title,
    summary: p.summary,
    date: p.date,
    region: "전체",
    cta: "글 읽어보기",
    deadline: null,
    is_urgent: false,
    is_popular: true,
    content: p.content,
    slug: p.slug,
    image: p.image,
    link: "/blog/" + p.slug + "/" // trailingSlash 활성화 대응
  }));

  // featured-cards.json을 실시간으로 읽어옵니다. (이미지 수정 즉시 반영을 위함)
  const featuredPath = path.join(process.cwd(), 'public/data/featured-cards.json');
  let featuredCards = [];
  try {
    const fileContent = fs.readFileSync(featuredPath, 'utf8');
    featuredCards = JSON.parse(fileContent);
  } catch (err) {
    console.error("Failed to read featured-cards.json:", err);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient initialBlogPosts={blogPosts} initialFeaturedCards={featuredCards} />
    </Suspense>
  );
}
