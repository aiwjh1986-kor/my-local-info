import { Suspense } from "react";
import { getSortedPostsData } from "@/lib/posts";
import DashboardClient from "./DashboardClient";
import fs from 'fs';
import path from 'path';

export default function Page() {
  // 오늘 날짜 기준 (2026-05-04)
  const TODAY = new Date().toISOString().split('T')[0];

  // 빌드 시점에 마크다운 파일들로부터 블로그 데이터를 가져옵니다.
  const blogPosts = getSortedPostsData()
    .map(p => ({
      category: p.category,
      title: p.title,
      summary: p.summary,
      date: p.date,
      region: "전체",
      cta: "글 읽어보기",
      deadline: p.deadline || null,
      is_urgent: false,
      is_popular: true,
      content: p.content,
      slug: p.slug,
      image: p.image,
      link: p.link
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

  // life-tips.json 읽어오기 (SEO용)
  const tipsPath = path.join(process.cwd(), 'public/data/life-tips.json');
  let lifeTips = [];
  try {
    const fileContent = fs.readFileSync(tipsPath, 'utf8');
    lifeTips = JSON.parse(fileContent);
  } catch (err) {
    console.error("Failed to read life-tips.json:", err);
  }

  // 구글 검색용 구조화 데이터 (HowTo 모음)
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "루미의 실생활 꿀팁 모음",
    "itemListElement": lifeTips.map((tip: any, index: number) => ({
      "@type": "HowTo",
      "position": index + 1,
      "name": tip.title,
      "description": tip.description,
      "image": `https://my-local-info-42x.pages.dev/images/${tip.image}`,
      "step": [
        {
          "@type": "HowToStep",
          "text": tip.description
        }
      ]
    }))
  };

  // gas-prices.json 읽어오기
  const gasPath = path.join(process.cwd(), 'public/data/gas-prices.json');
  let gasPrices = null;
  try {
    if (fs.existsSync(gasPath)) {
      const fileContent = fs.readFileSync(gasPath, 'utf8');
      gasPrices = JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Failed to read gas-prices.json:", err);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <DashboardClient 
        initialBlogPosts={blogPosts} 
        initialFeaturedCards={featuredCards} 
      />
    </Suspense>
  );
}
