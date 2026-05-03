"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CoupangDynamicBanner from "@/components/CoupangDynamicBanner";

// 캐시 방지 버전
const V_NUM = "5";
const IMG_BASE = "/images/";

export default function BlogListClient({ allPosts }: { allPosts: any[] }) {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState("전체");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ["전체", "지원금", "지역행사", "생활정보", "도서정보"];
  
  const getCategoryStyles = (cat: string) => {
    const c = (cat || "").toLowerCase();
    if (c === "grant" || c === "지원금") return "bg-orange-100 text-orange-600 border-orange-200";
    if (c === "event" || c === "행사") return "bg-blue-100 text-blue-600 border-blue-200";
    if (c === "info" || c === "생활정보") return "bg-green-100 text-green-600 border-green-200";
    if (c === "book" || c === "도서소식" || c === "도서정보") return "bg-purple-100 text-purple-600 border-purple-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const filteredPosts = activeCat === "전체" 
    ? allPosts 
    : allPosts.filter(p => {
        const catMap: any = { "지원금": "grant", "지역행사": "event", "생활정보": "info", "도서정보": "book" };
        const target = catMap[activeCat] || activeCat;
        return p.category === target || 
               p.category === activeCat || 
               (activeCat === "지역행사" && (p.category === "행사" || p.category === "event"));
      });

  return (
    <div className="min-h-screen font-sans text-gray-900 pb-20 relative">
      {/* 🖼️ 블로그 배경 이미지 */}
      <div 
        className="fixed inset-0 z-[-1] opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(${IMG_BASE}background1.png?v=${V_NUM})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      {/* 🏮 메뉴 버튼 (상단 바 없이 단독으로 플로팅) */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 left-5 z-[60] bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 lg:px-8 lg:py-4 rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
      >
        <span className="text-xl lg:text-2xl font-extrabold text-gray-800 font-[family-name:var(--font-baloo-2)] tracking-wider group-hover:text-blue-600 transition-colors">MENU</span>
      </button>

      {/* 2. 사이드바 드로어 (홈 화면과 동일) */}
      <aside className={`fixed left-0 top-0 bottom-0 w-[320px] lg:w-[450px] bg-white/95 backdrop-blur-2xl border-r border-gray-100 z-[70] flex flex-col p-8 lg:p-14 shadow-2xl transition-transform duration-500 ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between mb-10 lg:mb-20">
          <div className="flex items-center gap-5">
            <span className="text-3xl lg:text-5xl">🏮</span>
            <h1 className="text-xl lg:text-4xl font-black text-[#111111]">메뉴</h1>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-4xl lg:text-6xl text-gray-300 hover:text-gray-800">×</button>
        </div>
        
        <nav className="flex flex-col gap-4 lg:gap-8 overflow-y-auto no-scrollbar">
          <MenuLink onClick={() => router.push("/")} icon={IMG_BASE + "icon-home.png?v=" + V_NUM} label="홈" />
          <MenuLink onClick={() => router.push("/")} icon={IMG_BASE + "icon-grant.png?v=" + V_NUM} label="지원금" />
          <MenuLink onClick={() => router.push("/")} icon={IMG_BASE + "icon-event.png?v=" + V_NUM} label="지역행사" />
          <MenuLink onClick={() => router.push("/")} icon={IMG_BASE + "icon-info.png?v=" + V_NUM} label="생활정보" />
          <MenuLink onClick={() => router.push("/")} icon={IMG_BASE + "icon-blog.png?v=" + V_NUM} label="블로그" active={true} />
          <MenuLink onClick={() => router.push("/")} icon={IMG_BASE + "icon-notice.png?v=" + V_NUM} label="공지" />
        </nav>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65]" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* 퀵 내비게이션 바 (중앙/우측 조절) */}
      <div className="fixed top-6 left-0 right-0 z-[60] px-6 flex items-center justify-between pointer-events-none">
        <div className="w-[120px] lg:w-[150px] hidden md:block" /> {/* 좌측 여백 확보용 */}

        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/40 p-2 rounded-full shadow-2xl">
          <QuickLink icon={IMG_BASE + "icon-home.png?v=" + V_NUM} label="홈" onClick={() => router.push("/")} />
          <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          <QuickLink icon={IMG_BASE + "icon-grant.png?v=" + V_NUM} label="지원금 혜택" onClick={() => router.push("/?tab=지원금")} />
          <QuickLink icon={IMG_BASE + "icon-event.png?v=" + V_NUM} label="지역행사" onClick={() => router.push("/?tab=지역행사")} />
          <QuickLink icon={IMG_BASE + "icon-info.png?v=" + V_NUM} label="생활 정보" onClick={() => router.push("/?tab=생활정보")} />
          <QuickLink icon={IMG_BASE + "icon-book.png?v=" + V_NUM} label="도서 소식" onClick={() => router.push("/?tab=도서정보")} />
        </div>

        <div className="w-[80px] lg:w-[150px] hidden md:block" />
      </div>

      {/* 2. 히어로 타이틀 영역 */}
      <header className="pt-48 lg:pt-48 pb-12 lg:pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-top duration-1000">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-gray-900 mb-6 lg:mb-10 tracking-tighter font-handwriting drop-shadow-sm">
            루미의 <span className="text-blue-600 underline decoration-blue-200 decoration-8 underline-offset-8">생생 블로그</span>
          </h1>
          <p className="text-sm md:text-xl lg:text-3xl text-gray-700 font-black leading-relaxed font-handwriting px-6">
            용인시의 알찬 정보와 따끈따끈한 소식을 전해드려요!
          </p>
        </div>
      </header>

      {/* 3. 카테고리 필터 */}
      <div className="sticky top-28 z-[50] mb-12 px-6 overflow-x-auto no-scrollbar py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-white/50 shadow-lg w-max md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-6 lg:px-10 py-3 lg:py-4 rounded-2xl text-sm lg:text-xl font-black whitespace-nowrap transition-all ${
                activeCat === cat
                  ? "bg-accent text-white shadow-xl shadow-accent/20 scale-105"
                  : "text-gray-500 hover:bg-white hover:text-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 블로그 포스트 그리드 */}
      <main className="max-w-7xl mx-auto px-6">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPosts.map((post, idx) => (
              <article 
                key={post.slug || idx} 
                className="group bg-white rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white hover:-translate-y-2 flex flex-col"
              >
                <Link href={`/blog/${post.slug}`} className="block flex-1 flex flex-col">
                  {/* 카드 이미지 */}
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    <img 
                      src={IMG_BASE + (post.image || "thumb-default.png").replace(".png", "") + ".png?v=" + V_NUM} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-2 backdrop-blur-md rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest shadow-lg border ${getCategoryStyles(post.category)}`}>
                        {post.category === "grant" ? "지원금" : 
                         post.category === "event" || post.category === "지역행사" || post.category === "행사" ? "지역행사" : 
                         post.category === "info" ? "생활정보" : 
                         post.category === "book" ? "도서소식" : post.category}
                      </span>
                    </div>
                  </div>

                  {/* 카드 내용 */}
                  <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between">
                    <div>
                      <time className="text-[10px] lg:text-sm font-bold text-gray-300 mb-4 block uppercase tracking-widest">{post.date}</time>
                      <h3 className="text-2xl lg:text-4xl font-black text-gray-800 mb-4 lg:mb-6 leading-tight group-hover:text-accent transition-colors font-handwriting">
                        {post.title}
                      </h3>
                      <p className="text-sm lg:text-xl text-gray-400 font-bold leading-relaxed line-clamp-3 mb-8">
                        {post.summary}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                      <span className="text-xs lg:text-lg font-black text-accent uppercase tracking-widest">Read More</span>
                      <span className="w-10 h-10 lg:w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all transform group-hover:rotate-45">
                        ➔
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[60px] border-4 border-dashed border-gray-100">
            <span className="text-8xl mb-10 block">🏜️</span>
            <p className="text-2xl lg:text-4xl font-black text-gray-300 font-handwriting">아직 등록된 블로그 글이 없습니다!</p>
          </div>
        )}
        {/* 🛍️ 쿠팡 파트너스 다이나믹 배너 (블로그 목록 하단) */}
        <div className="mt-20 max-w-4xl mx-auto">
          <CoupangDynamicBanner />
        </div>

        {/* 우측 하단 플로팅 버튼 (홈 & TOP) */}
        <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
          <button
            onClick={() => {
              router.push("/");
            }}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex flex-col items-center justify-center group active:scale-90 transition-all"
          >
            <span className="text-blue-600 text-lg font-black group-hover:scale-110 transition-transform">H</span>
            <span className="text-[7px] font-black text-blue-600">HOME</span>
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-12 h-12 bg-blue-600/90 backdrop-blur-md rounded-2xl shadow-lg shadow-blue-200 flex flex-col items-center justify-center group active:scale-90 transition-all border border-blue-400/30"
          >
            <span className="text-white text-lg group-hover:-translate-y-1 transition-transform">▲</span>
            <span className="text-[7px] font-black text-white">TOP</span>
          </button>
        </div>
      </main>

      {/* 🏮 프리미엄 푸터 (홈 화면과 동일) */}
      <footer className="mt-40 bg-white/50 backdrop-blur-xl border-t border-gray-100 py-24 px-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-20 h-20">
                <img src={IMG_BASE + "icon-menu-rabbit.png?v=" + V_NUM} className="w-full h-full object-contain" alt="Lumi" />
              </div>
              <span className="text-2xl lg:text-4xl font-black text-gray-800 tracking-tighter font-handwriting">LUMI GUIDE</span>
            </div>
            <p className="text-gray-400 text-sm lg:text-xl font-bold whitespace-nowrap">용인시의 모든 정보가 모이는 곳</p>
          </div>

          {/* 📊 방문자 상태 표시 */}
          <div className="flex items-center gap-4 lg:gap-10 bg-white/80 p-6 lg:p-8 rounded-[40px] border border-white shadow-2xl">
            <div className="flex items-center gap-3 px-6 bg-blue-500/5 py-3 rounded-full border border-blue-500/10">
              <span className="text-lg">👥</span>
              <span className="text-[10px] lg:text-sm font-black text-blue-600 uppercase tracking-widest">Welcome Visitor</span>
            </div>
            <div className="flex items-center gap-3 px-6 bg-green-500/5 py-3 rounded-full border border-green-500/10">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] lg:text-sm font-black text-green-600 uppercase tracking-widest">Live Connect</span>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-3 text-gray-400 text-xs lg:text-xl font-bold">
            <p>© {new Date().getFullYear()} LUMI GUIDE. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
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

function QuickLink({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2.5 px-6 py-2.5 rounded-full hover:bg-gray-50 transition-all group"
    >
      <div className="w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
        <img src={icon} className="w-full h-full object-contain" alt={label} />
      </div>
      <span className="text-sm font-black text-gray-700 whitespace-nowrap">{label}</span>
    </button>
  );
}
