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
      {/* 1. 좌측 사이드바 (넓이 500px로 대폭 확장하여 시인성 확보) */}
      <aside className="sidebar-left w-[500px] p-12 flex flex-col space-y-12 border-r border-gray-50 shadow-2xl shadow-black/5 z-30 overflow-y-auto">
        <div className="flex items-center gap-5 px-2 mb-6">
          <span className="text-5xl">🏮</span>
          <h1 className="text-4xl font-black tracking-tighter text-[#111111] whitespace-nowrap">용인생활가이드</h1>
        </div>
        
        <nav className="space-y-5">
          <MenuLink onClick={() => setActiveTab("홈")} icon={`/images/icon-home.png?v=${V}`} label="홈" active={activeTab === "홈"} />
          <MenuLink onClick={() => setActiveTab("지원금")} icon={`/images/icon-grant.png?v=${V}`} label="지원금" active={activeTab === "지원금"} />
          <MenuLink onClick={() => setActiveTab("행사")} icon={`/images/icon-event.png?v=${V}`} label="행사" active={activeTab === "행사"} />
          <MenuLink onClick={() => setActiveTab("생활정보")} icon={`/images/icon-info.png?v=${V}`} label="생활정보" active={activeTab === "생활정보"} />
          <MenuLink onClick={() => setActiveTab("관광지 정보")} icon={`/images/icon-bus.png?v=${V}`} label="관광지 정보" active={activeTab === "관광지 정보"} />
          <MenuLink onClick={() => setActiveTab("공지사항")} icon={`/images/icon-notice.png?v=${V}`} label="공지사항" active={activeTab === "공지사항"} />
        </nav>

        <div className="pt-12 border-t border-gray-100">
          <p className="text-[14px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12 px-6">MY FAVORITE</p>
          <div className="space-y-5">
            <MenuLink onClick={() => setActiveTab("마감임박")} icon={`/images/icon-clock.png?v=${V}`} label="마감임박" count={urgentCards.length} active={activeTab === "마감임박"} />
            <MenuLink onClick={() => setActiveTab("관심목록")} icon={`/images/icon-heart.png?v=${V}`} label="관심목록" count={5} active={activeTab === "관심목록"} />
          </div>
        </div>

        <div className="pt-12 border-t border-gray-100 pb-16">
          <div className="p-10 bg-gradient-to-br from-[#1E213A] to-[#2D3154] rounded-[48px] text-center shadow-2xl relative overflow-hidden">
            <div className="flex justify-center items-center mb-5 gap-6 relative z-10">
              <span className="text-5xl drop-shadow-lg">🌙</span>
              <span className="text-5xl font-black text-white tracking-tight">16°</span>
            </div>
            <p className="text-[14px] font-black text-blue-300 uppercase tracking-widest relative z-10">YONGIN CITY NIGHT</p>
          </div>
          
          <div className="mt-14 px-2">
            <p className="text-[14px] font-black text-gray-400 uppercase tracking-widest mb-12 text-center">QUICK ACCESS</p>
            <div className="grid grid-cols-2 gap-10">
              <QuickLink href="/parking" icon={`/images/icon-parking.png?v=${V}`} label="주차 안내" />
              <QuickLink onClick={() => setActiveTab("관광지 정보")} icon={`/images/icon-bus.png?v=${V}`} label="관광/버스" />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. 메인 영역 */}
      <main className="main-content flex-1 pl-20 pr-20 pb-32">
        <div className="mb-14 pt-12 relative">
          <input 
            type="text" 
            placeholder="어떤 정보를 찾고 계신가요?" 
            className="w-full h-24 pl-20 pr-12 rounded-[40px] bg-white border border-gray-100 shadow-2xl shadow-black/[0.03] focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-black text-2xl"
          />
          <span className="absolute left-10 top-[calc(50%+4px)] -translate-y-1/2 text-3xl text-gray-400">🔍</span>
        </div>

        {activeTab === "홈" ? (
          <>
            <section className="bg-gradient-to-br from-[#F8FAFF] to-[#F2F4F8] rounded-[80px] overflow-hidden relative mb-28 min-h-[720px] flex flex-col justify-between border border-white shadow-2xl shadow-blue-900/5">
              <div className="p-32 relative z-10">
                <div className="inline-flex items-center gap-5 px-10 py-4 bg-white text-accent rounded-full mb-16 shadow-xl border border-white">
                  <span className="text-base font-black tracking-widest flex items-center gap-4 uppercase text-accent/80">
                    <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></span> PREMIUM YONGIN CITY GUIDE
                  </span>
                </div>

                <h2 className="text-[100px] font-black mb-14 leading-[1.0] text-[#111111] tracking-tighter">
                  용인의 모든 생활정보,<br />
                  <span className="text-accent flex items-center gap-10">
                    한눈에 빠르게! <span className="text-7xl opacity-10">✦</span>
                  </span>
                </h2>
                <p className="text-gray-400 text-[32px] font-bold mb-24 max-w-4xl leading-snug">
                  지원금부터 행사, 관광지 정보까지<br />
                  용인 시민을 위한 맞춤형 정보를 한눈에 확인하세요.
                </p>

                <div className="flex gap-12">
                  <button onClick={() => setActiveTab("지원금")} className="px-20 py-10 bg-accent text-white rounded-[48px] font-black hover:scale-105 transition-all flex items-center gap-6 shadow-[0_40px_80px_rgba(138,112,255,0.4)] text-3xl">
                    지원금 확인하기 <span className="text-4xl">→</span>
                  </button>
                  <button onClick={() => setActiveTab("관광지 정보")} className="px-20 py-10 bg-white text-gray-400 rounded-[48px] font-black hover:bg-gray-50 transition-all border border-gray-100 flex items-center gap-6 shadow-2xl text-3xl">
                    관광지 가이드 <span className="text-4xl">→</span>
                  </button>
                </div>
              </div>

              {/* 하단 퀵 메뉴 바 (여유 있게 배치) */}
              <div className="mx-32 mb-28 p-14 bg-white/80 backdrop-blur-3xl rounded-[64px] border border-white inline-flex gap-40 w-fit shadow-2xl shadow-black/5">
                <MenuAction onClick={() => setActiveTab("지원금")} icon={`/images/icon-grant.png?v=${V}`} label="지원금" sub="전체 혜택 보기" bgColor="#FFF5F0" />
                <MenuAction onClick={() => setActiveTab("행사")} icon={`/images/icon-event.png?v=${V}`} label="행사" sub="문화 일정 안내" bgColor="#F0F7FF" />
                <MenuAction onClick={() => setActiveTab("공지사항")} icon={`/images/icon-notice.png?v=${V}`} label="공지" sub="실시간 새 소식" bgColor="#F5F0FF" />
              </div>

              <div className="absolute right-0 bottom-0 top-0 w-[55%] flex items-end justify-end pointer-events-none pr-24 pb-20">
                <img src={`/images/rabbit-hero-ultra.png?v=${V}`} alt="Rabbit Mascot" className="max-h-[115%] w-auto object-contain drop-shadow-[0_60px_120px_rgba(0,0,0,0.25)]" />
              </div>
            </section>

            <Section title="마감임박 ⏰" cards={urgentCards} />
            <Section title="최신 정보 ✨" cards={latestCards} />
            <Section title="인기 정보 ⭐" cards={popularCards} />
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 px-6">
            <div className="flex items-center gap-14 mb-24">
              <div className="w-56 h-56 bg-white rounded-[64px] shadow-2xl flex items-center justify-center p-10 border border-gray-50">
                <img src={`/images/icon-${activeTab === '지원금' ? 'grant' : activeTab === '행사' ? 'event' : activeTab === '생활정보' ? 'info' : activeTab === '관광지 정보' ? 'bus' : activeTab === '공지사항' ? 'notice' : activeTab === '마감임박' ? 'clock' : 'heart'}.png?v=${V}`} className="w-full h-full object-contain" alt={activeTab} />
              </div>
              <div>
                <h2 className="text-8xl font-black text-[#111111] mb-6 tracking-tighter">{activeTab}</h2>
                <p className="text-gray-400 text-3xl font-bold">용인시의 실시간 {activeTab}를 바로 확인하세요.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
              {(activeTab === "마감임박" ? featuredCards.filter(c => c.is_urgent) : 
                activeTab === "관심목록" ? featuredCards.slice(0, 2) :
                filteredCards).map((card, idx) => (
                <Card key={idx} card={card} />
              ))}
            </div>
          </div>
        )}

        <footer className="mt-48 py-20 border-t border-gray-100 flex justify-between items-center text-[#999999] text-base font-black px-10">
          <div className="flex gap-14">
            <span>이용안내</span>
            <span>개인정보처리방침</span>
            <span>문의하기</span>
          </div>
          <p>© {new Date().getFullYear()} Yongin Guide. Updated: {lastUpdate}</p>
        </footer>
      </main>
    </div>
  );
}

// 텍스트가 잘리지 않도록 레이아웃 최적화된 메뉴 링크
function MenuLink({ onClick, icon, label, active = false, count }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-8 py-7 rounded-[40px] transition-all font-black cursor-pointer group ${
        active ? 'bg-accent text-white shadow-[0_25px_50px_rgba(138,112,255,0.45)] scale-[1.03]' : 'text-gray-500 hover:bg-gray-50 hover:pl-12'
      }`}
    >
      <div className="flex items-center gap-8">
        <div className="w-28 h-28 flex items-center justify-center p-1 transform group-hover:scale-110 transition-transform flex-shrink-0">
          <img src={icon} className={`w-full h-full object-contain ${active ? 'brightness-125' : ''}`} alt={label} />
        </div>
        <span className="text-[28px] tracking-tighter whitespace-nowrap">{label}</span>
      </div>
      {count && <span className={`text-base px-4 py-1 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{count}</span>}
    </div>
  );
}

function MenuAction({ onClick, icon, label, sub, bgColor }: any) {
  return (
    <div className="flex items-center gap-10 group cursor-pointer hover:translate-y-[-8px] transition-all" onClick={onClick}>
      <div className="w-36 h-36 rounded-[48px] flex items-center justify-center p-6 shadow-xl group-hover:shadow-2xl transition-all" style={{ backgroundColor: bgColor }}>
        <img src={icon} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform" alt={label} />
      </div>
      <div>
        <p className="text-3xl font-black text-[#111111] mb-2">{label}</p>
        <p className="text-lg text-gray-400 font-bold tracking-tight">{sub}</p>
      </div>
    </div>
  );
}

function Section({ title, cards }: any) {
  return (
    <section className="mb-40 px-4">
      <div className="flex justify-between items-center mb-20 px-6">
        <h2 className="text-6xl font-black flex items-center gap-6">{title}</h2>
        <span className="text-2xl font-black text-gray-300 hover:text-accent transition-colors cursor-pointer">View All ➔</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
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
    <Link href={`/blog/${slug}`} className="glass-card p-14 group flex flex-col cursor-pointer hover:translate-y-[-16px] transition-all shadow-2xl shadow-black/[0.02]">
      <div className="flex justify-between items-start mb-12">
        <span className={`px-5 py-2 rounded-2xl text-sm font-black uppercase text-white tracking-widest ${
          card.category === '지원금' ? 'bg-orange-400' :
          card.category === '행사' ? 'bg-blue-400' : 'bg-emerald-400'
        }`}>
          {card.category}
        </span>
        {card.is_urgent && <span className="text-lg font-black text-red-500 animate-pulse uppercase tracking-tighter">Urgent</span>}
      </div>
      <h3 className="text-[32px] font-black text-[#111111] mb-10 leading-tight min-h-[5rem] group-hover:text-accent transition-colors">{card.title}</h3>
      <p className="text-gray-500 text-xl mb-14 line-clamp-2 font-semibold leading-relaxed">{card.summary}</p>
      <div className="mt-auto pt-12 border-t border-gray-100 flex items-center justify-between text-base font-black">
        <span className="text-gray-400">{card.date}</span>
        <span className="text-gray-300 group-hover:text-red-400 transition-colors">♥</span>
      </div>
    </Link>
  );
}

function QuickLink({ onClick, icon, label, href }: any) {
  const Content = (
    <div onClick={onClick} className="flex flex-col items-center gap-6 group cursor-pointer">
      <div className="w-32 h-32 rounded-[48px] bg-white flex items-center justify-center p-6 group-hover:bg-accent group-hover:shadow-2xl group-hover:shadow-accent/40 transition-all border border-gray-50">
        <img src={icon} className="w-full h-full object-contain group-hover:brightness-0 group-hover:invert" alt={label} />
      </div>
      <span className="text-base font-black text-gray-400 group-hover:text-accent transition-colors whitespace-nowrap">{label}</span>
    </div>
  );
  return href ? <Link href={href}>{Content}</Link> : Content;
}
