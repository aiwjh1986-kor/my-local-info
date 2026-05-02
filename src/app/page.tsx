import { getSortedPostsData } from "@/lib/posts";
import DashboardClient from "./DashboardClient";
import featuredCardsData from "../../public/data/featured-cards.json";

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

  const featuredCards = featuredCardsData as any[];

  return (
    <DashboardClient initialBlogPosts={blogPosts} initialFeaturedCards={featuredCards} />
  );
}
