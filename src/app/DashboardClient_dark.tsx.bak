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

// ?고듃 諛?罹먯떆 愿???곸닔
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

// ?뿳截?????吏諛⑹꽑嫄?2026??6??3?? ?ㅼ떆媛?D-Day 怨꾩궛湲?function getElectionDDay() {
  const target = new Date("2026-06-03T00:00:00+09:00");
  const today = new Date();
  
  // ?ㅻ뒛 ?좎쭨? ?좉굅?쇱쓽 ?쒓컖 李⑥씠瑜?'諛由ъ큹' ?⑥쐞濡?怨꾩궛?댁슂
  const difference = target.getTime() - today.getTime();
  
  // 諛由ъ큹瑜??섎（ ?⑥쐞(1000珥?* 60遺?* 60珥?* 24?쒓컙)濡??섎늻???뚯닔???꾨옒???щ┝?댁슂
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  if (daysLeft > 0) {
    return `D-${daysLeft}`;
  } else if (daysLeft === 0) {
    return "D-Day";
  } else {
    return `D+${Math.abs(daysLeft)}`;
  }
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
  const [activeTab, setActiveTab] = useState("??);
  const [activeBlogCat, setActiveBlogCat] = useState("?꾩껜");
  const [selectedCard, setSelectedCard] = useState<FeaturedCard | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // 愿由ъ옄 濡쒓렇???곹깭 ?뺤씤 (荑좏궎 ?뺤씤)
  useEffect(() => {
    const isAdminCookie = document.cookie.split('; ').find(row => row.startsWith('is_admin='));
    if (isAdminCookie && isAdminCookie.split('=')[1] === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // URL ?뚮씪誘명꽣?먯꽌 ???뺣낫瑜??쎌뼱? ?ㅼ젙
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      // 遺?쒕읇寃?諛곕꼫 ?섎떒?쇰줈 ?ㅽ겕濡?(?먰븯??寃쎌슦)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams]);

  // URL ?뚮씪誘명꽣?먯꽌 ???뺣낫瑜??쎌뼱? ?ㅼ젙
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      // 遺?쒕읇寃?諛곕꼫 ?섎떒?쇰줈 ?ㅽ겕濡?(?먰븯??寃쎌슦)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams]);

  // ??湲곗〈??蹂듭옟???먮룞 ?щ씪?대뜑 濡쒖쭅?ㅼ? CSS ?좊땲硫붿씠??諛⑹떇?쇰줈 ?泥대릺???쒓굅?섏뿀?듬땲??

  const featuredCards = initialFeaturedCards;
  const blogPosts = initialBlogPosts;

  // 以묐났 ?쒓굅 諛??곗씠???듯빀 (?쒕ぉ 湲곗?)
  const getCombinedData = () => {
    // 1. 紐⑤뱺 ?곗씠?곕? ?섎굹濡??듯빀
    const combined = [...initialBlogPosts, ...initialFeaturedCards];

    // 2. 以묐났 ?쒓굅 (slug ?먮뒗 id 湲곗?)
    const unique = Array.from(new Map(combined.map(item => [item.slug || item.id, item])).values());

    const todayStr = new Date().toISOString().split('T')[0];

    // 3. 臾댁“嫄??좎쭨 理쒖떊???대┝李⑥닚)?쇰줈留??뺣젹
    return unique.sort((a, b) => {
      const dateAStr = (a.date || "").toString().replace(/\./g, '-');
      const dateBStr = (b.date || "").toString().replace(/\./g, '-');

      const dateA = new Date(dateAStr).getTime();
      const dateB = new Date(dateBStr).getTime();

      return dateB - dateA;
    });
  };

  const allCards = getCombinedData();
  // ?넅 理쒖떊 ?뺣낫: [醫낅즺] ?쒓렇媛 遺숈? ?딄퀬 吏諛⑹꽑嫄?移댄뀒怨좊━媛 ?꾨땶 湲??以??곸쐞 12媛쒕쭔 ?몄텧
  const latestCards = allCards
    .filter(c => !c.title.includes("[醫낅즺]") && c.category !== "吏諛⑹꽑嫄? && c.category !== "election")
    .slice(0, 12);
  const grantCards = allCards.filter(c => (c.category === "吏?먭툑" || c.category === "grant") && !c.title.includes("[醫낅즺]"));
  const eventCards = allCards.filter(c => (c.category === "吏??뻾?? || c.category === "event") && !c.title.includes("[醫낅즺]"));
  const infoCards = allCards.filter(c => (c.category === "?앺솢?뺣낫" || c.category === "info") && !c.title.includes("[醫낅즺]"));
  const bookCards = allCards.filter(c => (c.category === "?꾩꽌?뺣낫" || c.category === "book") && !c.title.includes("[醫낅즺]"));
  const worldCards = allCards.filter(c => (c.category === "?멸퀎 寃쎌젣" || c.category === "world") && !c.title.includes("[醫낅즺]"));
  const electionCards = allCards.filter(c => (c.category === "吏諛⑹꽑嫄? || c.category === "election") && !c.title.includes("[醫낅즺]"));
  const popularCards = allCards.filter((c) => c.is_popular).slice(0, 3);

  // ??留덇컧?꾨컯 移대뱶 ?꾪꽣留?(7???대궡 留덇컧?섎뒗 湲)
  // ??留덇컧?꾨컯 移대뱶 ?꾪꽣留?(?대? 醫낅즺??湲 ?쒖쇅!)
  const TODAY_TIME = new Date().setHours(0, 0, 0, 0);
  const impendingCards = allCards.filter(p => {
    if (!p.deadline) return false;
    // ?쒕ぉ??[醫낅즺]媛 ?덉쑝硫?留덇컧?꾨컯?먯꽌 ?쒖쇅
    if (p.title.includes("[醫낅즺]")) return false;

    const deadlineTime = new Date(p.deadline).getTime();
    const diffDays = (deadlineTime - TODAY_TIME) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  // 釉붾줈洹??꾪꽣留?濡쒖쭅
  const getFilteredBlogPosts = () => {
    const catMap: Record<string, string[]> = {
      "吏?먭툑": ["grant", "吏?먭툑", "subsidy"],
      "?됱궗": ["event", "?됱궗", "吏??뻾??, "吏???됱궗"],
      "吏??뻾??: ["event", "?됱궗", "吏??뻾??, "吏???됱궗"],
      "?앺솢?뺣낫": ["info", "?앺솢?뺣낫", "life"],
      "?꾩꽌?뺣낫": ["book", "?꾩꽌?뺣낫", "?꾩꽌 ?뚯떇", "?꾩꽌"],
      "?멸퀎 寃쎌젣": ["world", "?멸퀎 寃쎌젣", "economy"],
      "吏諛⑹꽑嫄?: ["election", "吏諛⑹꽑嫄?]
    };

    const postsToFilter = allCards.filter(post => !post.title.includes("[醫낅즺]"));
    if (activeBlogCat === "?꾩껜") return postsToFilter;

    // 2以??덉쟾?μ튂: 踰꾪듉 ?대쫫??'?됱궗'?щ룄 '吏??뻾?? ?뺣낫瑜?李얠븘?ㅺ쾶 ??    const actualCat = (activeBlogCat === "?됱궗" || activeBlogCat === "吏??뻾??) ? "吏??뻾?? : activeBlogCat;
    const targets = (catMap[actualCat] || [actualCat]).map(t => t.toLowerCase().replace(/\s/g, ''));

    return postsToFilter.filter((post) => {
      const postCat = (post.category || "").toLowerCase().replace(/\s/g, '');
      return targets.includes(postCat);
    });
  };

  const filteredPosts = getFilteredBlogPosts();

  // ?쒓렇 ?뚮뜑留??ы띁
  const renderTags = (cat: string) => {
    let label = cat;
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-600";

    if (cat === "grant" || cat === "吏?먭툑") {
      label = "吏?먭툑";
      bgColor = "bg-orange-100";
      textColor = "text-orange-600";
    } else if (cat === "event" || cat === "?됱궗") {
      label = "?됱궗";
      bgColor = "bg-blue-100";
      textColor = "text-blue-600";
    } else if (cat === "info" || cat === "?앺솢?뺣낫") {
      label = "?앺솢?뺣낫";
      bgColor = "bg-green-100";
      textColor = "text-green-600";
    } else if (cat === "book" || cat === "?꾩꽌?뺣낫") {
      label = "?꾩꽌?뺣낫";
      bgColor = "bg-purple-100";
      textColor = "text-purple-600";
    } else if (cat === "world" || cat === "?멸퀎 寃쎌젣") {
      label = "?멸퀎 寃쎌젣";
      bgColor = "bg-red-100";
      textColor = "text-red-600";
    } else if (cat === "election" || cat === "吏諛⑹꽑嫄?) {
      label = "吏諛⑹꽑嫄?;
      bgColor = "bg-teal-100";
      textColor = "text-teal-600";
    }

    return (
      <span className={`${bgColor} ${textColor} text-[10px] px-2 py-0.5 rounded-full font-medium`}>
        {label}
      </span>
    );
  };

  // ?대?吏 ?섏젙 ?쒖옉
  const startImageEdit = (e: React.MouseEvent, card: FeaturedCard) => {
    e.stopPropagation(); // 移대뱶 ?대┃ ?대깽???꾪뙆 諛⑹?
    setEditingCard(card);
    setNewImageUrl(card.image || "");
    setIsContentEdit(false);
    setIsEditModalOpen(true);
  };

  // ?대?吏 ?섏젙 ???  const saveImageChanges = async () => {
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
        else alert("???대?吏 ?섏젙???ㅽ뙣?덉뒿?덈떎.");
      } catch (err) {
        alert("?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
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
        // ?깃났 ???섏씠吏 ?덈줈怨좎묠?섏뿬 諛섏쁺
        window.location.reload();
      } else {
        alert("?대?吏 ?섏젙???ㅽ뙣?덉뒿?덈떎.");
      }
    } catch (err) {
      alert("?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    } finally {
      setIsSaving(false);
    }
  };

  // 寃뚯떆湲 ??젣
  const deletePost = async () => {
    // slug媛 ?덉쑝硫??곗꽑 ?ъ슜, ?놁쑝硫?id ?ъ슜
    const targetSlug = selectedCard?.slug || selectedCard?.id;
    if (!selectedCard || !targetSlug) return;

    if (!confirm("?뺣쭚 ??寃뚯떆湲????젣?섏떆寃좎뒿?덇퉴?\n??젣??湲? 蹂듦뎄?????놁뒿?덈떎.")) {
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
        alert("寃뚯떆湲????젣?섏뿀?듬땲??");
        window.location.reload();
      } else {
        alert("??젣???ㅽ뙣?덉뒿?덈떎.");
      }
    } catch (err) {
      alert("?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    } finally {
      setIsSaving(false);
    }
  };

  // ?띿뒪???섏젙 ?쒖옉
  const startTextEdit = () => {
    if (!selectedCard) return;
    setEditingText(selectedCard.content || selectedCard.detail || selectedCard.summary || "");
    setIsTextEditModalOpen(true);
  };

  // ?띿뒪???섏젙 ???  const saveTextChanges = async () => {
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
        alert("?띿뒪???섏젙???ㅽ뙣?덉뒿?덈떎.");
      }
    } catch (err) {
      alert("?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    } finally {
      setIsSaving(false);
    }
  };

  // ?뼹截??대?吏 寃쎈줈 ?꾩슦誘??⑥닔 (http濡??쒖옉?섎㈃ 洹몃?濡? ?꾨땲硫?/images/ 異붽?)
  const getImageUrl = (path: string) => {
    if (!path) return "/images/background1.png";
    if (path.startsWith("http")) return path;

    // ?대? images/ ??/images/ 媛 ?ы븿?섏뼱 ?덈떎硫?以묐났 諛⑹?
    let cleanPath = path;
    if (cleanPath.startsWith("/images/")) cleanPath = cleanPath.replace("/images/", "");
    if (cleanPath.startsWith("images/")) cleanPath = cleanPath.replace("images/", "");

    return `${IMG_BASE}${cleanPath}?v=${V_NUM}`;
  };

  // 遺꾨쪟(移댄뀒怨좊━) ?섏젙 ???  const updateCategory = async (newCategory: string) => {
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
        // ?깃났 ???섏씠吏 ?덈줈怨좎묠?섏뿬 諛섏쁺
        window.location.reload();
      } else {
        alert("遺꾨쪟 ?섏젙???ㅽ뙣?덉뒿?덈떎.");
      }
    } catch (err) {
      alert("?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    } finally {
      setIsSaving(false);
    }
  };

  // 濡쒓렇?꾩썐
  const handleLogout = () => {
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsAdmin(false);
    setIsMenuOpen(false);
    window.location.reload(); // 利됱떆 ?덈줈怨좎묠?섏뿬 ?곹깭 諛섏쁺
  };

  // ?넅 湲곗〈 ?대? Card 而댄룷?뚰듃??/src/components/Card.tsx濡?遺꾨━?섏뿀?듬땲??

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
            <span>?꾩껜蹂닿린</span>
            <span className="group-hover:translate-x-1 transition-transform">??/span>
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
      {/* ?뼹截?珥덇퀬湲??뚯뒪???ㅻ줈??洹몃씪?곗씠??諛곌꼍 (?좊겮 ?대?吏 ?곴뎄 ?쒓굅) */}
      <div className="fixed inset-0 z-[-1] bg-gradient-to-tr from-[#f3f4ff] via-[#fdfbf7] to-[#fff6f0] pointer-events-none" />
      {/* ?뚮줈??諛곌꼍 ?붿냼 (諛곌꼍 ?대?吏? 議고솕濡?쾶 ?댁슦?ъ쭚) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-200/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-200/20 blur-[120px] rounded-full" />
      </div>

      {/* ?룼 硫붾돱 踰꾪듉 (?곷떒 諛??놁씠 ?⑤룆?쇰줈 ?뚮줈?? */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 left-5 z-[60] bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 lg:px-8 lg:py-4 rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
      >
        <span className="text-xl lg:text-2xl font-extrabold text-gray-800 font-[family-name:var(--font-baloo-2)] tracking-wider group-hover:text-blue-600 transition-colors">MENU</span>
      </button>

      {/* ?? ?곗륫 ?곷떒 移댄뀒怨좊━/?뱀뀡 諛붾줈媛湲??쒕∼?ㅼ슫 */}
      <div className="fixed top-6 right-5 z-[60] flex flex-col items-end">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 lg:px-8 lg:py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group cursor-pointer"
        >
          <span className="text-sm lg:text-base font-black text-gray-800 tracking-wider group-hover:text-blue-600 transition-colors">?대룞?섍린</span>
          <span className={`text-xs lg:text-sm text-gray-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-blue-600" : ""}`}>??/span>
        </button>

        {/* ?쒕∼?ㅼ슫 硫붾돱 ?꾩씠??由ъ뒪??*/}
        {isDropdownOpen && (
          <div className="mt-3.5 bg-white/95 backdrop-blur-xl border border-gray-100/80 rounded-[28px] p-4 lg:p-5 shadow-2xl w-56 lg:w-64 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-3 duration-250 z-[70] origin-top-right">
            <div className="text-[10px] text-gray-400 font-black px-3.5 pb-2 border-b border-gray-50 uppercase tracking-widest">?ㅼ떆媛?諛붾줈媛湲?/div>
            {[
              { id: "??, label: "?룧 硫붿씤 ?? },
              { id: "吏?먭툑", label: "?뮥 吏?먭툑 ?쒗깮" },
              { id: "吏??뻾??, label: "?럦 吏??異뺤젣/?됱궗" },
              { id: "?앺솢?뺣낫", label: "?숋툘 ?앺솢 ?뺣낫" },
              { id: "?꾩꽌?뺣낫", label: "?뱴 ?ъ꽌 異붿쿇 ?꾩꽌" },
              { id: "?멸퀎 寃쎌젣", label: "?뱤 ?멸퀎 寃쎌젣 ?몃젋?? },
              { id: "吏諛⑹꽑嫄?, label: "?뿳截?吏諛⑹꽑嫄?D-Day" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (item.id === "吏諛⑹꽑嫄? || item.id === "?멸퀎 寃쎌젣" || item.id === "?꾩꽌?뺣낫" || item.id === "吏?먭툑") {
                    setActiveTab(item.id as any);
                    window.history.pushState({}, '', `/?tab=${item.id}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (item.id === "??) {
                    setActiveTab("??);
                    window.history.pushState({}, '', '/');
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    setActiveTab("??);
                    window.history.pushState({}, '', '/');
                    setTimeout(() => {
                      const el = document.getElementById('gas-widget-section');
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs lg:text-sm font-black transition-all flex items-center justify-between hover:bg-blue-50/50 hover:text-blue-600 hover:translate-x-1 ${activeTab === item.id ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
              >
                <span>{item.label}</span>
                {activeTab === item.id && <span className="text-[10px] text-blue-500">??/span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="relative z-10 max-w-[1600px] mx-auto px-5 lg:px-10 pt-24 lg:pt-8 transition-all duration-500">

        {/* ?뜳 珥덇컧媛?踰ㅽ넗 洹몃━??Bento Grid) ????쒕낫??(?뚯뒪??湲?섏뒪紐⑦뵾利??ㅽ궓) */}
        <div className="mb-12 w-full bg-white/40 backdrop-blur-xl border border-white/70 shadow-2xl shadow-gray-200/30 rounded-[32px] lg:rounded-[48px] p-6 lg:p-10 relative overflow-hidden transition-all duration-500">
          
          {/* ?곗＜?곸씤 遺?쒕윭???ㅻ줈??愿묒썝 議곕챸 ?④낵 */}
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-300/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-300/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            
            {/* 1. [硫붿씤 ?명듃濡?移대뱶] (媛濡?2, ?몃줈 2) */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#EBF1FF]/90 via-[#F3F6FF]/60 to-white/95 border border-white/95 text-gray-900 rounded-[28px] lg:rounded-[36px] p-8 lg:p-12 flex flex-col justify-between min-h-[340px] lg:min-h-[440px] shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-widest">LUMI GUIDE</span>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest opacity-60">Smart Portal</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tighter mb-5">
                  ?⑹씤 ?앺솢????br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">?ㅻ쭏?명븯怨??뚯감寃?</span>
                </h1>
                <p className="text-sm lg:text-lg text-gray-500 font-bold leading-relaxed max-w-md">
                  ?ㅼ떆媛??쒗깮 ?뚯떇遺???④꺼吏??앺솢 鍮꾧껐源뚯?,<br />
                  媛???묐삊?섍퀬 ?좊ː?????덈뒗 ?뺣낫瑜??쒓났?⑸땲??
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => router.push("/blog")}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  釉붾줈洹??뚯떇 <span>??/span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("?멸퀎 寃쎌젣");
                    window.history.pushState({}, '', '/?tab=?멸퀎 寃쎌젣');
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-sm font-black border border-gray-200 shadow-sm hover:scale-105 transition-all flex items-center gap-2"
                >
                  ?멸퀎 寃쎌젣 <span>?뱤</span>
                </button>
              </div>
            </div>

            {/* 2. [吏諛⑹꽑嫄?D-Day 移대뱶] (媛濡?1, ?몃줈 2) */}
            <div 
              onClick={() => {
                setActiveTab("吏諛⑹꽑嫄?);
                window.history.pushState({}, '', '/?tab=吏諛⑹꽑嫄?);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-gradient-to-br from-[#FFF0F5]/90 via-[#FFF5F8]/60 to-white/95 border border-white/95 text-gray-900 rounded-[28px] lg:rounded-[36px] p-6 lg:p-8 flex flex-col justify-between min-h-[220px] lg:min-h-[440px] shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all"
            >
              <div>
                <span className="bg-pink-100 text-pink-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Election D-Day
                </span>
                <div className="mt-8 flex items-baseline gap-1">
                  <span className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 tracking-tighter">
                    {getElectionDDay()}
                  </span>
                </div>
                <h3 className="text-lg lg:text-xl font-black text-gray-800 mt-4 leading-tight">
                  ????吏諛⑹꽑嫄?br />?ㅼ떆媛??숉뼢 ?붿빟
                </h3>
              </div>
              <div className="pt-6 border-t border-pink-100 text-xs font-black text-pink-600 flex items-center justify-between mt-8">
                <span>?꾩슜 ?댁뒪猷?諛붾줈媛湲?/span>
                <span>??/span>
              </div>
            </div>

            {/* 3. [?ㅻ뒛??二쇱쑀??媛꾪렪 移대뱶] (媛濡?1, ?몃줈 1) */}
            <div 
              onClick={() => {
                const element = document.getElementById('gas-widget-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-br from-[#E6F8F9]/90 to-white/95 border border-white/90 text-gray-900 rounded-[28px] lg:rounded-[36px] p-6 shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <span className="bg-cyan-50 text-cyan-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Live ?좉?
                </span>
                <h3 className="text-base lg:text-lg font-black text-gray-800 mt-4 leading-tight">
                  ???ㅻ뒛??理쒖?媛 二쇱쑀??                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed">
                  ?⑹씤 ?섏?/湲고씎/泥섏씤援ъ뿉??媛????댄븳 二쇱쑀?뚮? ?뺤씤?섏꽭??
                </p>
              </div>
              <div className="text-xs font-black text-cyan-600 flex items-center justify-between">
                <span>?ㅼ떆媛?媛寃⑺몴 ?뺤씤</span>
                <span>??/span>
              </div>
            </div>

            {/* 4. [?ㅼ깮??轅??移대뱶] (媛濡?1, ?몃줈 1) */}
            <div 
              onClick={() => router.push("/tips")}
              className="bg-gradient-to-br from-[#EAF8F2]/90 to-white/95 border border-white/90 text-gray-900 rounded-[28px] lg:rounded-[36px] p-6 shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Life Tips
                </span>
                <h3 className="text-base lg:text-lg font-black text-gray-800 mt-4 leading-tight">
                  ?뮕 ?띠쓣 ?몃━?섍쾶 留뚮뱶??鍮꾧껐
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed">
                  ?붽릿?섍쾶 ?⑤㉨???대┝ 轅?곴낵 異붿쿇 ?꾩씠??紐⑥쓬吏?
                </p>
              </div>
              <div className="text-xs font-black text-emerald-600 flex items-center justify-between">
                <span>轅???쇰뱶 諛붾줈媛湲?/span>
                <span>??/span>
              </div>
            </div>

            {/* 5. [?ъ꽌 異붿쿇 ?꾩꽌 移대뱶] (媛濡?1, ?몃줈 1) */}
            <div 
              onClick={() => {
                setActiveTab("?꾩꽌?뺣낫");
                window.history.pushState({}, '', '/?tab=?꾩꽌?뺣낫');
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-gradient-to-br from-[#FDF3E7]/90 to-white/95 border border-white/90 text-gray-900 rounded-[28px] lg:rounded-[36px] p-6 shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Book Club
                </span>
                <h3 className="text-base lg:text-lg font-black text-gray-800 mt-4 leading-tight">
                  ?뱴 ?⑹씤???ъ꽌 異붿쿇 ?꾩꽌
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed">
                  ?대쾲 ???ъ꽌?ㅼ씠 ?꾩꽑??異붿쿇 ?꾩꽌 ?뺣낫瑜?留뚮굹蹂댁꽭??
                </p>
              </div>
              <div className="text-xs font-black text-amber-600 flex items-center justify-between">
                <span>異붿쿇 ?꾩꽌 蹂닿린</span>
                <span>??/span>
              </div>
            </div>

            {/* 6. [?멸퀎 寃쎌젣 釉뚮━??移대뱶] (媛濡?1, ?몃줈 1) */}
            <div 
              onClick={() => {
                setActiveTab("?멸퀎 寃쎌젣");
                window.history.pushState({}, '', '/?tab=?멸퀎 寃쎌젣');
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-gradient-to-br from-[#F5EFFE]/90 to-white/95 border border-white/90 text-gray-900 rounded-[28px] lg:rounded-[36px] p-6 shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <span className="bg-purple-50 text-purple-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Economy
                </span>
                <h3 className="text-base lg:text-lg font-black text-gray-800 mt-4 leading-tight">
                  ?뱤 湲濡쒕쾶 寃쎌젣 ?몃젋???붿빟
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed">
                  二쇱슂 諛섎룄泥? ?섏쑉, ?명뵆?덉씠?????듭떖 寃쎌젣 ?숉뼢 釉뚮━??
                </p>
              </div>
              <div className="text-xs font-black text-purple-600 flex items-center justify-between">
                <span>湲濡쒕쾶 釉뚮━??蹂닿린</span>
                <span>??/span>
              </div>
            </div>

          </div>

          {/* [?섎떒] 5? ?듭떖 硫붾돱 - 諛섏쓳??理쒖쟻??(?섎┝ 諛⑹?) */}
          <div className="relative z-10 hidden lg:flex items-center justify-center mt-12 w-full px-4">
            <div className="flex flex-nowrap items-center justify-center gap-2 xl:gap-5 bg-white/60 backdrop-blur-md px-4 xl:px-8 py-4 xl:py-6 rounded-full border border-white/50 shadow-xl min-w-fit overflow-x-auto no-scrollbar">
              {[
                { id: "??, label: "??, img: "icon-home.png" },
                { id: "吏?먭툑", label: "吏?먭툑 ?쒗깮", img: "icon-grant.png" },
                { id: "吏??뻾??, label: "吏??뻾??, img: "icon-event.png" },
                { id: "?앺솢?뺣낫", label: "?앺솢 ?뺣낫", img: "icon-info.png" },
                { id: "?꾩꽌?뺣낫", label: "?꾩꽌 ?뚯떇", img: "icon-book.png" },
                { id: "?멸퀎 寃쎌젣", label: "?멸퀎 寃쎌젣", img: "icon-world.png" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "??) {
                      setActiveTab("??);
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

        {/* ?썚截?[湲닿툒 蹂듦뎄] 荑좏뙜 ?뚰듃?덉뒪 愿묎퀬 諛곕꼫 (理쒖긽???몄텧) */}
        <div className="mb-12 max-w-7xl mx-auto w-full px-5 lg:px-0 relative z-20">
          <CoupangDynamicBanner />
        </div>

        {activeTab === "?? && (
          <>
            {/* ?ㅼ떆媛?二쇱쑀???꾩젽 (怨좎젙 理쒖긽?? */}
            <GasPriceWidget />

            {/* ?뱀뀡??*/}
            <Section
              title="理쒖떊 ?뺣낫"
              icon={IMG_BASE + "icon-new.png?v=" + V_NUM}
              cards={latestCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => {
                setActiveTab("釉붾줈洹?);
                setActiveBlogCat("?꾩껜");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* ??猷⑤????앺솢 ?? ?꾩슜 ?뱀뀡 (?쒖꽌 蹂寃? */}
            <div className="mt-16 mb-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100 overflow-hidden">
                    <img
                      src={IMG_BASE + "icon-ggul.png?v=" + V_NUM}
                      alt="轅???꾩씠肄?
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">猷⑤????ㅼ깮??轅??</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">?띠씠 ?몃━?댁????묒? 鍮꾧껐?ㅼ쓣 紐⑥븯?댁슂.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/tips")}
                  className="bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all font-black text-gray-800 text-sm flex items-center gap-2 group"
                >
                  <span>?꾩껜蹂닿린</span>
                  <span className="group-hover:translate-x-1 transition-transform">??/span>
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
                          ?벝 ?대?吏 ?섏젙
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
                      <div className="text-[10px] text-gray-400 font-black mb-3 ml-1 uppercase tracking-widest">猷⑤???異붿쿇 ?꾩씠??/div>
                      <a
                        href={tip.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-gray-50 hover:bg-yellow-400 p-4 rounded-2xl transition-all group/btn"
                      >
                        <span className="text-xs font-black text-gray-700 group-hover/btn:text-gray-900">{tip.productName}</span>
                        <span className="text-lg group-hover/btn:translate-x-1 transition-transform">?썟</span>
                      </a>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* ??留덇컧?꾨컯 ?꾩슜 ?뱀뀡 (?좎꽕) */}
            {impendingCards.length > 0 && (
              <Section
                title="留덇컧?꾨컯! ?볦튂吏 留덉꽭??
                icon={IMG_BASE + "icon-clock.png?v=" + V_NUM}
                cards={impendingCards}
                isCarousel={true}
                onCardClick={setSelectedCard}
                onMoreClick={() => {
                  setActiveTab("釉붾줈洹?);
                  setActiveBlogCat("?꾩껜");
                  window.history.pushState({}, '', '/?tab=釉붾줈洹?);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}

            <Section
              title="?볦튂硫??꾧퉴??吏?먭툑"
              icon={IMG_BASE + "icon-grant.png?v=" + V_NUM}
              cards={grantCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("吏?먭툑")}
            />

            <Section
              title="利먭굅??吏???됱궗"
              icon={IMG_BASE + "icon-event.png?v=" + V_NUM}
              cards={eventCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("吏??뻾??)}
            />

            <Section
              title="?좎씡???앺솢 ?뺣낫"
              icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
              cards={infoCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => setActiveTab("?앺솢?뺣낫")}
            />

            <Section
              title="吏?쒓? ?볦씠???꾩꽌 異붿쿇"
              icon={IMG_BASE + "icon-book.png?v=" + V_NUM}
              cards={bookCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => {
                setActiveTab("釉붾줈洹?);
                setActiveBlogCat("?꾩꽌?뺣낫");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            
            <Section
              title="湲濡쒕쾶 ?몃젋?? ?멸퀎 寃쎌젣"
              icon={IMG_BASE + "icon-world.png?v=" + V_NUM}
              cards={worldCards}
              isCarousel={true}
              onCardClick={setSelectedCard}
              onMoreClick={() => {
                setActiveTab("?멸퀎 寃쎌젣");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}

        {activeTab !== "?? && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-10 text-center pt-10">
              <h1 className="text-4xl font-[900] text-gray-900 mb-2 tracking-tight">{activeTab}</h1>
              <p className="text-sm text-gray-400 font-bold">?곸꽭 ?뺣낫瑜??뺤씤??蹂댁꽭??</p>
            </div>

            {/* 釉붾줈洹???씤 寃쎌슦 ?곷떒 移댄뀒怨좊━ ?꾪꽣 */}
            {activeTab === "釉붾줈洹? && (
              <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
                {["?꾩껜", "吏?먭툑", "吏??뻾??, "?앺솢?뺣낫", "?꾩꽌?뺣낫", "?멸퀎 寃쎌젣"].map((cat) => (
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
              {(activeTab === "釉붾줈洹? ? filteredPosts : allCards.filter(c => {
                const catMap: Record<string, string> = {
                  "吏?먭툑": "grant",
                  "吏??뻾??: "event",
                  "?앺솢?뺣낫": "info",
                  "?꾩꽌?뺣낫": "book",
                  "?멸퀎 寃쎌젣": "world",
                  "吏諛⑹꽑嫄?: "election"
                };
                const korCatMap: Record<string, string> = {
                  "吏?먭툑": "吏?먭툑",
                  "吏??뻾??: "吏??뻾??,
                  "?앺솢?뺣낫": "?앺솢?뺣낫",
                  "?꾩꽌?뺣낫": "?꾩꽌?뺣낫",
                  "?멸퀎 寃쎌젣": "?멸퀎 寃쎌젣",
                  "吏諛⑹꽑嫄?: "吏諛⑹꽑嫄?
                };
                const match = c.category === catMap[activeTab] || c.category === korCatMap[activeTab] ||
                  (activeTab === "吏??뻾?? && (c.category === "?됱궗" || c.category === "吏??뻾??));
                return match;
              }).sort((a, b) => {
                const aEnded = a.title.includes("[醫낅즺]");
                const bEnded = b.title.includes("[醫낅즺]");
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
                    // 釉붾줈洹???씠嫄곕굹 移대뱶??slug媛 ?덈뒗 寃쎌슦 ?곸꽭 ?섏씠吏濡?吏곸젒 ?대룞
                    if ((activeTab === "釉붾줈洹? || activeTab === "??) && card.slug) {
                      router.push(`/blog/${card.slug}`);
                    } else {
                      setSelectedCard(card);
                    }
                  }}
                  href={(activeTab === "釉붾줈洹? || activeTab === "??) && card.slug ? `/blog/${card.slug}` : undefined}
                />
              ))}
            </div>
          </div>
        )}
        {/* ?썚截????붾㈃ ?섎떒 荑좏뙜 ?뚰듃?덉뒪 ?ㅼ씠?섎? 諛곕꼫 */}
        <div className="mt-24 max-w-7xl mx-auto px-5 lg:px-0">
          <CoupangDynamicBanner />
        </div>
      </main>

      {/* 移대뱶 ?곸꽭 ?앹뾽 */}
      {selectedCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-5 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedCard(null)} />
          <div
            className="bg-white w-full max-w-4xl h-[90vh] lg:h-[85vh] rounded-[40px] lg:rounded-[60px] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 relative custom-scrollbar flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* ?곷떒 ?대?吏 ?곸뿭 (?댁젣 蹂몃Ц怨??④퍡 ?ㅽ겕濡ㅻ맖) */}
            <div className="w-full relative flex-shrink-0">
              <img
                src={selectedCard.image?.startsWith("http") ? selectedCard.image : (IMG_BASE + (selectedCard.image || "thumb-default.png") + "?v=" + V_NUM)}
                alt={selectedCard.title}
                className="w-full h-auto min-h-[300px] lg:min-h-[500px] object-cover"
              />
              {/* ?リ린 踰꾪듉 (?곷떒 ?대?吏 ?꾩뿉 ?곗븘?섍쾶 諛곗튂) */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-8 right-8 z-[80] w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 shadow-2xl border border-white hover:scale-110 transition-all text-3xl font-black pointer-events-auto"
              >
                ??              </button>
              <div className="absolute top-8 left-8">
                {renderTags(selectedCard.category)}
              </div>
            </div>
            {/* ?섎떒 蹂몃Ц ?곸뿭 (?대?吏 ?꾨옒??諛붾줈 ?댁뼱吏? */}
            <div className="p-10 lg:p-20">
              <h2 className="text-2xl font-[900] text-gray-900 mb-4 leading-tight">{selectedCard.title}</h2>

              {/* 愿由ъ옄 ?섏젙 踰꾪듉 (ID??Slug媛 ?덉쑝硫??몄텧) */}
              {isAdmin && (selectedCard.slug || selectedCard.id) && (
                <div className="mb-6 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={startTextEdit}
                      className="flex-1 py-3 bg-gray-800 text-white rounded-xl text-xs font-black hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      ?뱷 蹂몃Ц ?섏젙
                    </button>
                    <button
                      onClick={(e) => startImageEdit(e, selectedCard)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      ?벝 ?대?吏 ?섏젙
                    </button>
                    <button
                      onClick={deletePost}
                      disabled={isSaving}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100"
                    >
                      ?뿊截???젣
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 px-2">遺꾨쪟 ?대룞:</span>
                    {["吏?먭툑", "吏??뻾??, "?앺솢?뺣낫"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateCategory(cat)}
                        disabled={isSaving}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${selectedCard.category === cat ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        {cat === "吏??뻾?? ? "?됱궗" : cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-8 text-[11px] font-bold text-gray-400">
                <span className="flex items-center gap-1.5">?뱟 {selectedCard.date}</span>
                <span className="flex items-center gap-1.5">?뱧 {selectedCard.region || "?⑹씤"}</span>
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
                            <span>?벝</span> 蹂몃Ц ?ъ쭊 ?섏젙
                          </button>
                        )}
                      </span>
                    )
                  }}
                >
                  {selectedCard.content || selectedCard.detail || selectedCard.summary}
                </ReactMarkdown>
              </div>

              {/* ?썚截?荑좏뙜 ?뚰듃?덉뒪 ?ㅼ씠?섎? 諛곕꼫 (?곸꽭 ?앹뾽?? */}
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
                    ?곸꽭?뺣낫 ?뺤씤?섍린
                  </button>
                )}
                {selectedCard.link && (
                  <a
                    href={selectedCard.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl text-sm font-[900] text-center shadow-lg shadow-orange-100 hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    ?덊럹?댁? 諛붾줈媛湲?                  </a>
                )}
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-8 bg-gray-100 text-gray-500 py-4 rounded-2xl text-sm font-[900] hover:bg-gray-200 transition-all"
                >
                  ?リ린
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 2. ?ъ씠?쒕컮 ?쒕줈??(釉붾줈洹??ㅽ????댁떇) */}
      <aside className={`fixed left-0 top-0 bottom-0 w-[300px] lg:w-[420px] bg-white/95 backdrop-blur-2xl border-r border-gray-100 z-[110] flex flex-col p-8 lg:p-12 shadow-2xl transition-transform duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex items-center justify-between mb-8 lg:mb-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-14 h-14">
              <img src={IMG_BASE + "icon-menu-rabbit.png?v=" + V_NUM} alt="Menu Icon" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl lg:text-3xl font-black text-[#111111]">硫붾돱</h1>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-4xl lg:text-5xl text-gray-300 hover:text-gray-800">횞</button>
        </div>

        <nav className="flex flex-col gap-3 lg:gap-6 overflow-y-auto no-scrollbar">
          <MenuLink
            onClick={() => {
              setActiveTab("??);
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-home.png?v=" + V_NUM}
            label="??
            active={activeTab === "??}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("吏?먭툑");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=吏?먭툑');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-grant.png?v=" + V_NUM}
            label="吏?먭툑"
            active={activeTab === "吏?먭툑"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("吏??뻾??);
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=吏??뻾??);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-event.png?v=" + V_NUM}
            label="吏??뻾??
            active={activeTab === "吏??뻾??}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("?앺솢?뺣낫");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=?앺솢?뺣낫');
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
            label="?앺솢?뺣낫"
            active={activeTab === "?앺솢?뺣낫"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("釉붾줈洹?);
              setActiveBlogCat("?꾩꽌?뺣낫");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=釉붾줈洹?);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-book.png?v=" + V_NUM}
            label="?꾩꽌?뺣낫"
            active={activeTab === "釉붾줈洹? && activeBlogCat === "?꾩꽌?뺣낫"}
          />
          <MenuLink
            onClick={() => {
              setActiveTab("釉붾줈洹?);
              setActiveBlogCat("?꾩껜");
              setIsMenuOpen(false);
              window.history.pushState({}, '', '/?tab=釉붾줈洹?);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            icon={IMG_BASE + "icon-blog.png?v=" + V_NUM}
            label="釉붾줈洹?
            active={activeTab === "釉붾줈洹? && activeBlogCat === "?꾩껜"}
          />
          <MenuLink
            onClick={() => {
              setIsMenuOpen(false);
              router.push("/tips");
            }}
            icon={IMG_BASE + "icon-ggul.png?v=" + V_NUM}
            label="?ㅼ깮??轅??
            active={false}
          />

          <div className="h-px bg-gray-100 my-2" />

          {isAdmin ? (
            <MenuLink
              onClick={handleLogout}
              icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
              label="愿由ъ옄 濡쒓렇?꾩썐"
              active={false}
            />
          ) : (
            <MenuLink
              onClick={() => { window.location.href = "/admin"; setIsMenuOpen(false); }}
              icon={IMG_BASE + "icon-info.png?v=" + V_NUM}
              label="愿由ъ옄 濡쒓렇??
              active={false}
            />
          )}
        </nav>

      </aside>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[105]" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* ?곗륫 ?섎떒 ?뚮줈??踰꾪듉 */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => {
            setActiveTab("??);
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
          <span className="text-white text-lg group-hover:-translate-y-1 transition-transform">??/span>
          <span className="text-[7px] font-black text-white">TOP</span>
        </button>
      </div>

      {/* ?대?吏 ?섏젙 ?앹뾽 (愿由ъ옄 ?꾩슜) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !isSaving && setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-white">
            <div className="text-center mb-8">
              <div className="text-3xl mb-3">?벝</div>
              <h2 className="text-2xl font-black text-gray-900">?대?吏 二쇱냼 ?섏젙</h2>
              <p className="text-gray-400 text-sm mt-1">寃뚯떆湲??????대?吏瑜?蹂寃쏀빀?덈떎.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Image URL</label>
                <textarea
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm min-h-[100px]"
                  placeholder="https://... ?대?吏 二쇱냼瑜??낅젰?섏꽭??
                  disabled={isSaving}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  痍⑥냼
                </button>
                <button
                  onClick={saveImageChanges}
                  disabled={isSaving}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ???以?..
                    </>
                  ) : "??ν븯湲?}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ?띿뒪???섏젙 ?앹뾽 (愿由ъ옄 ?꾩슜) */}
      {isTextEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !isSaving && setIsTextEditModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-white flex flex-col max-h-[90vh]">
            <div className="text-center mb-8 flex-shrink-0">
              <div className="text-3xl mb-3">?뱷</div>
              <h2 className="text-2xl font-black text-gray-900">蹂몃Ц ?댁슜 ?섏젙</h2>
              <p className="text-gray-400 text-sm mt-1">寃뚯떆湲???꾩껜 ?띿뒪???댁슜???먯쑀濡?쾶 ?섏젙?섏꽭??</p>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col gap-6">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="flex-1 w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm resize-none custom-scrollbar"
                placeholder="留덊겕?ㅼ슫 ?뺤떇?쇰줈 ?댁슜???낅젰?섏꽭??.."
                disabled={isSaving}
              />

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setIsTextEditModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  痍⑥냼
                </button>
                <button
                  onClick={saveTextChanges}
                  disabled={isSaving}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ???以?..
                    </>
                  ) : "蹂몃Ц ?댁슜 ??ν븯湲?}
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
