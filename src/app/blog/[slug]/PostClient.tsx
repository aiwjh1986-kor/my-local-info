"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CoupangDynamicBanner from "@/components/CoupangDynamicBanner";

// 캐시 방지 버전
const V_NUM = "4";
const IMG_BASE = "/images/";

interface PostData {
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  image?: string;
  link?: string;
  tags: string[];
}

export default function PostClient({ initialPost }: { initialPost: PostData }) {
  const router = useRouter();
  const [post] = useState<PostData>(initialPost);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getCategoryStyles = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === "grant" || c === "지원금") return "bg-orange-500 text-white";
    if (c === "event" || c === "행사" || c === "지역행사") return "bg-blue-500 text-white";
    if (c === "info" || c === "생활정보") return "bg-green-500 text-white";
    if (c === "book" || c === "도서소식" || c === "도서정보") return "bg-purple-500 text-white";
    return "bg-gray-500 text-white";
  };

  return (
    <div className="dashboard-container min-h-screen relative">
      {/* 🖼️ 상세페이지 배경 이미지 */}
      <div 
        className="fixed inset-0 z-[-1] opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url(${IMG_BASE}background1.png?v=${V_NUM})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      {/* 1. 메뉴 버튼 및 상단 퀵 내비게이션 */}
      <div className="fixed top-6 left-0 right-0 z-[60] px-6 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-6 left-5 z-[60] bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 lg:px-8 lg:py-4 rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center group pointer-events-auto"
        >
          <span className="text-xl lg:text-2xl font-extrabold text-gray-800 font-[family-name:var(--font-baloo-2)] tracking-wider group-hover:text-blue-600 transition-colors">MENU</span>
        </button>

        {/* 중앙 퀵 바로가기 (바보가기) */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/40 p-2 rounded-full shadow-2xl">
          <QuickLink icon={IMG_BASE + "icon-home.png?v=" + V_NUM} label="홈" onClick={() => router.push("/")} />
          <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          <QuickLink icon={IMG_BASE + "icon-grant.png?v=" + V_NUM} label="지원금 혜택" onClick={() => router.push("/?tab=지원금")} />
          <QuickLink icon={IMG_BASE + "icon-event.png?v=" + V_NUM} label="지역행사" onClick={() => router.push("/?tab=지역행사")} />
          <QuickLink icon={IMG_BASE + "icon-info.png?v=" + V_NUM} label="생활 정보" onClick={() => router.push("/?tab=생활정보")} />
          <QuickLink icon={IMG_BASE + "icon-book.png?v=" + V_NUM} label="도서 소식" onClick={() => router.push("/?tab=도서정보")} />
        </div>

        {/* 우측 여백 확보용 (균형) */}
        <div className="w-[80px] lg:w-[150px] hidden md:block" />
      </div>



      {/* 2. 사이드바 드로어 (홈 화면과 디자인 동기화) */}
      <aside className={`fixed left-0 top-0 bottom-0 w-[300px] lg:w-[420px] bg-white/95 backdrop-blur-2xl border-r border-gray-100 z-[110] flex flex-col p-8 lg:p-12 shadow-2xl transition-transform duration-500 ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between mb-8 lg:mb-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-14 h-14">
              <img src={IMG_BASE + "icon-menu-rabbit.png?v=" + V_NUM} alt="Menu Icon" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl lg:text-3xl font-black text-[#111111]">메뉴</h1>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-4xl lg:text-5xl text-gray-300 hover:text-gray-800">×</button>
        </div>
        
        <nav className="flex flex-col gap-3 lg:gap-6 overflow-y-auto no-scrollbar">
          <MenuLink onClick={() => router.push("/")} icon={IMG_BASE + "icon-home.png?v=" + V_NUM} label="홈" />
          <MenuLink onClick={() => router.push("/?tab=지원금")} icon={IMG_BASE + "icon-grant.png?v=" + V_NUM} label="지원금" />
          <MenuLink onClick={() => router.push("/?tab=지역행사")} icon={IMG_BASE + "icon-event.png?v=" + V_NUM} label="지역행사" />
          <MenuLink onClick={() => router.push("/?tab=생활정보")} icon={IMG_BASE + "icon-info.png?v=" + V_NUM} label="생활정보" />
          <MenuLink onClick={() => router.push("/?tab=도서정보")} icon={IMG_BASE + "icon-book.png?v=" + V_NUM} label="도서정보" />
          <MenuLink onClick={() => router.push("/blog")} icon={IMG_BASE + "icon-blog.png?v=" + V_NUM} label="블로그" active={true} />
        </nav>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65]" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* 3. 본문 영역 (전체화면 스타일 적용) */}
      <main className="pt-24 lg:pt-32 pb-20 px-0 sm:px-6">
        <article className="max-w-[1600px] mx-auto bg-white rounded-none sm:rounded-[60px] lg:rounded-[80px] shadow-2xl overflow-hidden border-none sm:border border-white">
          {/* 포스트 헤더 */}
          <header className="p-10 lg:p-24 bg-gradient-to-br from-white to-gray-50 border-b border-gray-100">
            {post.image && (
              <div className="mb-12 lg:mb-24 rounded-[40px] lg:rounded-[80px] overflow-hidden shadow-2xl aspect-video">
                <img 
                  src={IMG_BASE + post.image.replace(".png", "") + ".png?v=" + V_NUM} 
                  className="w-full h-full object-cover" 
                  alt={post.title} 
                />
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <span className={`px-6 py-2 ${getCategoryStyles(post.category)} text-xs lg:text-xl font-black rounded-full uppercase tracking-widest shadow-lg`}>
                {post.category === "grant" ? "지원금" : 
                 post.category === "event" || post.category === "행사" || post.category === "지역행사" ? "지역행사" : 
                 post.category === "info" ? "생활정보" : 
                 post.category === "book" ? "도서소식" : post.category}
              </span>
              <time className="text-sm lg:text-2xl font-bold text-gray-300">{post.date}</time>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-8xl font-black text-[#111111] mb-6 lg:mb-10 leading-tight tracking-tighter font-handwriting">
              {post.title}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-3xl text-gray-500 font-bold leading-relaxed opacity-80">
              {post.summary}
            </p>
          </header>

          {/* 본문 콘텐츠 */}
          <div className="p-10 lg:p-24">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: (props) => <p className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold mb-6 lg:mb-12 leading-[1.6] text-gray-700" {...props} />,
                  h1: (props) => <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black mb-8 lg:mb-20 text-[#111111] tracking-tighter" {...props} />,
                  h2: (props) => <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black mb-6 lg:mb-16 text-[#111111] tracking-tighter border-b-4 border-accent/10 pb-3" {...props} />,
                  h3: (props) => <h3 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-black mb-4 lg:mb-12 text-[#111111] tracking-tighter" {...props} />,
                  li: (props) => <li className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-10 ml-6 lg:ml-12 list-disc text-gray-700" {...props} />,
                  strong: (props) => <strong className="font-black text-accent border-b-2 border-accent/20" {...props} />,
                  img: (props) => <img className="rounded-[20px] lg:rounded-[60px] shadow-2xl my-8 lg:my-12 w-full object-cover aspect-video" {...props} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* 🛍️ 쿠팡 파트너스 다이나믹 배너 */}
            <div className="mt-20 mb-10">
              <CoupangDynamicBanner />
            </div>

            {/* 태그 영역 */}
            <div className="mt-12 pt-12 border-t border-gray-50 flex flex-wrap gap-4">
              {post.tags?.map((tag) => (
                <span key={tag} className="px-6 py-2 bg-gray-50 text-gray-400 text-sm lg:text-2xl font-black rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            {/* 하단 버튼 영역 */}
            <div className="mt-20 flex flex-col lg:flex-row gap-8">
              {post.link && (
                <button 
                  onClick={() => window.open(post.link, "_blank")}
                  className="flex-1 py-10 lg:py-14 bg-accent text-white rounded-[40px] lg:rounded-[60px] font-black text-2xl lg:text-5xl shadow-2xl hover:scale-[1.02] transition-all"
                >
                  공식 홈페이지 바로가기 ➔
                </button>
              )}
              <button 
                onClick={() => router.push("/")}
                className="py-10 lg:py-14 px-12 lg:px-20 bg-gray-100 text-gray-400 rounded-[40px] lg:rounded-[60px] font-black text-2xl lg:text-5xl"
              >
                목록으로
              </button>
            </div>
          </div>
        </article>
      </main>

      {/* 5. 우측 하단 플로팅 버튼 (홈 & TOP) */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col gap-4">
        <button 
          onClick={() => router.push("/")}
          className="w-16 h-16 lg:w-24 h-24 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-110 hover:bg-white transition-all group p-2"
          title="홈으로"
        >
          <span className="text-accent text-2xl lg:text-5xl font-black group-hover:scale-110 transition-transform">H</span>
          <span className="text-[10px] lg:text-lg font-black tracking-tighter text-accent">HOME</span>
        </button>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-16 h-16 lg:w-24 h-24 bg-accent text-white rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-110 transition-all"
          title="맨 위로"
        >
          <span className="text-2xl lg:text-4xl">▲</span>
          <span className="text-[10px] lg:text-lg font-black tracking-tighter">TOP</span>
        </button>
      </div>
    </div>
  );
}

function MenuLink({ onClick, icon, label, active = false }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center px-5 lg:px-10 py-3 lg:py-8 rounded-[20px] lg:rounded-[50px] transition-all font-black cursor-pointer group ${
        active ? "bg-accent text-white shadow-2xl scale-[1.05]" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3 lg:gap-10">
        <div className="w-10 h-10 lg:w-32 h-32 flex items-center justify-center p-1 transform group-hover:scale-110 transition-transform">
          <img src={icon} className="w-full h-full object-contain" alt={label} />
        </div>
        <span className="text-sm lg:text-[32px] tracking-tighter whitespace-nowrap">{label}</span>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, onClick, isMobile = false }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 lg:gap-2.5 px-3 lg:px-6 py-1.5 lg:py-2.5 rounded-full hover:bg-gray-50 transition-all group ${isMobile ? "bg-white/50" : ""}`}
    >
      <div className="w-5 h-5 lg:w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
        <img src={icon} className="w-full h-full object-contain" alt={label} />
      </div>
      <span className="text-[10px] lg:text-sm font-black text-gray-700 whitespace-nowrap">{label}</span>
    </button>
  );
}
