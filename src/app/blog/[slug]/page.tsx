import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostData, getSortedPostsData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import AdBanner from '@/components/AdBanner';
import CoupangBanner from '@/components/CoupangBanner';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | 용인시 생활 정보 블로그`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postData = getPostData(slug);

  if (!postData) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postData.title,
    "datePublished": postData.date,
    "description": postData.summary,
    "author": {
      "@type": "Organization",
      "name": "용인시 생활 정보"
    },
    "publisher": {
      "@type": "Organization",
      "name": "용인시 생활 정보",
      "logo": {
        "@type": "ImageObject",
        "url": "https://my-local-info-42x.pages.dev/og-image.png"
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-extrabold text-orange-600 font-[family-name:var(--font-baloo-2)]">
              용인시 생활정보 및 여행가이드 🏠
            </h1>
          </Link>
          <nav className="flex gap-4 font-bold text-gray-600">
            <Link href="/" className="hover:text-orange-600 transition-colors">홈</Link>
            <Link href="/blog" className="hover:text-orange-600 transition-colors">블로그</Link>
            <Link href="/about" className="hover:text-orange-600 transition-colors">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* 포스트 헤더 */}
        <div className="mb-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-4">
            {postData.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {postData.title}
          </h1>
          <div className="flex flex-col items-center gap-2 text-gray-400 text-sm font-medium">
            <div className="flex items-center gap-4">
              <time className="font-mono">{postData.date}</time>
              <span>•</span>
              <div className="flex gap-2">
                {postData.tags.map(tag => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400">최종 업데이트: {postData.date}</p>
          </div>
        </div>

        {/* 본문 (Markdown) */}
        <div className="prose prose-orange lg:prose-xl max-w-none mx-auto prose-headings:font-bold prose-a:text-orange-600 prose-img:rounded-3xl shadow-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {postData.content}
          </ReactMarkdown>
        </div>

        {/* E-E-A-T 정보 영역 */}
        <div className="mt-16 p-8 bg-orange-50 rounded-3xl border border-orange-100">
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            이 글은 공공데이터포털(<a href="http://data.go.kr/" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">data.go.kr</a>)의 정보를 바탕으로 AI가 작성하였습니다. 정확한 내용은 아래 원문 링크를 통해 확인해 주세요.
          </p>
          {postData.link && (
            <a 
              href={postData.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-orange-200 text-orange-600 rounded-xl font-bold hover:bg-orange-600 hover:text-white transition-all shadow-sm"
            >
              <span>🔗 원문 출처 및 상세 정보 보기</span>
            </a>
          )}
        </div>

        {/* 광고 영역 */}
        <AdBanner />
        <CoupangBanner />

        {/* 하단 네비게이션 */}
        <div className="mt-20 pt-10 border-t border-gray-100 flex justify-center">
          <Link 
            href="/blog"
            className="px-8 py-3 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-orange-500 hover:text-white transition-all"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 mt-20">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-400 text-xs">
          © {new Date().getFullYear()} 용인시 생활정보 및 여행가이드 | 블로그 상세
        </div>
      </footer>
    </div>
  );
}
