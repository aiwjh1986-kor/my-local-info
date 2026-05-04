import { getPostData, getSortedPostsData } from "@/lib/posts";
import { notFound } from "next/navigation";
import PostClient from "./PostClient";
import { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);
  if (!post) return { title: "Post Not Found" };
  
  const title = post.title + " | 루미 가이드";
  const description = post.summary || "용인시 지역 소식 및 유익한 생활 정보를 전해드립니다.";
  const baseUrl = "https://koreatripinfo.com";
  const image = post.image ? `${baseUrl}/images/${post.image}` : `${baseUrl}/images/background1.png`;

  return { 
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/blog/${slug}`,
      images: [image],
      type: "article",
      publishedTime: post.date,
      authors: ["루미"],
    }
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  // 구글 검색용 구조화 데이터 (Article)
  const baseUrl = "https://koreatripinfo.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary,
    "image": post.image ? `${baseUrl}/images/${post.image}` : `${baseUrl}/images/background1.png`,
    "datePublished": post.date,
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
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostClient initialPost={post} />
    </>
  );
}
