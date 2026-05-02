import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function BlogPage() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-900">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <Link href="/">
              <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
                성남시 생활 정보 🏠
              </h1>
            </Link>
            <p className="mt-1 text-gray-600 text-sm">
              우리 동네의 유용한 정보와 소식을 전합니다.
            </p>
          </div>
          <nav className="flex gap-6 font-bold text-gray-600">
            <Link href="/" className="hover:text-orange-600 transition-colors">홈</Link>
            <Link href="/blog" className="text-orange-600 underline decoration-2 underline-offset-8">블로그</Link>
            <Link href="/about" className="hover:text-orange-600 transition-colors">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">📝</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">최신 블로그 소식</h2>
        </div>

        {allPostsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allPostsData.map(({ slug, date, title, summary, category }) => (
              <article key={slug} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-orange-50 group">
                <Link href={`/blog/${slug}`} className="block h-full flex flex-col">
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                        {category}
                      </span>
                      <time className="text-sm text-gray-400 font-mono">{date}</time>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {summary}
                    </p>
                  </div>
                  <div className="px-8 py-4 bg-orange-50/50 border-t border-orange-100 text-orange-600 text-sm font-bold flex justify-between items-center">
                    읽어보기
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-orange-200">
            <p className="text-gray-400">아직 등록된 블로그 글이 없습니다. 곧 재미있는 소식을 들고 올게요!</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} 성남시 생활 정보 | 블로그
          </p>
        </div>
      </footer>
    </div>
  );
}
