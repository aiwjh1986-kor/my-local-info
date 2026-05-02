import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import BlogListClient from './BlogListClient';

export default function BlogPage() {
  const allPosts = getSortedPostsData().map(p => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    summary: p.summary,
    category: p.category,
    image: p.image
  }));

  return <BlogListClient allPosts={allPosts} />;
}
