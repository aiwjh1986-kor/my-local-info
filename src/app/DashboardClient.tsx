"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import data from "../../public/data/local-info.json";

// 폰트 및 캐시 관련 상수
const V_NUM = "5";
const IMG_BASE = "/images/";

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
}

export default function DashboardClient({
  initialBlogPosts,
  initialFeaturedCards
}: {
  initialBlogPosts: FeaturedCard[],
  initialFeaturedCards: FeaturedCard[]
}) {
  const router = useRouter();
  const { lastUpdate } = data;
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("홈");
  const [activeBlogCat, setActiveBlogCat] = useState("전체");
  const [selectedCard, setSelectedCard] = useState<FeaturedCard | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // URL 파라미터에서 탭 정보를 읽어와 설정
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      // 부드럽게 배너 하단으로 스크롤 (원하는 경우)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams]);

  const featuredCards = initialFeaturedCards;
  const blogPosts = initialBlogPosts;
  
  // 중복 제거 및 데이터 통합 (제목 기준)
  const getCombinedData = () => {
    const combined = [...featuredCards];
    blogPosts.forEach(post => {
      if (!combined.find(c => c.title === post.title)) {
        combined.push({ ...post, is_popular: post.is_popular ?? false });
      }
    });
    return combined.sort((a, b) => new Date(b.date.replace(/\./g, '-')).getTime() - new Date(a.date.replace(/\./g, '-')).getTime());
  };

  const allCards = getCombinedData();
  const latestCards = allCards.slice(0, 3);
  const popularCards = allCards.filter((c) => c.is_popular).slice(0, 3);
  const bookCards = allCards.filter(c => c.category === "도서정보" || c.category === "book").slice(0, 3);

  // 블로그 필터링 로직
  const getFilteredBlogPosts = () => {
    const catMap: Record<string, string> = {
      "지원금": "grant",
      "행사": "event",
      "생활정보": "info",
      "도서정보": "book"
    };

    if (activeBlogCat === "전체") return blogPosts;
    const targetKey = catMap[activeBlogCat];
    return blogPosts.filter((post) => post.category === targetKey || post.category === activeBlogCat);
  };

  const filteredPosts = getFilteredBlogPosts();

  // 태그 렌더링 헬퍼
  const renderTags = (cat: string) => {
    let label = cat;
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-600";

    if (cat === "grant" || cat === "지원금") {
      label = "지원금";
      bgColor = "bg-orange-100";
      textColor = "text-orange-600";
    } else if (cat === "event" || cat === "행사") {
      label = "행사";
      bgColor = "bg-blue-100";
      textColor = "text-blue-600";
    } else if (cat === "info" || cat === "생활정보") {
      label = "생활정보";
      bgColor = "bg-green-100";
      textColor = "text-green-600";
    } else if (cat === "book" || cat === "도서정보") {
      label = "도서정보";
      bgColor = "bg-purple-100";
      textColor = "text-purple-600";
    }

    return (
      <span className={`${bgColor} ${textColor} text-[10px] px-2 py-0.5 rounded-full font-medium`}>
        {label}
      </span>
    );
  };

  const Card = ({ card, onClick }: { card: FeaturedCard; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-white/20 cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={card.image?.startsWith("http") ? card.image : (IMG_BASE + (card.image || "thumb-youth.png") + "?v=" + V_NUM)}
          alt={card.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {renderTags(card.category)}
          {card.is_urgent && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              마감임박
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 whitespace-pre-line">
          {card.title}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{card.summary}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <span className="text-[10px] text-gray-400">{card.date}</span>
          <span className="text-blue-500 text-[10px] font-bold">🔍</span>
        </div>
      </div>
    </div>
  );

  const Section = ({
    title,
    icon,
    cards,
    onCardClick,
    onMoreClick,
    iconSize = "normal"
  }: {
    title: string;
    icon: string;
    cards: FeaturedCard[];
    onCardClick: (card: FeaturedCard) => void;
    onMoreClick: () => void;
    iconSize?: "normal" | "large";
  }) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`${iconSize === "large" ? "w-12 h-12" : "w-10 h-10"} bg-white rounded-2xl shadow-sm flex items-center justify-center border border-white/50`}>
            <img src={icon} alt={title} className={iconSize === "large" ? "w-7 h-7" : "w-6 h-6"} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
            <p className="text-[10px] text-gray-400 font-medium">실시간 업데이트 완료</p>
          </div>
        </div>
        <button
          onClick={onMoreClick}
          className="px-4 py-1.5 bg-white/50 backdrop-blur-sm rounded-full text-[11px] font-bold text-gray-500 hover:bg-white hover:text-blue-500 transition-all border border-white/50"
        >
          더보기 +
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <Card key={idx} card={card} onClick={() => onCardClick(card)} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F0F2FF] font-[family-name:var(--font-pretendard)] pb-24">
      {/* 플로팅 배경 요소 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-200/30 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-200/30 blur-[120px] rounded-full" />
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
      {/* 🏮 메뉴 버튼 (블로그 스타일 적용) */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 left-5 z-[60] bg-white/80 backdrop-blur-md border border-gray-100 p-3 lg:p-4 rounded-2xl shadow-xl hover:scale-110 transition-all flex items-center gap-3"
      >
        <span className="text-2xl lg:text-3xl">🏮</span>
        <span className="text-lg lg:text-xl font-black text-gray-800 pr-1">MENU</span>
      </button>
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-black tracking-widest text-blue-600">LUMI GUIDE</span>
            <span className="text-sm">🏮</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold text-gray-400">ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white shadow-sm overflow-hidden">
            <img src={IMG_BASE + "icon-menu-rabbit.png?v=" + V_NUM} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-5 lg:px-10 pt-8 transition-all duration-500">
        {/* 🔍 상단 검색창 (시안 스타일 적용) */}
            <div className="mb-8 w-full">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="정보 검색..." 
                  className="w-full bg-white/60 backdrop-blur-md border border-white p-4 lg:p-6 pl-12 lg:pl-16 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all text-sm lg:text-xl font-bold"
                />
                <span className="absolute left-5 lg:left-7 top-1/2 -translate-y-1/2 text-lg lg:text-2xl opacity-40">🔍</span>
              </div>
            </div>

            {/* 🏮 초대형 와이드 개편 배너 */}
            <div className="mb-12 relative overflow-hidden bg-[#E9EBF3] rounded-[40px] lg:rounded-[60px] p-10 lg:p-20 shadow-2xl border border-white group min-h-[600px] flex flex-col justify-between">
              
              {/* 배경 장식 요소 (고급스러움 추가) */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row h-full">
                
                {/* [상단/좌측] 메인 텍스트 영역 */}
                <div className="flex-1 flex flex-col justify-start text-center lg:text-left mb-10 lg:mb-0">
                  <div className="animate-in fade-in slide-in-from-top duration-1000">
                    <h1 className="text-5xl lg:text-8xl font-black text-gray-800 leading-[1.1] mb-8 tracking-tighter font-handwriting">
                      용인의 모든 정보,<br />
                      <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">한눈에 빠르게!</span>
                    </h1>
                    <p className="text-xl lg:text-3xl text-gray-400 font-bold leading-relaxed mb-8 font-handwriting">
                      용인 시민을 위한 맞춤 정보를 확인하세요.
                    </p>
                    {/* 블로그 버튼 */}
                    <button 
                      onClick={() => router.push("/blog")}
                      className="inline-flex items-center gap-4 px-10 py-5 lg:px-16 lg:py-7 bg-accent text-white rounded-full text-xl lg:text-3xl font-black shadow-2xl shadow-accent/30 hover:scale-105 transition-all"
                    >
                      블로그 바로가기 <span>→</span>
                    </button>
                  </div>
                </div>

                {/* [우측] 초대형 캐릭터 영역 */}
                <div className="relative flex-1 flex items-center justify-center lg:justify-end">
                  <div className="relative w-full max-w-[650px] lg:scale-125 lg:translate-x-10 transform-gpu transition-transform duration-1000">
                    <img 
                      src={IMG_BASE + "rabbit-hero-ultra.png?v=" + V_NUM} 
                      alt="Lumi Rabbit" 
                      className="w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] animate-in zoom-in duration-1000" 
                    />
                    {/* 캐릭터 주변 장식 */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/30 rounded-full blur-3xl" />
                  </div>
                </div>
              </div>

              {/* [하단] 5대 핵심 메뉴 - 완벽한 타원형(캡슐) 배경 바 적용 */}
              <div className="relative z-10 flex items-center justify-center mt-12 lg:mt-24 w-full">
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-2 lg:gap-6 bg-gray-100/60 backdrop-blur-md px-6 lg:px-12 py-3 lg:py-6 rounded-[40px] lg:rounded-full border border-white/50 shadow-xl w-fit">
                {[
                  { id: "홈", label: "홈", img: "icon-home.png", color: "bg-purple-100" },
                  { id: "지원금", label: "지원금 혜택", img: "icon-grant.png", color: "bg-purple-100" },
                  { id: "행사", label: "지역 행사", img: "icon-event.png", color: "bg-purple-100" },
                  { id: "생활정보", label: "생활 정보", img: "icon-info.png", color: "bg-purple-100" },
                  { id: "도서정보", label: "도서 소식", img: "icon-book.png", color: "bg-purple-100" }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      if (item.id === "홈") {
                        setActiveTab("홈");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        setActiveTab(item.id as any);
                      }
                    }}
                    className={`flex items-center gap-2 lg:gap-4 px-4 lg:px-8 py-2 lg:py-4 rounded-2xl lg:rounded-full transition-all group hover:bg-white hover:shadow-lg ${
                      activeTab === item.id ? "bg-white shadow-md scale-105" : "hover:scale-105"
                    }`}
                  >
                    <div className="w-10 h-10 lg:w-16 lg:h-16 flex-shrink-0">
                      <img src={IMG_BASE + item.img + "?v=" + V_NUM} alt={item.label} className="w-full h-full object-contain" />
                    </div>
                    <span className={`text-sm lg:text-2xl font-black whitespace-nowrap transition-colors ${
                      activeTab === item.id ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

            {activeTab === "홈" && (
              <>
                {/* 섹션들 */}
                <Section
              title="지금 뜨는 정보"
              icon={IMG_BASE + "icon-tip.png?v=" + V_NUM}
              cards={latestCards}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("생활정보")}
            />

            <Section
              title="지혜가 쌓이는 도서 추천"
              icon={IMG_BASE + "icon-book.png?v=" + V_NUM}
              iconSize="large"
              cards={bookCards}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("도서정보")}
            />

            <Section
              title="인기 만점 혜택"
              icon={IMG_BASE + "icon-welfare.png?v=" + V_NUM}
              cards={popularCards}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("지원금")}
            />
          </>
        )}

        {activeTab !== "홈" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm border border-white/50 flex items-center justify-center mb-6">
                <img
                  src={
                    activeTab === "지원금" ? IMG_BASE + "icon-grant.png?v=" + V_NUM :
                    activeTab === "행사" ? IMG_BASE + "icon-event.png?v=" + V_NUM :
                    activeTab === "도서정보" ? IMG_BASE + "icon-book.png?v=" + V_NUM :
                    IMG_BASE + "icon-info.png?v=" + V_NUM
                  }
                  alt={activeTab}
                  className="w-12 h-12"
                />
              </div>
              <h1 className="text-4xl font-[900] text-gray-900 mb-2 tracking-tight">{activeTab}</h1>
              <p className="text-sm text-gray-400 font-bold">상세 정보를 확인해 보세요.</p>
            </div>

            {/* 블로그 탭인 경우 상단 카테고리 필터 */}
            {activeTab === "블로그" && (
              <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
                {["전체", "지원금", "행사", "생활정보", "도서정보"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveBlogCat(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-[13px] font-black whitespace-nowrap transition-all shadow-sm ${
                      activeBlogCat === cat
                        ? "bg-blue-600 text-white shadow-blue-100"
                        : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(activeTab === "블로그" ? filteredPosts : allCards.filter(c => {
                const catMap: Record<string, string> = {
                  "지원금": "grant",
                  "행사": "event",
                  "생활정보": "info",
                  "도서정보": "book"
                };
                const korCatMap: Record<string, string> = {
                  "지원금": "지원금",
                  "행사": "행사",
                  "생활정보": "생활정보",
                  "도서정보": "도서정보"
                };
                return c.category === catMap[activeTab] || c.category === korCatMap[activeTab];
              })).map((card, idx) => (
                <Card key={idx} card={card} onClick={() => setSelectedCard(card)} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 카드 상세 팝업 */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedCard(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] flex flex-col">
            <div className="relative h-64 flex-shrink-0">
              <img
                src={selectedCard.image?.startsWith("http") ? selectedCard.image : (IMG_BASE + (selectedCard.image || "thumb-default.png") + "?v=" + V_NUM)}
                alt={selectedCard.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors"
              >
                ✕
              </button>
              <div className="absolute top-6 left-6">
                {renderTags(selectedCard.category)}
              </div>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-[900] text-gray-900 mb-4 leading-tight">{selectedCard.title}</h2>
              <div className="flex gap-4 mb-8 text-[11px] font-bold text-gray-400">
                <span className="flex items-center gap-1.5">📅 {selectedCard.date}</span>
                <span className="flex items-center gap-1.5">📍 {selectedCard.region || "용인"}</span>
              </div>
              
              <div className="prose prose-sm prose-slate max-w-none prose-headings:font-black prose-a:text-blue-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedCard.content || selectedCard.detail || selectedCard.summary}
                </ReactMarkdown>
              </div>

              <div className="mt-10 flex gap-3 sticky bottom-0 bg-white pt-4 pb-2">
                {selectedCard.link && (
                  <a
                    href={selectedCard.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-[900] text-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {selectedCard.cta || (selectedCard.category === "grant" || selectedCard.category === "지원금" ? "지금 신청하기" : "상세보기")}
                  </a>
                )}
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-8 bg-gray-100 text-gray-500 py-4 rounded-2xl text-sm font-[900] hover:bg-gray-200 transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 2. 사이드바 드로어 (블로그 스타일 이식) */}
      <aside className={`fixed left-0 top-0 bottom-0 w-[300px] lg:w-[420px] bg-white/95 backdrop-blur-2xl border-r border-gray-100 z-[110] flex flex-col p-8 lg:p-12 shadow-2xl transition-transform duration-500 ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between mb-8 lg:mb-16">
          <div className="flex items-center gap-4">
            <span className="text-3xl lg:text-4xl">🏮</span>
            <h1 className="text-xl lg:text-3xl font-black text-[#111111]">메뉴</h1>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-4xl lg:text-5xl text-gray-300 hover:text-gray-800">×</button>
        </div>
        
        <nav className="flex flex-col gap-3 lg:gap-6 overflow-y-auto no-scrollbar">
          <MenuLink 
            onClick={() => { setActiveTab("홈"); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
            icon={IMG_BASE + "icon-home.png?v=" + V_NUM} 
            label="홈" 
            active={activeTab === "홈"} 
          />
          <MenuLink 
            onClick={() => { setActiveTab("지원금"); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
            icon={IMG_BASE + "icon-grant.png?v=" + V_NUM} 
            label="지원금" 
            active={activeTab === "지원금"} 
          />
          <MenuLink 
            onClick={() => { setActiveTab("행사"); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
            icon={IMG_BASE + "icon-event.png?v=" + V_NUM} 
            label="행사" 
            active={activeTab === "행사"} 
          />
          <MenuLink 
            onClick={() => { setActiveTab("생활정보"); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
            icon={IMG_BASE + "icon-info.png?v=" + V_NUM} 
            label="생활정보" 
            active={activeTab === "생활정보"} 
          />
          <MenuLink 
            onClick={() => { setActiveTab("블로그"); setActiveBlogCat("도서정보"); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
            icon={IMG_BASE + "icon-book.png?v=" + V_NUM} 
            label="도서정보" 
            active={activeTab === "블로그" && activeBlogCat === "도서정보"} 
          />
          <MenuLink 
            onClick={() => { setActiveTab("블로그"); setActiveBlogCat("전체"); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
            icon={IMG_BASE + "icon-blog.png?v=" + V_NUM} 
            label="블로그" 
            active={activeTab === "블로그" && activeBlogCat === "전체"} 
          />
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 font-bold mb-4 tracking-widest uppercase">Community</p>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-colors">Instagram</button>
            <button className="p-3 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-colors">KakaoTalk</button>
          </div>
        </div>
      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[105]" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* 우측 하단 플로팅 버튼 */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => {
            setActiveTab("홈");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex flex-col items-center justify-center group active:scale-90 transition-all"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">🏠</span>
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

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

function MenuLink({ onClick, icon, label, active = false }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center px-4 lg:px-6 py-2 lg:py-4 rounded-[16px] lg:rounded-[24px] transition-all font-black cursor-pointer group ${
        active ? "bg-accent text-white shadow-lg scale-[1.02]" : "text-gray-500 hover:bg-gray-50"
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
