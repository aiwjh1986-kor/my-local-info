"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TipData } from "@/lib/posts";

const V_NUM = "15";
const IMG_BASE = "/images/";

export default function TipsListClient({ allTips }: { allTips: TipData[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTips = allTips.filter(tip => {
    return tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           tip.summary.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getImageUrl = (path: string) => {
    if (!path) return "/images/background1.png";
    if (path.startsWith("http")) return path;
    let cleanPath = path;
    if (cleanPath.startsWith("/images/")) cleanPath = cleanPath.replace("/images/", "");
    if (cleanPath.startsWith("images/")) cleanPath = cleanPath.replace("images/", "");
    return `${IMG_BASE}${cleanPath}?v=${V_NUM}`;
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 pb-20 relative overflow-x-hidden">
      {/* 🖼️ 배경 */}
      <div 
        className="fixed inset-0 z-[-1] opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url(${getImageUrl("background1.png")})`,
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
        <span className="text-xl lg:text-2xl font-extrabold text-gray-800 tracking-wider group-hover:text-blue-600 transition-colors uppercase">MENU</span>
      </button>

      {/* 2. 사이드바 드로어 */}
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
          <MenuLink onClick={() => router.push("/blog")} icon={IMG_BASE + "icon-blog.png?v=" + V_NUM} label="블로그" />
          <MenuLink onClick={() => router.push("/tips")} icon={IMG_BASE + "icon-ggul.png?v=" + V_NUM} label="실생활 꿀팁" active={true} />
        </nav>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65]" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* 퀵 내비게이션 바 */}
      <div className="fixed top-6 left-0 right-0 z-[60] px-6 flex items-center justify-between pointer-events-none">
        <div className="w-[120px] lg:w-[150px] hidden md:block" />
        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/40 p-2 rounded-full shadow-2xl">
          <QuickLink icon={IMG_BASE + "icon-home.png?v=" + V_NUM} label="홈" onClick={() => router.push("/")} />
          <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          <QuickLink icon={IMG_BASE + "icon-grant.png?v=" + V_NUM} label="지원금 혜택" onClick={() => router.push("/?tab=지원금")} />
          <QuickLink icon={IMG_BASE + "icon-event.png?v=" + V_NUM} label="지역행사" onClick={() => router.push("/?tab=지역행사")} />
          <QuickLink icon={IMG_BASE + "icon-info.png?v=" + V_NUM} label="생활 정보" onClick={() => router.push("/?tab=생활정보")} />
          <QuickLink icon={IMG_BASE + "icon-ggul.png?v=" + V_NUM} label="실생활 꿀팁" onClick={() => router.push("/tips")} />
        </div>
        <div className="w-[80px] lg:w-[150px] hidden md:block" />
      </div>

      {/* 🏮 헤더 영역 */}
      <header className="pt-32 lg:pt-48 pb-6 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-gray-900 mb-6 tracking-tighter font-handwriting">
            루미의 <span className="text-yellow-500 underline decoration-yellow-200 decoration-8 underline-offset-8">꿀팁 저장소</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 font-bold font-handwriting">
            생활이 즐거워지는 알짜배기 지혜들을 모았습니다!
          </p>
        </div>
      </header>

      {/* 🔍 검색창 */}
      <div className="max-w-2xl mx-auto px-6 mb-8 relative z-[55]">
        <div className="relative group">
          <input
            type="text"
            placeholder="어떤 꿀팁을 찾고 계신가요? (예: 신발, 과일, 청소)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-xl border-2 border-white rounded-[30px] px-8 py-5 lg:py-6 text-lg lg:text-xl font-bold shadow-2xl focus:outline-none focus:border-yellow-400 transition-all placeholder:text-gray-300"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl lg:text-3xl">
            {searchQuery ? (
              <button onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500">×</button>
            ) : (
              "🔍"
            )}
          </div>
        </div>
        {searchQuery && (
          <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="bg-yellow-400/90 text-gray-900 px-6 py-2 rounded-full text-sm font-black shadow-lg">
              "{searchQuery}" 검색 결과 {filteredTips.length}개를 찾았어요!
            </span>
          </div>
        )}
      </div>

      {/* 🗂️ 꿀팁 그리드 */}
      <main className="max-w-7xl mx-auto px-6">
        {filteredTips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTips.map((tip) => (
              <Link 
                key={tip.slug} 
                href={`/tips/${tip.slug}`}
                className="group bg-white rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white hover:-translate-y-2 flex flex-col"
              >
                {/* ... (기존 카드 내용 동일) */}
                <div className="relative aspect-video overflow-hidden bg-gray-50">
                  <img 
                    src={getImageUrl(tip.image)} 
                    alt={tip.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400/90 backdrop-blur-md text-gray-900 text-[10px] lg:text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                      {tip.category}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-yellow-600 transition-colors line-clamp-2 font-handwriting">
                      {tip.title}
                    </h3>
                    <p className="text-sm lg:text-base text-gray-500 font-bold leading-relaxed line-clamp-3 mb-6">
                      {tip.summary}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-yellow-600 font-black text-sm uppercase tracking-widest">
                    <span>자세히 보기</span>
                    <span className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-white transition-all">
                      ➔
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white/50 backdrop-blur-md rounded-[60px] border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-6">🏜️</div>
            <h3 className="text-2xl lg:text-4xl font-black text-gray-900 mb-4">앗! 찾는 꿀팁이 없어요</h3>
            <p className="text-gray-500 font-bold mb-10">다른 검색어로 찾아보시겠어요? 아니면 루미에게 제안해 주세요!</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="bg-yellow-400 text-gray-900 px-10 py-4 rounded-full font-black shadow-xl hover:scale-105 transition-all"
            >
              검색어 초기화하기
            </button>
          </div>
        )}

        {/* 우측 하단 플로팅 버튼 (홈 & TOP) */}
        <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
          <button
            onClick={() => router.push("/")}
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

      {/* 🏮 푸터 */}
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
      className={`flex items-center px-4 lg:px-6 py-2 lg:py-4 rounded-[16px] lg:rounded-[24px] transition-all font-black cursor-pointer group ${
        active ? "bg-yellow-400 text-gray-900 shadow-lg scale-[1.02]" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3 lg:gap-6">
        <div className="w-8 h-8 lg:w-12 h-12 flex items-center justify-center p-1 transform group-hover:scale-110 transition-transform">
          <img src={icon} className="w-full h-full object-contain" alt={label} />
        </div>
        <span className="text-sm lg:text-lg tracking-tighter whitespace-nowrap">{label}</span>
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
