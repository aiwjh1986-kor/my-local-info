"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchKmaWeather } from "@/utils/weather";

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
  detail?: string;
  content?: string;
  slug?: string;
  link?: string;
  image?: string;
  id?: string;
}

const icons = [
  { name: "마감임박!", src: "/images/icon-clock.png", tab: "마감임박" },
  { name: "생활꿀팁", src: "/images/icon-ggul.png", tab: "생활꿀팁" },
  { name: "EVENT", src: "/images/icon-event.png", tab: "지역행사" },
  { name: "지원금", src: "/images/icon-grant.png", tab: "지원금" },
  { name: "BOOK", src: "/images/icon-book.png", tab: "도서정보" },
  { name: "독서일기", src: "/images/독서일기.png", tab: "독서일기" },
  { name: "용인시정보", src: "/images/icon-info.png", tab: "용인시정보" },
  { name: "BLOG", src: "/images/icon-blog.png", tab: "블로그" },
];

export default function MobileApp({ allCards, gasPrices }: { allCards: FeaturedCard[], gasPrices: any }) {
  const [activeTab, setActiveTab] = useState("홈");
  const [selectedCard, setSelectedCard] = useState<FeaturedCard | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [weather, setWeather] = useState<{ temp: string; condition: string } | null>(null);

  useEffect(() => {
    const handleBgmState = (e: any) => setIsBgmPlaying(e.detail.isPlaying);
    window.addEventListener('bgm-state', handleBgmState);
    return () => window.removeEventListener('bgm-state', handleBgmState);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState({ tab: "홈" }, "");
    }
    const onPopState = (e: PopStateEvent) => {
      if (selectedCard) {
        setSelectedCard(null);
      } else {
        setActiveTab(e.state?.tab || "홈");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectedCard]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await fetchKmaWeather();
        setWeather(data);
      } catch (err) {
        console.error("날씨 정보 불러오기 실패:", err);
      }
    };
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // 30분마다 갱신
    return () => clearInterval(weatherInterval);
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    window.history.pushState({ tab }, "");
    setActiveTab(tab);
  };

  const handleCardClick = (card: FeaturedCard) => {
    window.history.pushState({ tab: activeTab, modal: true }, "");
    setSelectedCard(card);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const latestCards = allCards.filter(c => !c.title.includes("[종료]")).slice(0, 10);
  const loopCards = Array(20).fill(latestCards).flat();

  // Set initial scroll to the middle for infinite left/right swipe
  useEffect(() => {
    if (activeTab === "홈" && scrollRef.current && latestCards.length > 0) {
      const setWidth = (240 + 16) * latestCards.length; // width + gap
      scrollRef.current.scrollLeft = setWidth * 10; // Start at 10th set
    }
  }, [activeTab, latestCards.length]);

  // Auto-scroll effect for Latest News
  useEffect(() => {
    if (activeTab !== "홈") return;
    const interval = setInterval(() => {
      if (scrollRef.current && latestCards.length > 0) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const setWidth = (240 + 16) * latestCards.length;
        
        // If getting close to the right end, instantly warp back 5 sets
        if (scrollLeft > scrollWidth - setWidth * 3) {
          scrollRef.current.classList.remove("scroll-smooth");
          scrollRef.current.scrollLeft -= setWidth * 5;
          // Re-enable smooth scroll and move
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.classList.add("scroll-smooth");
              scrollRef.current.scrollLeft += 240 + 16; // Scroll one card at a time
            }
          }, 50);
        } else {
          scrollRef.current.scrollLeft += 240 + 16;
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, latestCards.length]);

  // Filter cards based on tab
  const getFilteredCards = () => {
    if (activeTab === "홈") return [];
    if (activeTab === "마감임박") {
      const TODAY_TIME = new Date().setHours(0, 0, 0, 0);
      return allCards.filter(p => {
        if (!p.deadline || p.title.includes("[종료]")) return false;
        const diffDays = (new Date(p.deadline).getTime() - TODAY_TIME) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      });
    }
    if (activeTab === "블로그") {
      return allCards.filter(post => !post.title.includes("[종료]"));
    }
    const catMap: Record<string, string[]> = {
      "지원금": ["grant", "지원금", "subsidy"],
      "지역행사": ["event", "행사", "지역행사"],
      "용인시정보": ["info", "용인시정보"],
      "도서정보": ["book", "도서정보", "도서"],
      "독서일기": ["diary", "독서일기", "reading diary"],
      "생활꿀팁": ["tip", "꿀팁", "실생활꿀팁", "info", "용인시정보"] // 꿀팁이 없을 경우 용인시정보라도 나오도록 보완
    };
    const targets = (catMap[activeTab] || [activeTab]).map(t => t.toLowerCase());
    return allCards.filter(post => !post.title.includes("[종료]") && targets.includes((post.category || "").toLowerCase()));
  };

  const filteredCards = getFilteredCards();

  return (
    <div className="w-full min-h-screen bg-[#9b82f3] text-white flex flex-col font-pretendard relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('/images/background1.png')] bg-cover bg-center mix-blend-overlay"></div>
      
      {activeTab === "홈" ? (
        <div className="flex-1 overflow-y-auto pb-6 pt-8 px-5 z-10 flex flex-col">
          {/* Top Info Area & Utility Buttons */}
          <div className="flex justify-between items-start mb-6 relative">
            <div>
              <div className="text-sm font-semibold opacity-80 mb-1">실시간 용인 날씨</div>
              <div className="text-4xl font-extrabold tracking-tighter">
                {weather ? `${weather.temp}°C` : "로딩중"}
              </div>
              <div className="text-sm font-medium mt-1">
                {weather ? weather.condition : "잠시만 기다려주세요..."}
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-2 justify-end mb-3">
                <button 
                  onClick={() => window.dispatchEvent(new Event('toggle-bgm'))} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-sm transition-colors ${isBgmPlaying ? 'bg-purple-500 text-white animate-pulse' : 'bg-white/20 backdrop-blur-md'}`}
                  title={isBgmPlaying ? "음악 끄기" : "음악 켜기"}
                >
                  {isBgmPlaying ? '🎵' : '🔇'}
                </button>
                <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="px-3 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-xs font-bold tracking-wide" title="위로 가기">TOP</button>
              </div>

            </div>
          </div>

          {/* Gas Prices */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
              <span className="text-sm font-bold">실시간 최저가 주유소</span>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="text-[10px] opacity-70">수지구</div>
                <div className="text-sm font-bold">1,975원</div>
              </div>
              <div>
                <div className="text-[10px] opacity-70">기흥구</div>
                <div className="text-sm font-bold">1,973원</div>
              </div>
              <div>
                <div className="text-[10px] opacity-70">처인구</div>
                <div className="text-sm font-bold">1,983원</div>
              </div>
            </div>
          </div>

          {/* Latest News Horizontal Scroll (Ads every 3 items) */}
          <h2 className="text-lg font-bold mb-3">최신 소식</h2>
          <div 
            ref={scrollRef} 
            className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {loopCards.reduce((acc: React.ReactNode[], card, idx) => {
              acc.push(
                <div 
                  key={`card-${idx}`} 
                  onClick={() => handleCardClick(card)}
                  className="snap-start flex-shrink-0 w-[240px] bg-white text-gray-900 rounded-[20px] overflow-hidden shadow-lg cursor-pointer"
                >
                  <img src={card.image?.startsWith('http') ? card.image : `/images/${card.image || 'thumb-youth.png'}`} alt="thumb" className="w-full h-[120px] object-cover" />
                  <div className="p-3">
                    <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mb-1 inline-block">{card.category}</span>
                    <div className="text-xs font-bold line-clamp-2 leading-snug">{card.title}</div>
                  </div>
                </div>
              );
              
              // Insert Ad after every 3rd card
              if ((idx + 1) % 3 === 0) {
                acc.push(
                  <div 
                    key={`ad-${idx}`} 
                    className="snap-start flex-shrink-0 w-[240px] bg-white rounded-[20px] overflow-hidden shadow-lg relative flex flex-col justify-center items-center h-[180px]"
                  >
                    <a href="https://link.coupang.com/a/ecH6eLl6Bw" target="_blank" rel="noreferrer" className="w-full h-full flex justify-center items-center">
                      <img src="https://ads-partners.coupang.com/banners/993400?subId=&traceId=V0-301-f5c692db558def48-I993400&w=300&h=250" alt="광고" className="w-full h-full object-cover" />
                    </a>
                    <div className="absolute inset-0 bg-black/5 hover:bg-black/10 transition-colors pointer-events-none"></div>
                    <div className="absolute top-0 right-0 bg-black/50 text-white text-[9px] px-1.5 py-0.5 m-2 rounded z-10 pointer-events-none">AD</div>
                  </div>
                );
              }
              return acc;
            }, [])}
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Bottom Icons Grid */}
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 mt-8 z-20">
            {icons.map(icon => (
              <div key={icon.name} onClick={() => handleTabChange(icon.tab)} className="flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
                <div className="w-16 h-16 bg-[#b19df5] shadow-inner rounded-2xl flex items-center justify-center mb-2 relative border border-white/20">
                  <img src={icon.src} alt={icon.name} className="w-12 h-12 object-contain drop-shadow-md" />
                </div>
                <span className="text-[11px] font-extrabold tracking-tight">{icon.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-gray-100 text-gray-900 z-10 min-h-screen">
          <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
            <div className="flex items-center">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBackClick();
                }} 
                className="p-3 -ml-2 text-gray-700 hover:text-black font-extrabold mr-1 text-2xl active:bg-gray-200 rounded-full cursor-pointer relative z-[100] transition-colors"
                title="뒤로 가기"
              >
                ←
              </button>
              <h1 className="font-bold text-lg tracking-tight">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.dispatchEvent(new Event('toggle-bgm'))} 
                className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm transition-colors ${isBgmPlaying ? 'bg-purple-100 border-purple-200 animate-pulse' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}
                title={isBgmPlaying ? "음악 끄기" : "음악 켜기"}
              >
                {isBgmPlaying ? '🎵' : '🔇'}
              </button>
              <button onClick={() => handleTabChange("홈")} className="px-3 h-8 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-[11px] font-black tracking-wide transition-colors">HOME</button>
              <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="px-3 h-8 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-[11px] font-black tracking-wide transition-colors">TOP</button>
            </div>
          </div>
          
          {/* Category Filter Bar */}
          <div 
            className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 overflow-x-auto snap-x [&::-webkit-scrollbar]:hidden shadow-sm sticky top-[60px] z-40"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {icons.filter(icon => icon.tab !== "홈").map(icon => (
              <button 
                key={icon.name} 
                onClick={() => handleTabChange(icon.tab)}
                className={`snap-start flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
                  activeTab === icon.tab 
                    ? 'bg-[#9b82f3] text-white border-[#9b82f3] font-black shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 font-bold'
                }`}
              >
                <img src={icon.src} alt={icon.name} className="w-5 h-5 object-contain" />
                <span className="text-xs whitespace-nowrap">{icon.name}</span>
              </button>
            ))}
          </div>

          <div className="p-5 flex flex-col gap-4">
            {filteredCards.length > 0 ? filteredCards.map((card, idx) => (
              <div 
                key={idx} 
                onClick={() => handleCardClick(card)}
                className="bg-gray-100 border-b border-gray-200 pb-4 pt-2 cursor-pointer active:bg-gray-200"
              >
                <h3 className="font-bold text-[15px] mb-1.5 leading-snug tracking-tight text-gray-900">{card.title}</h3>
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{card.summary}</p>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-10 text-sm">해당 카테고리의 글이 없습니다.</div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center animate-fade-in text-gray-900">
          <div className="bg-white w-full max-w-[480px] h-[90vh] sm:h-[80vh] sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{selectedCard.category}</span>
              <button onClick={handleBackClick} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold">✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              <img src={selectedCard.image?.startsWith('http') ? selectedCard.image : `/images/${selectedCard.image || 'thumb-youth.png'}`} alt="img" className="w-full aspect-video object-cover bg-gray-100" />
              <div className="p-5">
                <h2 className="text-xl font-bold leading-snug mb-3 tracking-tight">{selectedCard.title}</h2>
                <div className="text-sm text-gray-400 mb-6 font-medium">{selectedCard.date}</div>
                <div className="prose prose-sm prose-purple max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      )
                    }}
                  >
                    {selectedCard.content || selectedCard.detail || selectedCard.summary}
                  </ReactMarkdown>
                </div>
                {selectedCard.link && (
                  <a href={selectedCard.link} target="_blank" rel="noreferrer" className="block w-full bg-[#A855F7] text-white text-center font-bold py-4 rounded-xl mt-8">
                    {selectedCard.category?.includes("꿀팁") || selectedCard.category?.includes("용인시정보") ? "구매하러 가기" : "자세히 보기"}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
