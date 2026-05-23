import { Suspense } from "react";
import { getSortedPostsData } from "@/lib/posts";
import DashboardClient from "./DashboardClient";
import MobileApp from "./MobileApp";
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
      content: p.content, // 팝업창에서 상세 내용을 보기 위해 다시 포함!
      slug: p.slug,
      image: p.image,
      link: p.link
    }));

  // featured-cards.json을 실시간으로 읽어옵니다. (이미지 수정 즉시 반영을 위함)
  const featuredPath = path.join(process.cwd(), 'public/data/featured-cards.json');
  let featuredCards: any[] = [];
  try {
    const fileContent = fs.readFileSync(featuredPath, 'utf8');
    featuredCards = JSON.parse(fileContent);
  } catch (err) {
    console.error("Failed to read featured-cards.json:", err);
  }

  // life-tips.json 읽어오기 (SEO용 및 꿀팁 탭 연동)
  const tipsPath = path.join(process.cwd(), 'public/data/life-tips.json');
  let lifeTips: any[] = [];
  try {
    const fileContent = fs.readFileSync(tipsPath, 'utf8');
    lifeTips = JSON.parse(fileContent);
  } catch (err) {
    console.error("Failed to read life-tips.json:", err);
  }

  const tipsCards = lifeTips.map(tip => ({
    category: "실생활꿀팁",
    title: tip.title,
    summary: tip.description,
    date: TODAY,
    region: "전체",
    image: tip.image,
    slug: tip.slug || tip.id,
    link: tip.productLink,
    content: `### 💡 꿀팁: ${tip.title}\n\n${tip.description}\n\n---\n\n### 🛒 추천 아이템: ${tip.productName}\n\n[👉 최저가 확인 및 구매하기](${tip.productLink})`
  }));

  // #2 속도 개선: 브라우저가 할 일(데이터 합치고 정렬하기)을 서버에서 미리 처리
  const combined = [...blogPosts, ...featuredCards, ...tipsCards];
  const unique = Array.from(new Map(combined.map(item => [item.slug || item.id, item])).values());
  const allCards = unique.sort((a, b) => {
    const dateA = new Date((a.date || "").toString().replace(/\./g, '-')).getTime();
    const dateB = new Date((b.date || "").toString().replace(/\./g, '-')).getTime();
    return dateB - dateA;
  });

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
      
      {/* PC 버전 (태블릿 이상에서만 표시) */}
      <div className="hidden md:block">
        <DashboardClient allCards={allCards} />
      </div>

      {/* 스마트폰 전용 버전 (모바일에서만 표시) */}
      <div className="block md:hidden">
        <MobileApp allCards={allCards} gasPrices={gasPrices} />
      </div>
    </Suspense>
  );
}
