import { getPostBySlug, getPostSlugs } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getPostSlugs();
  return posts.map((post) => ({
    slug: post.replace(/\.md$/, ''),
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  return (
    <div className="min-h-screen bg-pink-50 text-rose-950 font-sans pb-16">
      <header className="bg-pink-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-black text-pink-600 tracking-tight flex items-center gap-2">
            <span className="text-2xl">🌸</span> 성남시 생활 정보
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm font-bold text-pink-600 hover:text-pink-800 transition">블로그</Link>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 pt-12">
        <div className="mb-8 border-b-2 border-pink-100 pb-8">
          <Link href="/blog" className="text-pink-500 hover:text-pink-700 font-semibold mb-6 inline-flex items-center gap-1">
            <span>&larr;</span> 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-rose-900 mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-rose-700/80 text-sm font-medium">
            <p>📅 {post.date}</p>
            {post.category && <p>🏷️ {post.category}</p>}
          </div>
        </div>
        <article className="prose prose-pink lg:prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
