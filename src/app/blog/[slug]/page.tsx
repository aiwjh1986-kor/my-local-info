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
  return { title: post.title + " | 용인생활가이드" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  return <PostClient initialPost={post} />;
}
