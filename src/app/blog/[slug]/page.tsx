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
  
  const title = post.title + " | 용인생활가이드";
  const description = post.summary || "용인시 지역 소식 및 유익한 생활 정보를 전해드립니다.";
  const image = post.image ? `/images/${post.image}` : "/images/background1.png";

  return { 
    title,
    description,
    openGraph: {
      title,
      description,
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary,
    "image": post.image ? `https://my-local-info-42x.pages.dev/images/${post.image}` : "",
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": "루미"
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
