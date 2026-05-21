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
import MapNoticeSection from "@/components/dashboard/MapNoticeSection";
import NoticeBoard from "@/components/dashboard/NoticeBoard";
import HeroSection from "@/components/dashboard/HeroSection";
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
  const [showMap, setShowMap] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(1248);
  const [gasPrices, setGasPrices] = useState<GasResponse | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      alert("이메일 주소를 입력해 주세요! 📧");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      alert("올바른 이메일 주소 형식이 아니에요. 다시 확인해 주세요! 😅");
      return;
    }
    
    try {
      const res = await fetch("https://formspree.io/f/xnjrdvvo", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      
      if (res.ok) {
        alert("성공적으로 구독되었습니다! 매주 알찬 소식을 전해드릴게요. 💌");
        setNewsletterEmail("");
      } else {
        alert("구독에 실패했습니다. 잠시 후 다시 시도해 주세요. 😢");
      }
    } catch (error) {
      alert("서버 연결에 문제가 발생했습니다. 😢");
    }
  };
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

  // 모달이 열릴 때 관광지 카드(id가 guide-로 시작)인 경우 지도를 기본 노출하도록 초기화
  useEffect(() => {
    if (selectedCard) {
      if (selectedCard.id?.startsWith("guide-")) {
        setShowMap(true);
      } else {
        setShowMap(false);
      }
    }
  }, [selectedCard]);

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

  // 📍 지역 축제 & 행사 자동 슬라이더 인덱스
  const [eventSlideIdx, setEventSlideIdx] = useState(0);

  useEffect(() => {
    if (eventCards.length <= 1) return;
    const interval = setInterval(() => {
      setEventSlideIdx((prev) => (prev + 1) % eventCards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventCards.length]);
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

  // 상세 팝업 지도 임베드용 검색어 자동 정밀 파서 헬퍼
  const getMapSearchKeyword = (card: FeaturedCard) => {
    // 네이버 지도 링크 등이 포함되어 있다면 링크에서 검색어를 파싱해요
    if (card.link && card.link.includes("search/")) {
      try {
        const parts = card.link.split("search/");
        if (parts[1]) {
          const decoded = decodeURIComponent(parts[1]);
          return decoded;
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    // 타이틀에 [행정구역] 형태가 들어있다면 그 구역 이름과 장소명을 조합해 정확하게 찾아요
    if (card.title.includes("] ")) {
      const titleBody = card.title.split("] ")[1] || "";
      if (titleBody.includes(",")) {
        return titleBody.split(",")[1]?.trim() || titleBody.trim();
      }
      return titleBody.trim();
    }
    return card.region ? `용인 ${card.region} ${card.title}` : card.title;
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
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen font-[family-name:var(--font-pretendard)] pb-24 relative bg-background text-foreground transition-colors duration-300">
      {/* 프리미엄 다크 네이비/퍼플 그라데이션 광원 배경 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-950/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-indigo-950/25 blur-[160px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 pt-10 transition-all duration-500">

        {activeTab === "홈" && (
          <HeroSection
            gasPrices={gasPrices}
            visitorCount={visitorCount}
            setActiveTab={setActiveTab}
            onElectionClick={() => {
              setActiveTab("지방선거");
              window.history.pushState({}, '', '/?tab=지방선거');
            }}
          />
        )}

        {/* 🛍️ 쿠팡 파트너스 배너 */}
        <div className="mb-10 max-w-7xl mx-auto w-full relative z-20">
          <CoupangDynamicBanner />
        </div>

        {activeTab === "홈" && (
          <>
            {/* 📰 최신 소식 & 이메일 뉴스레터 구독 섹션 (지도 위로 대이동!) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-10 max-w-7xl mx-auto w-full relative z-20">
              
              {/* 왼쪽: 최신 소식 (9칸) - 좌측 무한 롤링 자동 슬라이더 개편 */}
              <div className="lg:col-span-9 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-noto-serif-kr)] tracking-tight">
                    최신 소식
                  </h2>
                </div>

                <InfiniteCarousel
                  items={latestCards.slice(0, 12)}
                  minItemsForScroll={3}
                  renderItem={(card, idx, dragging) => {
                    const viewCounts = [8925, 6825, 6985, 6825, 8925];
                    const views = viewCounts[idx % viewCounts.length].toLocaleString();
                    
                    const getCategoryStyles = (category: string) => {
                      switch (category) {
                        case "grant":
                        case "지원금":
                          return { text: "지원금", bg: "bg-blue-500/20 text-blue-300 border border-blue-500/30" };
                        case "event":
                        case "지역행사":
                        case "행사":
                          return { text: "지역행사", bg: "bg-purple-500/20 text-purple-300 border border-purple-500/30" };
                        case "info":
                        case "생활정보":
                          return { text: "생활정보", bg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" };
                        case "book":
                        case "도서정보":
                        case "도서 소식":
                        case "도서소식":
                          return { text: "도서소식", bg: "bg-amber-500/20 text-amber-300 border border-amber-500/30" };
                        case "world":
                        case "세계 경제":
                        case "세계경제":
                          return { text: "세계경제", bg: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" };
                        default:
                          return { text: category, bg: "bg-slate-500/20 text-slate-300 border border-slate-500/30" };
                      }
                    };

                    const catStyle = getCategoryStyles(card.category || "정보");

                    return (
                      <div
                        onClick={() => {
                          if (!dragging) {
                            setSelectedCard(card);
                          }
                        }}
                        className="group cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.3)] flex flex-col w-[240px] sm:w-[270px] md:w-[280px] lg:w-[290px] xl:w-[305px] flex-shrink-0 border border-white/5 hover:border-white/15 bg-slate-900/50"
                      >
                        {/* 16:9 꽉찬 이미지 */}
                        <div className="relative aspect-video w-full overflow-hidden">
                          <img
                            src={card.image?.startsWith("http") ? card.image : (IMG_BASE + (card.image || "thumb-default.png") + "?v=" + V_NUM)}
                            alt={card.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* 카테고리 뱃지 (좌상단) */}
                          <span className={`absolute top-3 left-3 z-10 text-[9px] font-black px-2.5 py-1 rounded-full backdrop-blur-md ${catStyle.bg}`}>
                            {catStyle.text}
                          </span>
                        </div>

                        {/* 하단 텍스트 영역 */}
                        <div className="p-4 flex flex-col gap-2">
                          <h3 className="text-[13px] lg:text-[14px] font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                            {card.title}
                          </h3>
                          <span className="text-[10px] text-gray-400 font-bold">{card.date}</span>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              {/* 오른쪽: 뉴스레터 구독 폼 (3칸) */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 dark:from-purple-950/40 dark:to-indigo-950/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500/20 blur-2xl rounded-full pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-sm relative">
                        <span className="text-xl">💌</span>
                        <span className="absolute -top-1 -right-1 text-xs animate-bounce">✈️</span>
                      </div>
                    </div>

                    <h3 className="text-[20px] font-[900] text-gray-900 dark:text-white mt-5 tracking-tight leading-tight">
                      구독하고 더 빠르게!
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-2.5 font-bold leading-relaxed">
                      새로운 정보와 꿀팁을<br />이메일로 편하게 받아보세요.
                    </p>
                  </div>

                  <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col gap-3 relative z-10">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="이메일 주소 입력"
                      className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all font-bold text-xs text-gray-900 dark:text-white placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-950/80 dark:hover:bg-indigo-900/80 text-white font-[900] text-xs py-4 rounded-2xl transition-all shadow-md active:scale-[0.98]"
                    >
                      구독하기
                    </button>
                  </form>

                  <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold text-center mt-5">
                    언제든지 구독 해지 가능해요.
                  </div>
                </div>
              </div>

            </div>

            {/* 🗺️ 용인 구별 종합 지도 및 Bento 가이드 보드 */}
            <div className="mb-12">
              <MapNoticeSection 
                setActiveTab={setActiveTab} 
                onCardClick={setSelectedCard} 
                allCards={allCards} 
              />
            </div>

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

              {/* 2. 지역 축제 & 행사 Bento (4칸) - 프리미엄 자동 슬라이드 캐러셀 */}
              <div 
                onClick={() => {
                  if (eventCards.length > 0) {
                    setSelectedCard(eventCards[eventSlideIdx]);
                  }
                }}
                className="md:col-span-4 bg-slate-950 rounded-[28px] border border-white/5 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-500 flex flex-col justify-between min-h-[360px] relative overflow-hidden group cursor-pointer"
              >
                {/* 배경 이미지와 다크 글래스모피즘 오버레이 */}
                {eventCards.length > 0 && (
                  <div className="absolute inset-0 z-0 transition-all duration-700 ease-in-out">
                    <img
                      src={getImageUrl(eventCards[eventSlideIdx].image || "")}
                      alt={eventCards[eventSlideIdx].title}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/40 backdrop-blur-[1px]" />
                  </div>
                )}

                <div className="relative z-10 flex flex-col justify-between h-full min-h-[348px] w-full">
                  {/* 상단 헤더 영역 */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-[13px] flex items-center gap-1.5 backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/10">
                      <span>📍</span> 지역 축제 & 행사
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("지역행사");
                        window.history.pushState({}, '', '/?tab=지역행사');
                      }}
                      className="text-gray-300 text-[10px] font-bold hover:text-blue-400 transition-colors backdrop-blur-md bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/5"
                    >
                      더보기 →
                    </button>
                  </div>

                  {/* 중간 슬라이드 콘텐츠 영역 */}
                  {eventCards.length > 0 ? (
                    <div className="my-auto pt-6 pb-2 transition-all duration-500">
                      <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black px-2 py-0.5 rounded-full mb-2">
                        {eventCards[eventSlideIdx].region || "용인시 전체"}
                      </span>
                      <h4 className="text-white font-[900] text-[17px] leading-snug line-clamp-2 drop-shadow-md mb-2 group-hover:text-blue-400 transition-colors">
                        {eventCards[eventSlideIdx].title}
                      </h4>
                      <p className="text-gray-300 text-[11px] font-semibold line-clamp-2 leading-relaxed opacity-85">
                        {eventCards[eventSlideIdx].summary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs font-semibold text-center my-auto py-10">등록된 축제/행사 정보가 없습니다.</p>
                  )}

                  {/* 하단 페이지 카운터 & Dot 인디케이터 */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                    <span className="text-[10px] font-bold text-gray-400">
                      {eventCards.length > 0 ? `${eventSlideIdx + 1} / ${eventCards.length}` : "0 / 0"}
                    </span>
                    {eventCards.length > 1 && (
                      <div className="flex gap-1.5">
                        {eventCards.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEventSlideIdx(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              eventSlideIdx === idx ? "bg-blue-400 w-3" : "bg-white/30 hover:bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
                          <p className="text-[10px] text-gray-500 font-medium line-clamp-2 mt-1 leading-normal">
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

            {/* 최신 소식 & 이메일 구독 섹션이 대시보드 위쪽으로 이동하여 원래 자리는 빈 블록으로 처리합니다. */}

            {/* 📢 용인시 뉴스 및 공지사항 보드 (맨 아래로 이사 완료) */}
            <NoticeBoard 
              setActiveTab={setActiveTab} 
              onCardClick={setSelectedCard} 
            />
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
                  onClick={() => setSelectedCard(card)}
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
          <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCard(null)} />
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] lg:h-[85vh] rounded-[40px] lg:rounded-[60px] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 relative custom-scrollbar flex flex-col border border-gray-100 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            {/* 상단 미디어 영역 (지도가 기본으로 표시되며 이미지와 탭 토글 가능!) */}
            <div className="w-full relative flex-shrink-0 h-[300px] lg:h-[500px] overflow-hidden bg-gray-100 dark:bg-gray-950">
              {selectedCard.id?.startsWith("guide-") && showMap ? (
                <iframe
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0 relative z-10 animate-in fade-in duration-300"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(getMapSearchKeyword(selectedCard))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              ) : (
                <img
                  src={selectedCard.image?.startsWith("http") ? selectedCard.image : (IMG_BASE + (selectedCard.image || "thumb-default.png") + "?v=" + V_NUM)}
                  alt={selectedCard.title}
                  className="w-full h-full object-cover relative z-10 animate-in fade-in duration-300"
                />
              )}
              {/* 닫기 버튼 (상단 이미지 위에 우아하게 배치) */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-8 right-8 z-[80] w-14 h-14 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white shadow-2xl border border-white dark:border-slate-700 hover:scale-110 transition-all text-3xl font-black pointer-events-auto"
              >
                ✕
              </button>
              
              {/* 관광 가이드 카드인 경우 노출되는 럭셔리 Glassmorphic "지도 🗺️ / 사진 🖼️" 토글 탭 단추 */}
              {selectedCard.id?.startsWith("guide-") ? (
                <div className="absolute top-8 left-8 z-[80] flex bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/20 gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                  <button
                    onClick={() => setShowMap(true)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 active:scale-95 ${
                      showMap
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-750 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>🗺️</span> 지도 보기
                  </button>
                  <button
                    onClick={() => setShowMap(false)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 active:scale-95 ${
                      !showMap
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm shadow-orange-500/20"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-750 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>🖼️</span> 사진 보기
                  </button>
                </div>
              ) : (
                <div className="absolute top-8 left-8 z-[80]">
                  {renderTags(selectedCard.category)}
                </div>
              )}
            </div>
            {/* 하단 본문 영역 (이미지 아래에 바로 이어짐) */}
            <div className="p-10 lg:p-20">
              <h2 className="text-2xl font-[900] text-gray-900 dark:text-white mb-4 leading-tight">{selectedCard.title}</h2>

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

              <div className="flex gap-4 mb-8 text-[11px] font-bold text-gray-400 dark:text-slate-400">
                <span className="flex items-center gap-1.5">📅 {selectedCard.date}</span>
                <span className="flex items-center gap-1.5">📍 {selectedCard.region || "용인"}</span>
              </div>

              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:font-[900] dark:prose-headings:text-white dark:prose-strong:text-white prose-a:text-blue-500">
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
