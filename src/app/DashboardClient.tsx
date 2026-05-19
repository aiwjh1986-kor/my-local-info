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
  const [visitorCount, setVisitorCount] = useState(1248);

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

  // URL 파라미터에서 탭 정보를 읽어와 설정
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      // 부드럽게 배너 하단으로 스크롤 (원하는 경우)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams]);

  // URL 파라미터에서 탭 정보를 읽어와 설정
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      // 부드럽게 배너 하단으로 스크롤 (원하는 경우)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
  // 🆕 최신 정보: [종료] 태그가 붙지 않은 글들 중 상위 12개만 노출
  const latestCards = allCards
    .filter(c => !c.title.includes("[종료]"))
    .slice(0, 12);
  const grantCards = allCards.filter(c => (c.category === "지원금" || c.category === "grant") && !c.title.includes("[종료]"));
  const eventCards = allCards.filter(c => (c.category === "지역행사" || c.category === "event") && !c.title.includes("[종료]"));
  const infoCards = allCards.filter(c => (c.category === "생활정보" || c.category === "info") && !c.title.includes("[종료]"));
  const bookCards = allCards.filter(c => (c.category === "도서정보" || c.category === "book") && !c.title.includes("[종료]"));
  const worldCards = allCards.filter(c => (c.category === "세계 경제" || c.category === "world") && !c.title.includes("[종료]"));
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
      "세계 경제": ["world", "세계 경제", "economy"]
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
    icon,
    cards,
    onCardClick,
    onMoreClick,
    isCarousel = false
  }: {
    title: string;
    icon: string;
    cards: FeaturedCard[];
    onCardClick: (card: FeaturedCard) => void;
    onMoreClick: () => void;
    isCarousel?: boolean;
  }) => {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-white/50 shadow-gray-200/50 overflow-hidden">
              <img src={icon} alt={title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">Live Updates</p>
            </div>
          </div>
          <button
            onClick={onMoreClick}
            className="px-6 py-2 bg-white/80 backdrop-blur-md rounded-full text-xs font-black text-gray-500 hover:bg-blue-600 hover:text-white transition-all border border-gray-100 shadow-sm flex items-center gap-2 group"
          >
            <span>전체보기</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {isCarousel ? (
          <InfiniteCarousel
            items={cards}
            renderItem={(card, idx, dragging) => (
              <div className="min-w-[280px] md:min-w-[320px] max-w-[320px]">
                <Card
                  card={card}
                  onClick={() => !dragging && onCardClick(card)}
                  isAdmin={isAdmin}
                  onImageEdit={startImageEdit}
                  href={card.slug ? `/blog/${card.slug}` : undefined}
                />
              </div>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen font-[family-name:var(--font-pretendard)] pb-24 relative">
      {/* 🖼️ 메인 배경 이미지 */}
      <div
        className="fixed inset-0 z-[-1] opacity-50 pointer-events-none"
        style={{
          backgroundImage: `url(${IMG_BASE}background1.png?v=${V_NUM})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      {/* 플로팅 배경 요소 (배경 이미지와 조화롭게 어우러짐) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-200/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-200/20 blur-[120px] rounded-full" />
      </div>

      {/* 🏮 메뉴 버튼 (상단 바 없이 단독으로 플로팅) */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 left-5 z-[60] bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 lg:px-8 lg:py-4 rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
      >
        <span className="text-xl lg:text-2xl font-extrabold text-gray-800 font-[family-name:var(--font-baloo-2)] tracking-wider group-hover:text-blue-600 transition-colors">MENU</span>
      </button>

      <main className="relative z-10 max-w-[1600px] mx-auto px-5 lg:px-10 pt-24 lg:pt-8 transition-all duration-500">

        {/* 🏮 초대형 와이드 개편 배너 (모바일 초슬림 최적화) */}
        <div className="mb-12 relative overflow-hidden bg-[#E9EBF3] rounded-[40px] lg:rounded-[60px] p-6 lg:p-20 shadow-2xl border border-white group min-h-[280px] lg:min-h-[600px] flex flex-col justify-center lg:justify-between transition-all duration-500">

          {/* 배경 장식 요소 (고급스러움 추가) */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row h-full">

            <div className="flex-1 flex flex-col justify-start text-center lg:text-left mb-6 lg:mb-0">
              <div className="animate-in fade-in slide-in-from-top duration-1000">
                <div className="hidden lg:flex items-center gap-2 mb-4 lg:mb-8 justify-center lg:justify-start">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[8px] lg:text-sm font-black rounded-full animate-pulse uppercase tracking-widest">Premium Guide</span>
                  <span className="text-[8px] lg:text-sm font-black text-blue-400 uppercase tracking-widest opacity-60">2024 New Update</span>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-8xl font-black text-[#111111] mb-2 lg:mb-10 leading-tight tracking-tighter font-handwriting mt-10 lg:mt-0">
                  용인 생활의 모든 것,<br className="hidden lg:block" />
                  <span className="text-blue-600">루미 가이드</span>와 함께!
                </h2>
                <p className="hidden lg:block text-sm md:text-xl lg:text-3xl text-gray-500 font-bold leading-relaxed max-w-2xl opacity-80 mb-6 lg:mb-10">
                  혜택, 행사, 정보까지 한 번에 확인하고<br className="hidden lg:block" />
                  더 똑똑한 용인 생활을 즐겨보세요.
                </p>
                {/* 모바일에서는 버튼 숨김 */}
                <div className="flex flex-col gap-4 mt-6">
                  <button
                    onClick={() => router.push("/blog")}
                    className="hidden lg:inline-flex items-center gap-4 px-8 py-4 lg:px-16 lg:py-7 bg-accent text-white rounded-full text-lg lg:text-3xl font-black shadow-2xl shadow-accent/30 hover:scale-105 transition-all w-fit"
                  >
                    블로그 바로가기 <span>→</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("세계 경제");
                      window.history.pushState({}, '', '/?tab=세계 경제');
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hidden lg:inline-flex items-center gap-4 px-8 py-4 lg:px-12 lg:py-5 bg-white text-red-600 rounded-full text-lg lg:text-2xl font-black shadow-xl hover:scale-105 transition-all w-fit border-2 border-red-100"
                  >
                    세계 경제 소식 <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* [우측] 초대형 캐릭터 영역 (모바일에서는 텍스트 가독성을 위해 숨김) */}
            <div className="relative flex-1 hidden lg:flex items-center justify-center lg:justify-end">
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

          {/* [하단] 5대 핵심 메뉴 - 반응형 최적화 (잘림 방지) */}
          <div className="relative z-10 hidden lg:flex items-center justify-center mt-12 lg:mt-24 w-full px-4">
            <div className="flex flex-nowrap items-center justify-center gap-2 xl:gap-5 bg-white/60 lg:bg-gray-100/60 backdrop-blur-md px-4 xl:px-8 py-4 xl:py-6 rounded-full border border-white/50 shadow-xl min-w-fit overflow-x-auto no-scrollbar">
              {[
                { id: "홈", label: "홈", img: "icon-home.png" },
                { id: "지원금", label: "지원금 혜택", img: "icon-grant.png" },
                { id: "지역행사", label: "지역행사", img: "icon-event.png" },
                { id: "생활정보", label: "생활 정보", img: "icon-info.png" },
                { id: "도서정보", label: "도서 소식", img: "icon-book.png" },
                { id: "세계 경제", label: "세계 경제", img: "icon-world.png" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "홈") {
                      setActiveTab("홈");
                      window.history.pushState({}, '', '/');
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      setActiveTab(item.id as any);
                      window.history.pushState({}, '', `/?tab=${item.id}`);
                    }
                  }}
                  className={`flex items-center gap-2 xl:gap-3 px-3 xl:px-6 py-2 xl:py-4 rounded-2xl xl:rounded-full transition-all group hover:bg-white hover:shadow-lg ${activeTab === item.id ? "bg-white shadow-md scale-105" : "hover:scale-105"
                    }`}
                >
                  <div className="w-10 h-10 xl:w-14 xl:h-14 flex-shrink-0">
                    <img src={IMG_BASE + item.img + "?v=" + V_NUM} alt={item.label} className="w-full h-full object-contain" />
                  </div>
                  <span className={`hidden xl:block text-sm xl:text-lg 2xl:text-xl font-black whitespace-nowrap transition-colors ${activeTab === item.id ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                    }`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🛍️ [긴급 복구] 쿠팡 파트너스 광고 배너 (최상단 노출) */}
        <div className="mb-12 max-w-7xl mx-auto w-full px-5 lg:px-0 relative z-20">
          <CoupangDynamicBanner />
        </div>

        {activeTab === "홈" && (
          <>
            {/* 실시간 주유소 위젯 (고정 최상단) */}
            <GasPriceWidget />

            {/* 섹션들 */}
            <Section
              title="최신 정보"
              icon={IMG_BASE + "icon-new.png?v=" + V_NUM}
              cards={latestCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => {
                setActiveTab("블로그");
                setActiveBlogCat("전체");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* ✨ 루미의 생활 팁! 전용 섹션 (순서 변경) */}
            <div className="mt-16 mb-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100 overflow-hidden">
                    <img
                      src={IMG_BASE + "icon-ggul.png?v=" + V_NUM}
                      alt="꿀팁 아이콘"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">루미의 실생활 꿀팁!</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">삶이 편리해지는 작은 비결들을 모았어요.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/tips")}
                  className="bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all font-black text-gray-800 text-sm flex items-center gap-2 group"
                >
                  <span>전체보기</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
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
                    className="min-w-[300px] md:min-w-[340px] max-w-[340px] bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2 transition-all group overflow-hidden relative cursor-pointer h-full"
                  >
                    <div className="absolute top-0 right-0 p-4 flex gap-2">
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsTipEdit(true);
                            setEditingTipId(tip.id);
                            setNewImageUrl(tip.image);
                            setIsEditModalOpen(true);
                          }}
                          className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black hover:scale-105 transition-all shadow-lg z-20"
                        >
                          📸 이미지 수정
                        </button>
                      )}
                      <span className="bg-yellow-50 text-yellow-600 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-100">
                        {tip.category}
                      </span>
                    </div>

                    <div className="mb-6 rounded-2xl overflow-hidden aspect-video bg-gray-50">
                      <img
                        src={getImageUrl(tip.image)}
                        alt={tip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-lg font-black text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8 font-medium line-clamp-3 h-[4.5rem]">
                      {tip.description}
                    </p>

                    <div className="pt-6 border-t border-gray-50 mt-auto">
                      <div className="text-[10px] text-gray-400 font-black mb-3 ml-1 uppercase tracking-widest">루미의 추천 아이템</div>
                      <a
                        href={tip.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-gray-50 hover:bg-yellow-400 p-4 rounded-2xl transition-all group/btn"
                      >
                        <span className="text-xs font-black text-gray-700 group-hover/btn:text-gray-900">{tip.productName}</span>
                        <span className="text-lg group-hover/btn:translate-x-1 transition-transform">🛒</span>
                      </a>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* ⏰ 마감임박 전용 섹션 (신설) */}
            {impendingCards.length > 0 && (
              <Section
                title="마감임박! 놓치지 마세요"
                icon={IMG_BASE + "icon-clock.png?v=" + V_NUM}
                cards={impendingCards}
                isCarousel={true}
                onCardClick={setSelectedCard}
                onMoreClick={() => {
                  setActiveTab("블로그");
                  setActiveBlogCat("전체");
                  window.history.pushState({}, '', '/?tab=블로그');
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}

            <Section
              title="놓치면 아까운 지원금"
              icon={IMG_BASE + "icon-grant.png?v=" + V_NUM}
              cards={grantCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("지원금")}
            />

            <Section
              title="즐거운 지역 행사"
              icon={IMG_BASE + "icon-event.png?v=" + V_NUM}
              cards={eventCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("지역행사")}
            />

            <Section
              title="유익한 생활 정보"
              icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
              cards={infoCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("생활정보")}
            />

            <Section
              title="지혜가 쌓이는 도서 추천"
              icon={IMG_BASE + "icon-book.png?v=" + V_NUM}
              cards={bookCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => {
                setActiveTab("블로그");
                setActiveBlogCat("도서정보");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            
            <Section
              title="글로벌 트렌드: 세계 경제"
              icon={IMG_BASE + "icon-world.png?v=" + V_NUM}
              cards={worldCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => {
                setActiveTab("세계 경제");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
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
                  "세계 경제": "world"
                };
                const korCatMap: Record<string, string> = {
                  "지원금": "지원금",
                  "지역행사": "지역행사",
                  "생활정보": "생활정보",
                  "도서정보": "도서정보",
                  "세계 경제": "세계 경제"
                };
                const match = c.category === catMap[activeTab] || c.category === korCatMap[activeTab] ||
                  (activeTab === "지역행사" && (c.category === "행사" || c.category === "지역행사"));
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
