"use client";

import { useState } from "react";
import Link from "next/link";
import data from "../../public/data/local-info.json";
import featuredCards from "../../public/data/featured-cards.json";

interface FeaturedCard {
  category: string;
  title: string;
  summary: string;
  date: string;
  region: string;
  cta: string;
  deadline: string | null;
  is_urgent: boolean;
  is_popular: boolean;
}

const V = "2";

export default function Home() {
  const { lastUpdate } = data;
  const [activeTab, setActiveTab] = useState("홈");

  // 데이터 분류
  const urgentCards = featuredCards.filter(c => c.is_urgent).slice(0, 3);
  const latestCards = [...featuredCards].reverse().slice(0, 3);
  const popularCards = featuredCards.filter(c => c.is_popular).slice(0, 3);

  // 카테고리별 필터링 데이터
  const filteredCards = featuredCards.filter(c => {
    if (activeTab === "관광지 정보") return c.category === "행사" || c.title.includes("축제") || c.title.includes("정사");
    return c.category === activeTab;
  });

  return (
    <div className="dashboard-container">
      {/* 1. 반응형 사이드바 (모바일: 상단 / 데스크탑: 왼쪽) */}
      <aside className="sidebar-left p-4 lg:p-12 flex flex-col">
        {/* 로고 영역 */}
        <div className="flex items-center gap-3 lg:gap-5 px-2 mb-4 lg:mb-8">
          <span className="text-2xl lg:text-5xl">🏮</span>
          <h1 className="text-xl lg:text-4xl font-black tracking-tighter text-[#111111] whitespace-nowrap">용인생활가이드</h1>
        </div>
        
        {/* 메뉴 네비게이션 (모바일 가로 스크롤 강제) */}
        <nav className="flex lg:flex-col gap-2 lg:gap-5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar select-none">
          <MenuLink onClick={() => setActiveTab("홈")} icon={`/images/icon-home.png?v=${V}`} label="홈" active={activeTab === "홈"} />
          <MenuLink onClick={() => setActiveTab("지원금")} icon={`/images/icon-grant.png?v=${V}`} label="지원금" active={activeTab === "지원금"} />
          <MenuLink onClick={() => setActiveTab("행사")} icon={`/images/icon-event.png?v=${V}`} label="행사" active={activeTab === "행사"} />
          <MenuLink onClick={() => setActiveTab("생활정보")} icon={`/images/icon-info.png?v=${V}`} label="생활정보" active={activeTab === "생활정보"} />
          <MenuLink onClick={() => setActiveTab("관광지 정보")} icon={`/images/icon-bus.png?v=${V}`} label="관광" active={activeTab === "관광지 정보"} />
          <MenuLink onClick={() => setActiveTab("공지사항")} icon={`/images/icon-notice.png?v=${V}`} label="공지" active={activeTab === "공지사항"} />
        </nav>

        {/* 데스크탑에서만 보이는 섹션 */}
        <div className="hidden lg:block pt-12 border-t border-gray-100 mt-10">
          <p className="text-[14px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10 px-6">MY FAVORITE</p>
          <div className="space-y-4">
            <MenuLink onClick={() => setActiveTab("마감임박")} icon={`/images/icon-clock.png?v=${V}`} label="마감임박" count={urgentCards.length} active={activeTab === "마감임박"} />
            <MenuLink onClick={() => setActiveTab("관심목록")} icon={`/images/icon-heart.png?v=${V}`} label="관심목록" count={5} active={activeTab === "관심목록"} />
          </div>
        </div>
      </aside>

      {/* 2. 메인 영역 */}
      <main className="main-content">
        {/* 검색바 (모바일 사이즈 최적화) */}
        <div className="mb-6 lg:mb-14 relative">
          <input 
            type="text" 
            placeholder="정보 검색..." 
            className="w-full h-14 lg:h-24 pl-12 lg:pl-20 pr-8 rounded-[20px] lg:rounded-[40px] bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-accent/10 font-bold text-base lg:text-2xl"
          />
          <span className="absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 text-lg lg:text-3xl text-gray-400">🔍</span>
        </div>

        {activeTab === "홈" ? (
          <>
            <section className="bg-gradient-to-br from-[#F8FAFF] to-[#F2F4F8] rounded-[32px] lg:rounded-[80px] overflow-hidden relative mb-10 lg:mb-28 min-h-[300px] lg:min-h-[720px] flex flex-col justify-center lg:justify-between border border-white shadow-xl">
              <div className="p-6 lg:p-32 relative z-10">
                <div className="inline-flex items-center gap-2 lg:gap-5 px-4 lg:px-10 py-1.5 lg:py-4 bg-white text-accent rounded-full mb-4 lg:mb-16 shadow-md border border-white">
                  <span className="text-[10px] lg:text-base font-black tracking-widest flex items-center gap-2 lg:gap-4">
                    <span className="w-1.5 lg:w-2.5 h-1.5 lg:h-2.5 bg-accent rounded-full animate-pulse"></span> YONGIN GUIDE
                  </span>
                </div>

                <h2 className="text-3xl lg:text-[100px] font-black mb-4 lg:mb-14 leading-tight lg:leading-[1.0] text-[#111111] tracking-tighter">
                  용인의 모든 정보,<br className="hidden lg:block" />
                  <span className="text-accent">한눈에 빠르게!</span>
                </h2>
                <p className="text-gray-400 text-sm lg:text-[32px] font-bold mb-8 lg:mb-24 max-w-4xl leading-snug">
                  지원금, 행사, 관광지 정보를 확인하세요.
                </p>

                <div className="flex flex-col lg:flex-row gap-3 lg:gap-12 relative z-20">
                  <button onClick={() => setActiveTab("지원금")} className="px-6 lg:px-20 py-3.5 lg:py-10 bg-accent text-white rounded-[16px] lg:rounded-[48px] font-black hover:scale-105 transition-all text-sm lg:text-3xl shadow-lg">
                    지원금 확인 →
                  </button>
                  <button onClick={() => setActiveTab("관광지 정보")} className="px-6 lg:px-20 py-3.5 lg:py-10 bg-white text-gray-400 rounded-[16px] lg:rounded-[48px] font-black hover:bg-gray-50 transition-all border border-gray-100 text-sm lg:text-3xl shadow-sm">
                    관광지 가이드 →
                  </button>
                </div>
              </div>

              {/* 주인공 토끼 (모바일에서는 작게 배경으로) */}
              <div className="absolute right-0 bottom-0 top-0 w-full lg:w-[55%] flex items-end justify-end pointer-events-none opacity-20 lg:opacity-100 pr-4 lg:pr-24 pb-4 lg:pb-20">
                <img src={`/images/rabbit-hero-ultra.png?v=${V}`} alt="Rabbit Mascot" className="max-h-[70%] lg:max-h-[115%] w-auto object-contain" />
              </div>
            </section>

            <Section title="마감임박 ⏰" cards={urgentCards} />
            <Section title="최신 정보 ✨" cards={latestCards} />
            <Section title="인기 정보 ⭐" cards={popularCards} />
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
            <div className="flex items-center gap-6 lg:gap-14 mb-10 lg:mb-24 px-2">
              <div className="w-20 h-20 lg:w-56 h-56 bg-white rounded-[24px] lg:rounded-[64px] shadow-lg flex items-center justify-center p-4 lg:p-10 border border-gray-50">
                <img src={`/images/icon-${activeTab === '지원금' ? 'grant' : activeTab === '행사' ? 'event' : activeTab === '생활정보' ? 'info' : activeTab === '관광지 정보' ? 'bus' : activeTab === '공지사항' ? 'notice' : activeTab === '마감임박' ? 'clock' : 'heart'}.png?v=${V}`} className="w-full h-full object-contain" alt={activeTab} />
              </div>
              <div>
                <h2 className="text-3xl lg:text-8xl font-black text-[#111111] mb-2 lg:mb-6 tracking-tighter">{activeTab}</h2>
                <p className="text-gray-400 text-sm lg:text-3xl font-bold">용인시 {activeTab} 안내</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-14">
              {(activeTab === "마감임박" ? featuredCards.filter(c => c.is_urgent) : 
                activeTab === "관심목록" ? featuredCards.slice(0, 2) :
                filteredCards).map((card, idx) => (
                <Card key={idx} card={card} />
              ))}
            </div>
          </div>
        )}

        <footer className="mt-20 lg:mt-48 py-10 lg:py-20 border-t border-gray-100 flex justify-between items-center text-[#999999] text-[10px] lg:text-base font-black px-4">
          <p>© {new Date().getFullYear()} Yongin Guide. {lastUpdate}</p>
        </footer>
      </main>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function MenuLink({ onClick, icon, label, active = false, count }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-center lg:justify-between px-4 lg:px-8 py-2.5 lg:py-7 rounded-[16px] lg:rounded-[40px] transition-all font-black cursor-pointer group flex-shrink-0 ${
        active ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 lg:gap-8">
        <div className="w-8 h-8 lg:w-28 h-28 flex items-center justify-center p-0.5 lg:p-1">
          <img src={icon} className={`w-full h-full object-contain ${active ? 'brightness-125' : ''}`} alt={label} />
        </div>
        <span className="text-xs lg:text-[28px] tracking-tighter whitespace-nowrap">{label}</span>
      </div>
      {count && <span className={`hidden lg:block text-base px-4 py-1 rounded-full ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>{count}</span>}
    </div>
  );
}

function Section({ title, cards }: any) {
  return (
    <section className="mb-16 lg:mb-40 px-2">
      <div className="flex justify-between items-center mb-8 lg:mb-20 px-2 lg:px-6">
        <h2 className="text-2xl lg:text-6xl font-black flex items-center gap-3 lg:gap-6">{title}</h2>
        <span className="text-xs lg:text-2xl font-black text-gray-300 hover:text-accent transition-colors cursor-pointer">더보기 ➔</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-16">
        {cards.map((card: any, idx: number) => (
          <Card key={idx} card={card} />
        ))}
      </div>
    </section>
  );
}

function Card({ card }: { card: any }) {
  let slug = 'sample-post';
  if (card.title.includes('배달특급')) slug = '2026-05-02-yongin-baedal-special';
  else if (card.title.includes('경유차')) slug = '2026-05-02-yongin-diesel-scrapping';
  else if (card.title.includes('병원')) slug = '2026-05-02-yongin-hospital-companion';
  else if (card.title.includes('쓰레기')) slug = '2026-05-02-giheung-trash-schedule';
  else if (card.title.includes('와우정사')) slug = '2026-05-20-yongin-music-festival';
  else if (card.title.includes('청년')) slug = '2026-05-02-yongin-youth-basic-income';
  else if (card.title.includes('에버랜드')) slug = '2026-05-15-everland-rose-festival';

  return (
    <Link href={`/blog/${slug}`} className="glass-card p-6 lg:p-14 group flex flex-col cursor-pointer shadow-md lg:shadow-2xl">
      <div className="flex justify-between items-start mb-6 lg:mb-12">
        <span className={`px-2.5 py-1 lg:px-5 lg:py-2 rounded-lg lg:rounded-2xl text-[9px] lg:text-sm font-black uppercase text-white ${
          card.category === '지원금' ? 'bg-orange-400' :
          card.category === '행사' ? 'bg-blue-400' : 'bg-emerald-400'
        }`}>
          {card.category}
        </span>
        {card.is_urgent && <span className="text-[10px] lg:text-lg font-black text-red-500 animate-pulse uppercase">D-Day</span>}
      </div>
      <h3 className="text-lg lg:text-[32px] font-black text-[#111111] mb-4 lg:mb-10 leading-tight min-h-[2.5rem] lg:min-h-[5rem] group-hover:text-accent transition-colors">{card.title}</h3>
      <p className="text-gray-500 text-xs lg:text-xl mb-8 lg:mb-14 line-clamp-2 font-semibold leading-relaxed">{card.summary}</p>
      <div className="mt-auto pt-6 lg:pt-12 border-t border-gray-100 flex items-center justify-between text-[9px] lg:text-base font-black">
        <span className="text-gray-400">{card.date}</span>
        <span className="text-gray-300">♥</span>
      </div>
    </Link>
  );
}
