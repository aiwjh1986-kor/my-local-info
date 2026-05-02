import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostData, getSortedPostsData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | 용인생활가이드`,
    description: post.summary,
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

  return (
    <div className="dashboard-container">
      {/* 1. 좌측 사이드바 (메인과 동일) */}
      <aside className="sidebar-left p-6 flex flex-col">
        <div className="mb-10 flex items-center gap-2 px-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏮</span>
            <span className="text-xl font-black tracking-tighter">용인생활가이드</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            <span>🏠</span><span>홈</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-accent text-white shadow-lg shadow-accent/20 font-bold text-sm transition-all">
            <span>💰</span><span>상세보기</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            <span>📅</span><span>행사</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            <span>🌿</span><span>생활정보</span>
          </Link>
        </nav>

        <div className="mt-auto p-4 bg-accent-light rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">L</div>
          <div>
            <p className="text-xs font-black">루미 에디터 🐈‍⬛</p>
            <p className="text-[10px] text-accent font-bold">우리동네 소식통</p>
          </div>
        </div>
      </aside>

      {/* 2. 본문 영역 (Main Content) */}
      <main className="main-content bg-white min-h-screen">
        <div className="max-w-3xl mx-auto py-12">
          {/* 상단 네비게이션 */}
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-accent flex items-center gap-2 mb-10 transition-colors">
            ← 목록으로 돌아가기
          </Link>

          {/* 포스트 헤더 */}
          <header className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-accent-light text-accent text-[10px] font-black rounded-md uppercase tracking-widest">
                {postData.category}
              </span>
              <time className="text-xs font-bold text-gray-300">{postData.date}</time>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#111111] mb-8 leading-tight">
              {postData.title}
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              {postData.summary}
            </p>
          </header>

          {/* 본문 (Markdown) */}
          <article className="prose prose-lg max-w-none prose-headings:text-[#111111] prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-accent prose-a:text-accent prose-img:rounded-3xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {postData.content}
            </ReactMarkdown>
          </article>

          {/* 정보 출처 카드 */}
          <div className="mt-20 p-8 glass-card bg-gray-50 border-none flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">🏮</div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-black text-lg mb-2">정확한 정보 확인이 필요하신가요?</h4>
              <p className="text-sm text-gray-500 mb-6 font-medium">본 정보는 공공데이터를 기반으로 AI 에디터 루미가 정리했습니다. 원문 링크를 통해 더 자세한 내용을 확인하실 수 있습니다.</p>
              {postData.link && (
                <a 
                  href={postData.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-[#111111] text-white rounded-xl font-bold hover:bg-accent transition-all"
                >
                  공식 홈페이지 바로가기 →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <footer className="max-w-3xl mx-auto mt-20 py-10 border-t border-gray-100 flex justify-between items-center text-[#999999] text-[11px] font-bold">
          <p>© {new Date().getFullYear()} Yongin Guide. All rights reserved.</p>
          <div className="flex gap-6">
            <span>이용안내</span>
            <span>문의하기</span>
          </div>
        </footer>
      </main>

      {/* 3. 우측 정보바 (상세 페이지에서는 심플하게) */}
      <aside className="sidebar-right space-y-6">
        <div className="glass-card p-6 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">글쓴이</p>
          <div className="w-20 h-20 bg-accent-light rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
             <img src="/images/black-cat-hero.png" alt="Lumi" className="w-full h-full object-cover scale-150 mt-4" />
          </div>
          <h5 className="font-black text-[#111111] mb-1">에디터 루미</h5>
          <p className="text-[10px] text-gray-400 font-bold">Yongin Life Specialist</p>
        </div>

        <div className="glass-card p-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">관련 태그</p>
          <div className="flex flex-wrap gap-2">
            {postData.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg hover:bg-accent-light hover:text-accent cursor-pointer transition-all">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
