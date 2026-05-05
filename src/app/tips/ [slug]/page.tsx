import { getTipData, getSortedTipsData } from "@/lib/posts";
import { notFound } from "next/navigation";
import TipClient from "./TipClient";
import { Metadata } from "next";

export async function generateStaticParams() {
  const tips = getSortedTipsData();
  return tips.map((tip) => ({
    slug: tip.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tip = getTipData(slug);
  if (!tip) return { title: "Tip Not Found" };
  
  const title = tip.title + " | 루미 가이드 꿀팁";
  const description = tip.summary || "생활이 편리해지는 루미의 실생활 꿀팁을 확인하세요.";
  const baseUrl = "https://koreatripinfo.com";
  
  // 이미지 경로 처리
  let image = tip.image;
  if (image && !image.startsWith("http")) {
    image = `${baseUrl}/images/${image}`;
  } else if (!image) {
    image = `${baseUrl}/images/background1.png`;
  }

  return { 
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/tips/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/tips/${slug}`,
      images: [image],
      type: "article",
      authors: ["루미"],
    }
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = getTipData(slug);

  if (!tip) {
    notFound();
  }

  // 구글 검색용 구조화 데이터 (HowTo 스타일)
  const baseUrl = "https://koreatripinfo.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": tip.title,
    "description": tip.summary,
    "image": tip.image?.startsWith("http") ? tip.image : `${baseUrl}/images/${tip.image}`,
    "author": {
      "@type": "Person",
      "name": "루미"
    },
    "publisher": {
      "@type": "Organization",
      "name": "루미 가이드",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/icon-new.png`
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TipClient initialTip={tip} />
    </>
  );
}
