"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRef } from "react";
import InfiniteCarousel from "@/components/InfiniteCarousel";
import { Card } from "@/components/Card";
import CoupangDynamicBanner from "@/components/CoupangDynamicBanner";
import GasPriceWidget from "@/components/GasPriceWidget";
import data from "../../public/data/local-info.json";
import lifeTips from "../../public/data/life-tips.json";

// 폰트 및 캐시 관련 상수
const V_NUM = "12";
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
  id?: string;
  endDate?: string | null;
}

// 🗳️ 제9회 지방선거(2026년 6월 3일) 실시간 D-Day 계산기
function getElectionDDay() {
  const target = new Date("2026-06-03T00:00:00+09:00");
  const today = new Date();
  
  // 오늘 날짜와 선거일의 시각 차이를 '밀리초' 단위로 계산해요
  const difference = target.getTime() - today.getTime();
  
  // 밀리초를 하루 단위(1000초 * 60분 * 60초 * 24시간)로 나누어 소수점 아래는 올림해요
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  if (daysLeft > 0) {
    return `D-${daysLeft}`;
  } else if (daysLeft === 0) {
    return "D-Day";
  } else {
    return `D+${Math.abs(daysLeft)}`;
  }
}

interface GasResponse {
  suji: { name: string; price: number; brand: string; } | null;
  giheung: { name: string; price: number; brand: string; } | null;
  cheoin: { name: string; price: number; brand: string; } | null;
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(1248);
  const [gasPrices, setGasPrices] = useState<GasResponse | null>(null);

  // 실시간 주유 가격 로드
  useEffect(() => {
    fetch('/data/gas-prices.json')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setGasPrices(json.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/visitor/')
      .then(res => {
        if (!res.ok) throw new Error('API Response not ok');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) return res.json();
        throw new Error('Not a JSON response');
      })
      .then(data => {
        if (data && data.success && data.count) setVisitorCount(data.count);
      })
      .catch(console.error);
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FeaturedCard | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isContentEdit, setIsContentEdit] = useState(false);
  const [oldContentImageUrl, setOldContentImageUrl] = useState("");
  const [isTextEditModalOpen, setIsTextEditModalOpen] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [isTipEdit, setIsTipEdit] = useState(false);
  const [editingTipId, setEditingTipId] = useState("");
  const [isTipPaused, setIsTipPaused] = useState(false);
  const [tipStartX, setTipStartX] = useState(0);
  const [tipScrollLeft, setTipScrollLeft] = useState(0);
  const [isTipDragging, setIsTipDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lifeTipRef = useRef<HTMLDivElement>(null);

  // 관리자 로그인 상태 확인 (쿠키 확인)
  useEffect(() => {
    const isAdminCookie = document.cookie.split('; ').find(row => row.startsWith('is_admin='));
    if (isAdminCookie && isAdminCookie.split('=')[1] === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // URL 파라미터에서 탭 정보를 읽어와 설정 (파라미터가 없으면 '홈'으로 복귀하는 Fallback 추가)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("홈");
    }
    // 부드럽게 화면 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  // ✨ 기존의 복잡한 자동 슬라이더 로직들은 CSS 애니메이션 방식으로 대체되어 제거되었습니다.

  const featuredCards = initialFeaturedCards;
  const blogPosts = initialBlogPosts;

  // 중복 제거 및 데이터 통합 (제목 기준)
  const getCombinedData = () => {
    // 1. 모든 데이터를 하나로 통합
    const combined = [...initialBlogPosts, ...initialFeaturedCards];

    // 2. 중복 제거 (slug 또는 id 기준)
    const unique = Array.from(new Map(combined.map(item => [item.slug || item.id, item])).values());

    const todayStr = new Date().toISOString().split('T')[0];

    // 3. 무조건 날짜 최신순(내림차순)으로만 정렬
    return unique.sort((a, b) => {
      const dateAStr = (a.date || "").toString().replace(/\./g, '-');
      const dateBStr = (b.date || "").toString().replace(/\./g, '-');

      const dateA = new Date(dateAStr).getTime();
      const dateB = new Date(dateBStr).getTime();

      return dateB - dateA;
    });
  };

  const allCards = getCombinedData();
  // 🆕 최신 정보: [종료] 태그가 붙지 않고 지방선거 카테고리가 아닌 글들 중 상위 12개만 노출
  const latestCards = allCards
    .filter(c => !c.title.includes("[종료]") && c.category !== "지방선거" && c.category !== "election")
    .slice(0, 12);
  const grantCards = allCards.filter(c => (c.category === "지원금" || c.category === "grant") && !c.title.includes("[종료]"));
  const eventCards = allCards.filter(c => (c.category === "지역행사" || c.category === "event") && !c.title.includes("[종료]"));
  const infoCards = allCards.filter(c => (c.category === "생활정보" || c.category === "info") && !c.title.includes("[종료]"));
  const bookCards = allCards.filter(c => (c.category === "도서정보" || c.category === "book") && !c.title.includes("[종료]"));
  const worldCards = allCards.filter(c => (c.category === "세계 경제" || c.category === "world") && !c.title.includes("[종료]"));
  const electionCards = allCards.filter(c => (c.category === "지방선거" || c.category === "election") && !c.title.includes("[종료]"));
  const popularCards = allCards.filter((c) => c.is_popular).slice(0, 3);

  // ⏰ 마감임박 카드 필터링 (7일 이내 마감되는 글)
  // ⏰ 마감임박 카드 필터링 (이미 종료된 글 제외!)
  const TODAY_TIME = new Date().setHours(0, 0, 0, 0);
  const impendingCards = allCards.filter(p => {
    if (!p.deadline) return false;
    // 제목에 [종료]가 있으면 마감임박에서 제외
    if (p.title.includes("[종료]")) return false;

    const deadlineTime = new Date(p.deadline).getTime();
    const diffDays = (deadlineTime - TODAY_TIME) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  // 블로그 필터링 로직
  const getFilteredBlogPosts = () => {
    const catMap: Record<string, string[]> = {
      "지원금": ["grant", "지원금", "subsidy"],
      "행사": ["event", "행사", "지역행사", "지역 행사"],
      "지역행사": ["event", "행사", "지역행사", "지역 행사"],
      "생활정보": ["info", "생활정보", "life"],
      "도서정보": ["book", "도서정보", "도서 소식", "도서"],
      "세계 경제": ["world", "세계 경제", "economy"],
      "지방선거": ["election", "지방선거"]
    };

    const postsToFilter = allCards.filter(post => !post.title.includes("[종료]"));
    if (activeBlogCat === "전체") return postsToFilter;

    // 2중 안전장치: 버튼 이름이 '행사'여도 '지역행사' 정보를 찾아오게 함
    const actualCat = (activeBlogCat === "행사" || activeBlogCat === "지역행사") ? "지역행사" : activeBlogCat;
    const targets = (catMap[actualCat] || [actualCat]).map(t => t.toLowerCase().replace(/\s/g, ''));

    return postsToFilter.filter((post) => {
      const postCat = (post.category || "").toLowerCase().replace(/\s/g, '');
      return targets.includes(postCat);
    });
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
    } else if (cat === "world" || cat === "세계 경제") {
      label = "세계 경제";
      bgColor = "bg-red-100";
      textColor = "text-red-600";
    } else if (cat === "election" || cat === "지방선거") {
      label = "지방선거";
      bgColor = "bg-teal-100";
      textColor = "text-teal-600";
    }

    return (
      <span className={`${bgColor} ${textColor} text-[10px] px-2 py-0.5 rounded-full font-medium`}>
        {label}
      </span>
    );
  };

  // 이미지 수정 시작
  const startImageEdit = (e: React.MouseEvent, card: FeaturedCard) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    setEditingCard(card);
    setNewImageUrl(card.image || "");
    setIsContentEdit(false);
    setIsEditModalOpen(true);
  };

  // 이미지 수정 저장
  const saveImageChanges = async () => {
    if (isTipEdit) {
      if (!editingTipId) return;
      setIsSaving(true);
      try {
        const res = await fetch("/api/update-tip-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTipId, newImageUrl: newImageUrl }),
        });
        if (res.ok) window.location.reload();
        else alert("팁 이미지 수정에 실패했습니다.");
      } catch (err) {
        alert("서버 오류가 발생했습니다.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!editingCard || !editingCard.slug) return;

    setIsSaving(true);
    try {
      const endpoint = isContentEdit ? "/api/update-content-image" : "/api/update-post-image";
      const body = isContentEdit
        ? { slug: editingCard.slug, oldImageUrl: oldContentImageUrl, newImageUrl: newImageUrl }
        : { slug: editingCard.slug, newImageUrl: newImageUrl };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // 성공 시 페이지 새로고침하여 반영
        window.location.reload();
      } else {
        alert("이미지 수정에 실패했습니다.");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 게시글 삭제
  const deletePost = async () => {
    // slug가 있으면 우선 사용, 없으면 id 사용
    const targetSlug = selectedCard?.slug || selectedCard?.id;
    if (!selectedCard || !targetSlug) return;

    if (!confirm("정말 이 게시글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.")) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/delete-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: targetSlug }),
      });

      if (res.ok) {
        alert("게시글이 삭제되었습니다.");
        window.location.reload();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 텍스트 수정 시작
  const startTextEdit = () => {
    if (!selectedCard) return;
    setEditingText(selectedCard.content || selectedCard.detail || selectedCard.summary || "");
    setIsTextEditModalOpen(true);
  };

  // 텍스트 수정 저장
  const saveTextChanges = async () => {
    if (!selectedCard || !selectedCard.slug) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/update-post-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedCard.slug,
          newContent: editingText
        }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("텍스트 수정에 실패했습니다.");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🖼️ 이미지 경로 도우미 함수 (http로 시작하면 그대로, 아니면 /images/ 추가)
  const getImageUrl = (path: string) => {
    if (!path) return "/images/background1.png";
    if (path.startsWith("http")) return path;

    // 이미 images/ 나 /images/ 가 포함되어 있다면 중복 방지
    let cleanPath = path;
    if (cleanPath.startsWith("/images/")) cleanPath = cleanPath.replace("/images/", "");
    if (cleanPath.startsWith("images/")) cleanPath = cleanPath.replace("images/", "");

    return `${IMG_BASE}${cleanPath}?v=${V_NUM}`;
  };

  // 분류(카테고리) 수정 저장
  const updateCategory = async (newCategory: string) => {
    if (!selectedCard) return;
    const targetSlug = selectedCard.slug || selectedCard.id;
    if (!targetSlug) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/update-post-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedCard.slug,
          id: selectedCard.id,
          category: newCategory
        }),
      });

      if (res.ok) {
        // 성공 시 페이지 새로고침하여 반영
        window.location.reload();
      } else {
        alert("분류 수정에 실패했습니다.");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsAdmin(false);
    setIsMenuOpen(false);
    window.location.reload(); // 즉시 새로고침하여 상태 반영
  };

  // 🆕 기존 내부 Card 컴포넌트는 /src/components/Card.tsx로 분리되었습니다.

  const Section = ({
    title,
    cards,
    onCardClick,
    onMoreClick
  }: {
    title: string;
    cards: FeaturedCard[];
    onCardClick: (card: FeaturedCard) => void;
    onMoreClick: () => void;
  }) => {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-noto-serif-kr)] text-white tracking-tight">{title}</h2>
          <button
            onClick={onMoreClick}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
          >
            전체 보기 <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <Card
              key={idx}
              card={card}
              onClick={() => onCardClick(card)}
              isAdmin={isAdmin}
              onImageEdit={startImageEdit}
              href={card.slug ? `/blog/${card.slug}` : undefined}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="font-[family-name:var(--font-pretendard)] pb-24 relative bg-[#F8F9FA]">

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 pt-10 transition-all duration-500">

        {activeTab === "홈" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            {/* 메인 Hero 카드 (좌측 60%) */}
            <div className="lg:col-span-8 bg-gray-900 rounded-[32px] relative overflow-hidden min-h-[440px] flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition-all duration-500 group">
              {/* 배경 이미지 오버레이 */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:scale-[1.01] transition-transform duration-700"
                style={{ backgroundImage: `url(${IMG_BASE}background1.png?v=${V_NUM})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent" />
              
              <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 lg:p-12 items-center">
                {/* 좌측 텍스트 영역 */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <h1 className="text-4xl lg:text-[46px] font-bold text-white leading-tight mb-4 tracking-tight">
                    Live.<br />
                    Learn.<br />
                    Yongin Guide.
                  </h1>
                  <p className="text-gray-300 text-[12px] lg:text-[13px] font-medium mb-6 max-w-sm leading-relaxed">
                    용인시의 실시간 혜택 소식부터 숨겨진 생활 비결까지, 가장 똑똑하고 신뢰할 수 있는 정보를 제공합니다.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("지역행사");
                      window.history.pushState({}, '', '/?tab=지역행사');
                      window.scrollTo({ top: 500, behavior: "smooth" });
                    }}
                    className="self-start px-5 py-2.5 bg-[#FF6B6B] hover:bg-[#FF5252] text-white rounded-full text-xs font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    여행지 둘러보기 <span className="text-[14px]">→</span>
                  </button>
                </div>

                {/* 우측 주유 정보 (데스크탑 전용, 박스 없이 배너에 직접 표시) */}
                <div className="hidden lg:flex lg:col-span-5 flex-col justify-center pl-4">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-lg">⛽</span>
                    <span className="text-[15px] font-black text-white tracking-tight">오늘의 최저가 주유소</span>
                    <span className="bg-green-400/90 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">Live</span>
                  </div>

                  {gasPrices ? (
                    <div className="space-y-5">
                      {[
                        { district: "수지구", data: gasPrices.suji },
                        { district: "기흥구", data: gasPrices.giheung },
                        { district: "처인구", data: gasPrices.cheoin }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <span className="text-white/50 text-[11px] font-bold tracking-wider uppercase">{item.district}</span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-white/80 text-[14px] font-semibold truncate max-w-[160px]">{item.data?.name || "정보없음"}</span>
                            <span className="text-[#FFD166] text-[22px] font-black tracking-tight">{item.data?.price?.toLocaleString() || "-"}</span>
                            <span className="text-white/40 text-[12px] font-bold">원/ℓ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/40 text-sm font-bold">주유가 조회 중...</div>
                  )}

                  <span className="text-[9px] text-white/25 mt-5 font-bold select-none">* 오피넷(Opinet) 실시간 데이터 기준</span>
                </div>
              </div>
            </div>

            {/* 우측 bento 컬럼 (우측 40%) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* 인기 여행지 카드 (5위까지) */}
              <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between flex-grow">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-900 font-bold text-[14px]">인기 여행지</h3>
                  <button 
                    onClick={() => {
                      setActiveTab("지역행사");
                      window.history.pushState({}, '', '/?tab=지역행사');
                    }}
                    className="text-gray-400 text-[11px] font-bold hover:text-blue-600 transition-colors"
                  >
                    더보기 →
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { rank: "01", name: "에버랜드", desc: "장미축제와 짜릿한 어트랙션", img: "everland_roses_thumb.png" },
                    { rank: "02", name: "한국민속촌", desc: "조선시대로 떠나는 시간여행", img: "gksrkd_01.png" },
                    { rank: "03", name: "농촌테마파크", desc: "가족과 함께 힐링하는 농촌체험", img: "thumb-temple.png" },
                    { rank: "04", name: "용인자연휴양림", desc: "숲속에서 즐기는 힐링 캠핑", img: "thumb-rose.png" },
                    { rank: "05", name: "경기도박물관", desc: "경기도 역사와 문화 탐방", img: "library_booktalk_thumb.png" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 group/item cursor-pointer" onClick={() => router.push('/?tab=지역행사')}>
                      <span className="text-[15px] font-black text-gray-300 group-hover/item:text-blue-500 transition-colors">{item.rank}</span>
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100/60 bg-gray-50 flex-shrink-0">
                        <img src={IMG_BASE + item.img} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12.5px] font-bold text-gray-800 leading-tight group-hover/item:text-blue-600 transition-colors">{item.name}</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🛍️ 쿠팡 파트너스 배너 */}
        <div className="mb-10 max-w-7xl mx-auto w-full relative z-20">
          <CoupangDynamicBanner />
        </div>

        {activeTab === "홈" && (
          <>


            {/* 대망의 대시보드형 벤토 보드 (Endless 스크롤 제거, 한눈에 정보 집약) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
              
              {/* 1. 지원금 혜택 Bento (4칸) */}
              <div className="md:col-span-4 bg-white rounded-[28px] border border-gray-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[360px]">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-gray-900 font-bold text-[14px] flex items-center gap-1.5">
                      <span>💰</span> 지원금 혜택
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab("지원금");
                        window.history.pushState({}, '', '/?tab=지원금');
                      }}
                      className="text-gray-400 text-[11px] font-bold hover:text-[#FF6B6B] transition-colors"
                    >
                      더보기 →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {grantCards.slice(0, 3).map((card, idx) => {
                      const todayDate = new Date();
                      const targetDate = card.endDate || card.deadline;
                      let daysLeft = null;
                      if (targetDate) {
                        const dDate = new Date(targetDate);
                        const diffTime = dDate.getTime() - todayDate.getTime();
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      }

                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedCard(card)}
                          className="flex flex-col gap-1.5 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer group transition-colors border border-transparent hover:border-gray-100"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[12.5px] font-bold text-gray-800 leading-snug group-hover:text-[#FF6B6B] transition-colors line-clamp-1">
                              {card.title}
                            </span>
                            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 ? (
                              <span className="bg-red-50 text-red-500 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                                D-{daysLeft}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10.5px] text-gray-400 font-semibold line-clamp-1">{card.summary}</span>
                        </div>
                      );
                    })}
                    {grantCards.length === 0 && (
                      <p className="text-gray-400 text-xs font-semibold text-center py-10">등록된 지원금 정보가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[11.5px] font-bold text-gray-400">
                  <span>총 {grantCards.length}개의 혜택 진행 중</span>
                </div>
              </div>

              {/* 2. 지역 축제 & 행사 Bento (4칸) */}
              <div className="md:col-span-4 bg-white rounded-[28px] border border-gray-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[360px]">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-gray-900 font-bold text-[14px] flex items-center gap-1.5">
                      <span>📍</span> 지역 축제 & 행사
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab("지역행사");
                        window.history.pushState({}, '', '/?tab=지역행사');
                      }}
                      className="text-gray-400 text-[11px] font-bold hover:text-blue-600 transition-colors"
                    >
                      더보기 →
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {eventCards.slice(0, 3).map((card, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedCard(card)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 cursor-pointer group transition-colors border border-transparent hover:border-gray-100"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100/50">
                          <img 
                            src={card.image?.startsWith("http") ? card.image : (IMG_BASE + (card.image || "thumb-default.png") + "?v=" + V_NUM)}
                            alt={card.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-grow">
                          <span className="text-[12.5px] font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                            {card.title}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold mt-0.5">{card.region || "용인시 전체"}</span>
                        </div>
                      </div>
                    ))}
                    {eventCards.length === 0 && (
                      <p className="text-gray-400 text-xs font-semibold text-center py-10">등록된 축제/행사 정보가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[11.5px] font-bold text-gray-400">
                  <span>금주의 행사 일정 바로보기</span>
                </div>
              </div>

              {/* 3. 유익한 생활 정보 Bento (4칸) */}
              <div className="md:col-span-4 bg-white rounded-[28px] border border-gray-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[360px]">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-gray-900 font-bold text-[14px] flex items-center gap-1.5">
                      <span>🏠</span> 유익한 생활 정보
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab("생활정보");
                        window.history.pushState({}, '', '/?tab=생활정보');
                      }}
                      className="text-gray-400 text-[11px] font-bold hover:text-green-600 transition-colors"
                    >
                      더보기 →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {infoCards.slice(0, 3).map((card, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedCard(card)}
                        className="flex flex-col gap-1.5 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer group transition-colors border border-transparent hover:border-gray-100"
                      >
                        <span className="text-[12.5px] font-bold text-gray-800 leading-snug group-hover:text-green-600 transition-colors line-clamp-1">
                          {card.title}
                        </span>
                        <span className="text-[10.5px] text-gray-400 font-semibold line-clamp-1">{card.summary}</span>
                      </div>
                    ))}
                    {infoCards.length === 0 && (
                      <p className="text-gray-400 text-xs font-semibold text-center py-10">등록된 생활 정보가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[11.5px] font-bold text-gray-400">
                  <span>알면 힘이 되는 리얼 살림꿀팁</span>
                </div>
              </div>

            </div>

            {/* 두 번째 줄 벤토 레이아웃 (도서 소식 단독 배치로 12칸 확장) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
              
              {/* 도서 소식 추천 Bento (12칸 확장 및 3단 가로 배치) */}
              <div className="lg:col-span-12 bg-white rounded-[28px] border border-gray-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 font-bold text-[14px] flex items-center gap-1.5">
                      <span>📚</span> 지혜가 쌓이는 도서 소식
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab("블로그");
                        setActiveBlogCat("도서정보");
                        window.history.pushState({}, '', '/?tab=블로그');
                      }}
                      className="text-gray-400 text-[11px] font-bold hover:text-purple-600 transition-colors"
                    >
                      더보기 →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bookCards.slice(0, 3).map((card, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedCard(card)}
                        className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl cursor-pointer group transition-all border border-gray-100/30 flex gap-3"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                          <img 
                            src={card.image?.startsWith("http") ? card.image : (IMG_BASE + (card.image || "thumb-default.png") + "?v=" + V_NUM)}
                            alt={card.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex flex-col min-w-0 justify-center">
                          <h4 className="text-[12px] font-bold text-gray-800 leading-snug group-hover:text-purple-600 transition-colors line-clamp-1">
                            {card.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mt-1 leading-normal">
                            {card.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                    {bookCards.length === 0 && (
                      <p className="text-gray-400 text-xs font-semibold py-8 col-span-3 text-center">등록된 도서 소식이 없습니다.</p>
                    )}
                  </div>
                </div>
                
                <div className="text-[10px] text-purple-400/80 font-bold uppercase tracking-wider mt-4">
                  * 추천도서 및 지식 리포트 모음
                </div>
              </div>

            </div>

            {/* ✨ 루미의 생활 팁! 전용 섹션 */}
            <div className="mt-16 mb-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md overflow-hidden">
                    <img
                      src={IMG_BASE + "icon-ggul.png?v=" + V_NUM}
                      alt="꿀팁 아이콘"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-gray-900 font-[family-name:var(--font-noto-serif-kr)] tracking-tight">
                      추천 콘텐츠
                    </h2>
                    <p className="text-[11px] text-gray-400 font-bold mt-1">용인시 생활이 더 편리해지는 소소한 비결들</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/tips")}
                  className="bg-white border border-gray-100 px-5 py-2.5 rounded-full shadow-sm hover:scale-102 transition-all font-bold text-gray-700 text-xs flex items-center gap-1.5"
                >
                  <span>전체보기</span>
                  <span>➔</span>
                </button>
              </div>

              <InfiniteCarousel
                items={lifeTips}
                renderItem={(tip, idx, dragging) => (
                  <div
                    onClick={() => {
                      if (!dragging && tip.slug) {
                        router.push(`/tips/${tip.slug}`);
                      }
                    }}
                    className="min-w-[280px] md:min-w-[320px] max-w-[320px] bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-gray-100/60 hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 transition-all group overflow-hidden relative cursor-pointer h-full flex flex-col"
                  >
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsTipEdit(true);
                            setEditingTipId(tip.id);
                            setNewImageUrl(tip.image);
                            setIsEditModalOpen(true);
                          }}
                          className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-bold hover:scale-105 transition-all shadow-md z-20"
                        >
                          📸 수정
                        </button>
                      )}
                      <span className="bg-[#FFF9F2] text-[#FF9F1C] text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border border-[#FFE7C8]">
                        {tip.category}
                      </span>
                    </div>

                    <div className="mb-5 rounded-2xl overflow-hidden aspect-[16/10] bg-gray-50 flex-shrink-0">
                      <img
                        src={getImageUrl(tip.image)}
                        alt={tip.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-[14.5px] font-bold text-gray-800 mb-2.5 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {tip.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-6 font-semibold line-clamp-3 h-[4.5rem]">
                      {tip.description}
                    </p>

                    <div className="pt-5 border-t border-gray-100/60 mt-auto">
                      <div className="text-[9.5px] text-gray-400 font-bold mb-2 ml-1 uppercase tracking-widest">강력 추천 꿀템</div>
                      <a
                        href={tip.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-gray-50 hover:bg-yellow-400 p-3.5 rounded-2xl transition-all group/btn"
                      >
                        <span className="text-[11.5px] font-bold text-gray-600 group-hover/btn:text-gray-900 truncate max-w-[85%]">{tip.productName}</span>
                        <span className="text-[15px] group-hover/btn:translate-x-0.5 transition-transform">🛒</span>
                      </a>
                    </div>
                  </div>
                )}
              />
            </div>
          </>
        )}

        {activeTab !== "홈" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-10 text-center pt-10">
              <h1 className="text-4xl font-[900] text-gray-900 mb-2 tracking-tight">{activeTab}</h1>
              <p className="text-sm text-gray-400 font-bold">상세 정보를 확인해 보세요.</p>
            </div>

            {/* 블로그 탭인 경우 상단 카테고리 필터 */}
            {activeTab === "블로그" && (
              <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
                {["전체", "지원금", "지역행사", "생활정보", "도서정보", "세계 경제"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveBlogCat(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-[13px] font-black whitespace-nowrap transition-all shadow-sm ${activeBlogCat === cat
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
                  "지역행사": "event",
                  "생활정보": "info",
                  "도서정보": "book",
                  "도서 소식": "book",
                  "세계 경제": "world",
                  "지방선거": "election"
                };
                const korCatMap: Record<string, string> = {
                  "지원금": "지원금",
                  "지역행사": "지역행사",
                  "생활정보": "생활정보",
                  "도서정보": "도서정보",
                  "도서 소식": "도서정보",
                  "세계 경제": "세계 경제",
                  "지방선거": "지방선거"
                };
                const match = c.category === catMap[activeTab] || c.category === korCatMap[activeTab] ||
                  (activeTab === "지역행사" && (c.category === "행사" || c.category === "지역행사")) ||
                  ((activeTab === "도서정보" || activeTab === "도서 소식") && (c.category === "book" || c.category === "도서정보"));
                return match;
              }).sort((a, b) => {
                const aEnded = a.title.includes("[종료]");
                const bEnded = b.title.includes("[종료]");
                if (aEnded && !bEnded) return 1;
                if (!aEnded && bEnded) return -1;
                const dateA = new Date((a.date || "").toString().replace(/\./g, '-')).getTime();
                const dateB = new Date((b.date || "").toString().replace(/\./g, '-')).getTime();
                return dateB - dateA;
              })).map((card, idx) => (
                <Card
                  key={idx}
                  card={card}
                  onClick={() => {
                    // 블로그 탭이거나 카드에 slug가 있는 경우 상세 페이지로 직접 이동
                    if ((activeTab === "블로그" || activeTab === "홈") && card.slug) {
                      router.push(`/blog/${card.slug}`);
                    } else {
                      setSelectedCard(card);
                    }
                  }}
                  href={(activeTab === "블로그" || activeTab === "홈") && card.slug ? `/blog/${card.slug}` : undefined}
                />
              ))}
            </div>
          </div>
        )}
        {/* 🛍️ 홈 화면 하단 쿠팡 파트너스 다이나믹 배너 */}
        <div className="mt-24 max-w-7xl mx-auto px-5 lg:px-0">
          <CoupangDynamicBanner />
        </div>
      </main>

      {/* 카드 상세 팝업 */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-5 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedCard(null)} />
          <div
            className="bg-white w-full max-w-4xl h-[90vh] lg:h-[85vh] rounded-[40px] lg:rounded-[60px] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 relative custom-scrollbar flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* 상단 이미지 영역 (이제 본문과 함께 스크롤됨) */}
            <div className="w-full relative flex-shrink-0">
              <img
                src={selectedCard.image?.startsWith("http") ? selectedCard.image : (IMG_BASE + (selectedCard.image || "thumb-default.png") + "?v=" + V_NUM)}
                alt={selectedCard.title}
                className="w-full h-auto min-h-[300px] lg:min-h-[500px] object-cover"
              />
              {/* 닫기 버튼 (상단 이미지 위에 우아하게 배치) */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-8 right-8 z-[80] w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 shadow-2xl border border-white hover:scale-110 transition-all text-3xl font-black pointer-events-auto"
              >
                ✕
              </button>
              <div className="absolute top-8 left-8">
                {renderTags(selectedCard.category)}
              </div>
            </div>
            {/* 하단 본문 영역 (이미지 아래에 바로 이어짐) */}
            <div className="p-10 lg:p-20">
              <h2 className="text-2xl font-[900] text-gray-900 mb-4 leading-tight">{selectedCard.title}</h2>

              {/* 관리자 수정 버튼 (ID나 Slug가 있으면 노출) */}
              {isAdmin && (selectedCard.slug || selectedCard.id) && (
                <div className="mb-6 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={startTextEdit}
                      className="flex-1 py-3 bg-gray-800 text-white rounded-xl text-xs font-black hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      📝 본문 수정
                    </button>
                    <button
                      onClick={(e) => startImageEdit(e, selectedCard)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      📸 이미지 수정
                    </button>
                    <button
                      onClick={deletePost}
                      disabled={isSaving}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100"
                    >
                      🗑️ 삭제
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 px-2">분류 이동:</span>
                    {["지원금", "지역행사", "생활정보"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateCategory(cat)}
                        disabled={isSaving}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${selectedCard.category === cat ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        {cat === "지역행사" ? "행사" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-8 text-[11px] font-bold text-gray-400">
                <span className="flex items-center gap-1.5">📅 {selectedCard.date}</span>
                <span className="flex items-center gap-1.5">📍 {selectedCard.region || "용인"}</span>
              </div>

              <div className="prose prose-sm prose-slate max-w-none prose-headings:font-black prose-a:text-blue-600">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ node, ...props }) => (
                      <span className="relative group/content-img inline-block w-full my-4">
                        <img {...props} className="rounded-2xl shadow-sm w-full h-auto" />
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingCard(selectedCard);
                              setIsContentEdit(true);
                              setOldContentImageUrl(String(props.src || ""));
                              setNewImageUrl(String(props.src || ""));
                              setIsEditModalOpen(true);
                            }}
                            className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black opacity-0 group-hover/content-img:opacity-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xl z-10"
                          >
                            <span>📸</span> 본문 사진 수정
                          </button>
                        )}
                      </span>
                    )
                  }}
                >
                  {selectedCard.content || selectedCard.detail || selectedCard.summary}
                </ReactMarkdown>
              </div>

              {/* 🛍️ 쿠팡 파트너스 다이나믹 배너 (상세 팝업용) */}
              <div className="mt-10 mb-6">
                <CoupangDynamicBanner key={selectedCard.slug || selectedCard.title} />
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white pt-4 pb-2">
                {selectedCard.slug && (
                  <button
                    onClick={() => {
                      setSelectedCard(null);
                      router.push(`/blog/${selectedCard.slug}`);
                    }}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-[900] text-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    상세정보 확인하기
                  </button>
                )}
                {selectedCard.link && (
                  <a
                    href={selectedCard.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl text-sm font-[900] text-center shadow-lg shadow-orange-100 hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    홈페이지 바로가기
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
      <aside className={`fixed left-0 top-0 bottom-0 w-[300px] lg:w-[420px] bg-white/95 backdrop-blur-2xl border-r border-gray-100 z-[110] flex flex-col p-8 lg:p-12 shadow-2xl transition-transform duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
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
          <MenuLink
            onClick={() => {
              setActiveTab("홈");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-home.png?v=" + V_NUM}
            label="홈"
            active={activeTab === "홈"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("지원금");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=지원금');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-grant.png?v=" + V_NUM}
            label="지원금"
            active={activeTab === "지원금"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("지역행사");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=지역행사');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-event.png?v=" + V_NUM}
            label="지역행사"
            active={activeTab === "지역행사"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("생활정보");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=생활정보');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
            label="생활정보"
            active={activeTab === "생활정보"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("블로그");
              setActiveBlogCat("도서정보");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=블로그');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-book.png?v=" + V_NUM}
            label="도서정보"
            active={activeTab === "블로그" && activeBlogCat === "도서정보"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("블로그");
              setActiveBlogCat("전체");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=블로그');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-blog.png?v=" + V_NUM}
            label="블로그"
            active={activeTab === "블로그" && activeBlogCat === "전체"}
          />
          <MenuLink
            onClick={() => {
              setIsMenuOpen(false);
              router.push("/tips");
            }}
            icon={IMG_BASE + "icon-ggul.png?v=" + V_NUM}
            label="실생활 꿀팁"
            active={false}
          />

          <div className="h-px bg-gray-100 my-2" />

          {isAdmin ? (
            <MenuLink
              onClick={handleLogout}
              icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
              label="관리자 로그아웃"
              active={false}
            />
          ) : (
            <MenuLink
              onClick={() => { window.location.href = "/admin"; setIsMenuOpen(false); }}
              icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
              label="관리자 로그인"
              active={false}
            />
          )}
        </nav>

      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[105]" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* 우측 하단 플로팅 버튼 */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => {
            setActiveTab("홈");
            window.history.pushState({}, '', '/');
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex flex-col items-center justify-center group active:scale-90 transition-all"
        >
          <span className="text-blue-600 text-lg group-hover:scale-110 transition-transform font-black">H</span>
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

      {/* 이미지 수정 팝업 (관리자 전용) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !isSaving && setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-white">
            <div className="text-center mb-8">
              <div className="text-3xl mb-3">📸</div>
              <h2 className="text-2xl font-black text-gray-900">이미지 주소 수정</h2>
              <p className="text-gray-400 text-sm mt-1">게시글의 대표 이미지를 변경합니다.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Image URL</label>
                <textarea
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm min-h-[100px]"
                  placeholder="https://... 이미지 주소를 입력하세요"
                  disabled={isSaving}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={saveImageChanges}
                  disabled={isSaving}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : "저장하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 텍스트 수정 팝업 (관리자 전용) */}
      {isTextEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !isSaving && setIsTextEditModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-white flex flex-col max-h-[90vh]">
            <div className="text-center mb-8 flex-shrink-0">
              <div className="text-3xl mb-3">📝</div>
              <h2 className="text-2xl font-black text-gray-900">본문 내용 수정</h2>
              <p className="text-gray-400 text-sm mt-1">게시글의 전체 텍스트 내용을 자유롭게 수정하세요.</p>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col gap-6">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="flex-1 w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm resize-none custom-scrollbar"
                placeholder="마크다운 형식으로 내용을 입력하세요..."
                disabled={isSaving}
              />

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setIsTextEditModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={saveTextChanges}
                  disabled={isSaving}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : "본문 내용 저장하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

function MenuLink({ onClick, icon, label, active = false }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 lg:px-6 py-2 lg:py-4 rounded-[16px] lg:rounded-[24px] transition-all font-black cursor-pointer group ${active ? "bg-accent text-white shadow-lg scale-[1.02]" : "text-gray-500 hover:bg-gray-50"
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
