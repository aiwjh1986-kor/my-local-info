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

export interface Festival {
  contentid: string;
  title: string;
  eventstartdate: string;
  eventenddate: string;
  addr1: string;
  firstimage: string;
  firstimage2: string;
  tel: string;
  regionGroup: string;
}

export default function DashboardClient({
  allCards
}: {
  allCards: FeaturedCard[]
}) {
  const router = useRouter();
  const { lastUpdate } = data;
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("홈");
  const [activeBlogCat, setActiveBlogCat] = useState("전체");
  const [activeSubCat, setActiveSubCat] = useState("전체");
  const [selectedCard, setSelectedCard] = useState<FeaturedCard | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(1248);
  const [gasPrices, setGasPrices] = useState<GasResponse | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("전체");

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

  useEffect(() => {
    fetch('/data/festivals.json')
      .then(res => res.json())
      .then(data => setFestivals(data || []))
      .catch(e => console.error("페스티벌 로드 실패", e));
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
      setActiveSubCat("전체");
    } else {
      setActiveTab("홈");
    }
    // 부드럽게 화면 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  const isMapEnabled = (card: FeaturedCard | null) => {
    if (!card) return false;
    return card.id?.startsWith("guide-") || 
           card.category === "추천코스" || 
           card.category === "지역행사" || 
           card.category === "행사" || 
           card.category === "event";
  };

  // 모달이 열릴 때 지도 기능이 있는 카드인 경우 지도를 기본 노출하도록 초기화
  useEffect(() => {
    if (selectedCard) {
      if (isMapEnabled(selectedCard)) {
        setShowMap(true);
      } else {
        setShowMap(false);
      }
    }
  }, [selectedCard]);

  // ✨ 기존의 복잡한 자동 슬라이더 로직들은 CSS 애니메이션 방식으로 대체되어 제거되었습니다.

  // #1 & #2 속도 개선: 
  // - 무거운 본문(content)을 초기 로딩에서 제외했습니다.
  // - 데이터 병합과 정렬을 서버(page.tsx)에서 이미 처리해서 넘겨받습니다.
  // const allCards = getCombinedData(); // 이 복잡한 계산을 브라우저가 더 이상 하지 않습니다!
  // 🆕 최신 정보: [종료] 태그가 붙지 않고 지방선거 카테고리가 아닌 글들 중 상위 12개만 노출
  const latestCards = allCards
    .filter(c => !c.title.includes("[종료]") && c.category !== "지방선거" && c.category !== "election")
    .slice(0, 12);
  const grantCards = allCards.filter(c => (c.category === "지원금" || c.category === "grant") && !c.title.includes("[종료]"));
  const eventCards = allCards.filter(c => (c.category === "지역행사" || c.category === "event") && !c.title.includes("[종료]"));
  const infoCards = allCards.filter(c => (c.category === "용인시정보" || c.category === "info") && !c.title.includes("[종료]"));

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
      "용인시정보": ["info", "용인시정보", "life"],
      "도서정보": ["book", "도서정보", "도서 소식", "도서"],
      "독서일기": ["diary", "독서일기", "reading diary"],
      "세계 경제": ["world", "세계 경제", "economy"],
      "지방선거": ["election", "지방선거"],
      "월드컵": ["worldcup", "월드컵", "특별소식"]
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
    } else if (cat === "info" || cat === "용인시정보") {
      label = "용인시정보";
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
    if ((card as any).address) {
      return (card as any).address;
    }
    
    if (card.category === "추천코스") {
      return card.region && card.region !== "전체" ? card.region : card.title;
    }

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
    
    // 타이틀에 대괄호 [장소명] 형태가 들어있다면, 괄호 안의 텍스트가 장소일 확률이 높아요!
    const bracketMatch = card.title.match(/\[(.*?)\]/);
    if (bracketMatch) {
      const bracketText = bracketMatch[1].trim();
      // 날짜나 카테고리 태그가 아니라 장소명 키워드를 포함하거나 일반 단어라면 장소로 간주
      const isStatusOrDate = /종료|마감|예정|진행|안내|행사|축제|코스|[0-9]/.test(bracketText);
      const isPlaceKeyword = /홀|센터|파크|공원|구청|도서관|미술관|박물관|체육관|시장|마을|광장|경기장/.test(bracketText);
      
      if (isPlaceKeyword || (!isStatusOrDate && bracketText.length > 2)) {
        return bracketText; // 예: "용인 포은아트홀"
      }
    }
    
    // 장소명이 괄호에 없다면, 기존처럼 괄호 밖의 내용을 시도합니다.
    if (card.title.includes("] ")) {
      let titleBody = card.title.split("] ")[1] || "";
      
      // 자동 생성된 축제 글의 불필요한 수식어 제거
      titleBody = titleBody.replace(/이번 주말 나들이 추천!\s*/g, "");
      titleBody = titleBody.replace(/\s*완벽 가이드\s*🎉/g, "");
      
      let finalKeyword = titleBody.trim();
      if (titleBody.includes(",")) {
        finalKeyword = titleBody.split(",")[1]?.trim() || titleBody.trim();
      }
      
      if (card.region && card.region !== "전체" && card.region !== "전국") {
        return `${card.region} ${finalKeyword}`;
      }
      return finalKeyword;
    }
    return card.region && card.region !== "전체" ? `${card.region} ${card.title}` : card.title;
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


            {/* 🗺️ 용인 구별 종합 지도 및 Bento 가이드 보드 */}
            <div className="mb-12">
              <MapNoticeSection 
                setActiveTab={setActiveTab} 
                onCardClick={setSelectedCard} 
                allCards={allCards} 
              />
            </div>

            {/* 최신 소식 & 이메일 구독 섹션이 대시보드 위쪽으로 이동하여 원래 자리는 빈 블록으로 처리합니다. */}


          </>
        )}

        {activeTab !== "홈" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-10 text-center pt-10">
              <h1 className="text-4xl font-[900] text-gray-900 mb-2 tracking-tight">{activeTab}</h1>
              <p className="text-sm text-gray-400 font-bold">상세 정보를 확인해 보세요.</p>
            </div>

            {/* 지역행사 탭인 경우 지역 필터 (전국 디렉토리) */}
            {activeTab === "지역행사" && (
              <div className="flex gap-2 justify-center flex-wrap mb-8">
                {["전체", "서울", "경기", "인천", "강원", "충청", "전라", "경상", "제주"].map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-5 py-2.5 rounded-2xl text-[13px] font-black transition-all shadow-sm ${
                      selectedRegion === region
                        ? "bg-purple-100 text-purple-600 shadow-inner border border-purple-200"
                        : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}

            {/* 블로그 탭인 경우 상단 카테고리 필터 */}
            {activeTab === "블로그" && (
              <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
                {["전체", "지역행사", "용인시정보", "세계 경제", "월드컵"].map((cat) => (
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

            {(() => {
              if (activeTab === "지역행사") {
                const todayStr = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(new Date()).replace(/\. /g, '').replace('.', '');
                const filteredFestivals = festivals.filter(f => (selectedRegion === "전체" || f.regionGroup === selectedRegion) && f.eventenddate >= todayStr);
                
                return (
                  <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 lg:px-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {filteredFestivals.map((festival, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-[320px]">
                          <div className="relative w-full h-[200px] overflow-hidden bg-gray-100">
                            <img 
                              src={festival.firstimage || "/images/thumb-default.png"} 
                              alt={festival.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-black px-2.5 py-1 rounded-lg text-purple-600 shadow-sm border border-purple-100">
                              {festival.regionGroup}
                            </div>
                          </div>
                          <div className="p-4 flex flex-col flex-grow justify-between">
                            <h3 className="font-bold text-gray-900 text-[14px] line-clamp-2 leading-tight">
                              {festival.title}
                            </h3>
                            <div className="text-[11px] text-gray-500 font-medium mt-2 flex flex-col gap-0.5">
                              <span>📅 {festival.eventstartdate} ~ {festival.eventenddate}</span>
                              <span className="truncate">📍 {festival.addr1}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredFestivals.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-20 text-sm font-bold">해당 지역의 행사 정보가 없습니다.</div>
                      )}
                    </div>
                  </div>
                );
              }

              const cardsToRender = (activeTab === "블로그" ? filteredPosts : allCards.filter(c => {
                const catMap: Record<string, string> = {
                  "지원금": "grant",
                  "용인시정보": "info",
                  "도서정보": "book",
                  "도서 소식": "book",
                  "독서일기": "diary",
                  "세계 경제": "world",
                  "지방선거": "election",
                  "월드컵": "특별소식"
                };
                const korCatMap: Record<string, string> = {
                  "지원금": "지원금",
                  "용인시정보": "용인시정보",
                  "도서정보": "도서정보",
                  "도서 소식": "도서정보",
                  "독서일기": "독서일기",
                  "세계 경제": "세계 경제",
                  "지방선거": "지방선거",
                  "월드컵": "월드컵"
                };
                let match = c.category === catMap[activeTab] || c.category === korCatMap[activeTab] ||
                  ((activeTab === "도서정보" || activeTab === "도서 소식") && (c.category === "book" || c.category === "도서정보")) ||
                  (activeTab === "독서일기" && (c.category === "diary" || c.category === "독서일기")) ||
                  (activeTab === "월드컵" && (c.category === "특별소식" || c.category === "월드컵" || c.category === "worldcup"));
                
                return match;
              })).sort((a, b) => {
                const aEnded = a.title.includes("[종료]");
                const bEnded = b.title.includes("[종료]");
                if (aEnded && !bEnded) return 1;
                if (!aEnded && bEnded) return -1;
                const aDateStr = (a.date || "").toString();
                const bDateStr = (b.date || "").toString();
                const dateA = new Date(aDateStr.includes("T") ? aDateStr : aDateStr.replace(/\./g, '-')).getTime();
                const dateB = new Date(bDateStr.includes("T") ? bDateStr : bDateStr.replace(/\./g, '-')).getTime();
                
                // NaN일 경우 (안전 장치)
                if (isNaN(dateA) && isNaN(dateB)) return 0;
                if (isNaN(dateA)) return 1;
                if (isNaN(dateB)) return -1;
                
                return dateB - dateA;
              });

              const isDiaryView = activeTab === "독서일기" || (activeTab === "블로그" && activeBlogCat === "독서일기");

              return isDiaryView ? (
                <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
                  {cardsToRender.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCard(card)}
                      className="bg-white border border-gray-100 p-6 rounded-[24px] cursor-pointer shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <h3 className="font-bold text-lg text-gray-900 mb-2 tracking-tight group-hover:text-purple-600 transition-colors">{card.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{card.summary}</p>
                      <div className="text-xs text-purple-400 font-black mt-4 flex items-center gap-2">
                        <span>📅</span> {card.date}
                      </div>
                    </div>
                  ))}
                  {cardsToRender.length === 0 && (
                    <div className="text-center text-gray-400 py-20 text-sm font-bold">작성된 독서일기가 없습니다.</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-8 w-full">
                  {activeTab === "블로그" && activeBlogCat === "월드컵" && (
                    <div className="w-full flex justify-center bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <img 
                        src="/images/월드컵/토너1.png" 
                        alt="월드컵 토너먼트 대진표" 
                        className="max-w-full h-auto rounded-xl"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cardsToRender.map((card, idx) => (
                      <Card
                        key={idx}
                        card={card}
                        onClick={() => setSelectedCard(card)}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
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
              {isMapEnabled(selectedCard) && showMap ? (
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
              
              {/* 항상 카테고리 태그 노출 */}
              <div className="absolute top-8 left-8 z-[80]">
                {renderTags(selectedCard.category)}
              </div>
            </div>
            {/* 하단 본문 영역 (이미지 아래에 바로 이어짐) */}
            <div className="p-10 lg:p-20">
              <h2 className="text-2xl font-[900] text-gray-900 dark:text-white mb-4 leading-tight">{selectedCard.title}</h2>

              {/* 지도/사진 토글 및 길찾기 버튼 (크게 배치) */}
              {isMapEnabled(selectedCard) && (
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <button
                    onClick={() => {
                       setShowMap(true);
                       document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-5 py-3 rounded-2xl text-[14px] font-black transition-all flex items-center gap-2 active:scale-95 ${
                      showMap
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-xl">🗺️</span> 지도 보기
                  </button>
                  <button
                    onClick={() => {
                       setShowMap(false);
                       document.querySelector('.custom-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-5 py-3 rounded-2xl text-[14px] font-black transition-all flex items-center gap-2 active:scale-95 ${
                      !showMap
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-xl">🖼️</span> 사진 보기
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getMapSearchKeyword(selectedCard))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-2xl text-[14px] font-black transition-all flex items-center gap-2 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 ml-auto sm:ml-0"
                  >
                    <span className="text-xl">🧭</span> 길찾기
                  </a>
                </div>
              )}

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
                    {["지원금", "지역행사", "용인시정보"].map(cat => (
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

              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:font-[900] dark:prose-headings:text-white dark:prose-strong:text-white prose-a:text-blue-500 prose-h2:text-2xl prose-h2:text-indigo-600 dark:prose-h2:text-indigo-400 prose-h2:mt-10 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-indigo-100 dark:prose-h2:border-indigo-900/30 prose-h3:text-lg prose-h3:text-indigo-500 dark:prose-h3:text-indigo-300 prose-h3:mt-8 prose-h3:mb-3">
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
                    ),
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
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
                    {selectedCard.category?.includes("꿀팁") || selectedCard.category === "book" || selectedCard.category === "도서정보" || selectedCard.category === "독서일기" ? "구매하러 가기" : "홈페이지 바로가기"}
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
              router.push("/");
              setIsMenuOpen(false);
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
              setActiveTab("용인시정보");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=용인시정보');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
            label="용인시정보"
            active={activeTab === "용인시정보"}
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
              setActiveTab("독서일기");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=독서일기');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-book.png?v=" + V_NUM}
            label="독서일기"
            active={activeTab === "독서일기"}
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
            router.push("/");
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
