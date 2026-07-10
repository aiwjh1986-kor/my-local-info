"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

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

interface LatestNewsProps {
  grantCards: FeaturedCard[];
  eventCards: FeaturedCard[];
  infoCards: FeaturedCard[];
  bookCards: FeaturedCard[];
  worldCards: FeaturedCard[];
  onCardClick: (card: FeaturedCard) => void;
  isAdmin: boolean;
  onImageEdit: (e: React.MouseEvent, card: FeaturedCard) => void;
}

export default function LatestNews({
  grantCards,
  eventCards,
  infoCards,
  bookCards,
  worldCards,
  onCardClick,
  isAdmin,
  onImageEdit,
}: LatestNewsProps) {
  const IMG_BASE = "/images/";
  const V_NUM = "12";

  const categories = [
    { label: "지원금", card: grantCards[0], tagColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    { label: "지역행사", card: eventCards[0], tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "생활 정보", card: infoCards[0], tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "도서 소식", card: bookCards[0], tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { label: "세계 경제", card: worldCards[0], tagColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ];

  // 유효한 카드들만 선별 (등록된 카드가 있는 카테고리만 슬라이더에 노출)
  const validCategories = categories.filter((cat) => cat.card !== undefined);

  // 반응형 노출 카드 개수 상태
  const [visibleCount, setVisibleCount] = useState(3); // 데스크톱 3개 기본
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 화면 크기에 따른 슬라이드 노출 개수 조절
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3); // 데스크톱 (3개)
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2); // 태블릿 (2개)
      } else {
        setVisibleCount(1); // 모바일 (1개)
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, validCategories.length - visibleCount);

  // 자동 슬라이더 순환 로직 (3.5초 주기)
  useEffect(() => {
    if (isHovered || maxIndex === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0; // 처음으로 루프 돌기
        }
        return prev + 1;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, maxIndex, visibleCount]);

  // 좌우 버튼 제어
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-12 max-w-[1400px] mx-auto px-6 overflow-hidden">
      {/* 타이틀 및 네비게이션 제어부 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
            5대 분야 실시간 새소식
          </h2>
          <p className="text-[12px] font-bold text-gray-400 dark:text-gray-500 mt-1">
            각 분야별 가장 최신의 업데이트 정보를 골라 드립니다
          </p>
        </div>

        {/* 좌우 원형 premium-glass 버튼 */}
        {maxIndex > 0 && (
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full premium-glass hover:premium-glass-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer font-black text-sm"
              aria-label="이전 뉴스"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full premium-glass hover:premium-glass-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer font-black text-sm"
              aria-label="다음 뉴스"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* 슬라이더 뷰포트 (오버플로우 숨김 & 갭 패딩 보정) */}
      <div
        className="relative overflow-hidden -mx-3 px-3 py-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {validCategories.map((cat, idx) => {
            const card = cat.card;
            const cleanTitle = card.title.replace("[종료]", "");

            return (
              <div
                key={idx}
                className="px-3 shrink-0 transition-all duration-300"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <motion.div
                  onClick={() => onCardClick(card)}
                  className="bg-white/80 dark:bg-gray-850/65 border border-gray-150/60 dark:border-gray-800/60 rounded-[28px] overflow-hidden p-4 hover:shadow-[0_12px_36px_-6px_rgba(99,102,241,0.06)] hover:-translate-y-1 hover:border-accent/35 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[370px] relative group"
                >
                  <div>
                    {/* 썸네일 이미지 */}
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-50 dark:bg-gray-900 relative">
                      <img
                        src={
                          card.image?.startsWith("http")
                            ? card.image
                            : IMG_BASE + (card.image || "thumb-default.png") + `?v=${V_NUM}`
                        }
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageEdit(e, card);
                          }}
                          className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[9px] font-black hover:scale-105 active:scale-95 transition-all shadow-md z-25 opacity-0 group-hover:opacity-100"
                        >
                          📸 이미지 수정
                        </button>
                      )}
                    </div>

                    {/* 카테고리 태그 */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${cat.tagColor}`}>
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                        <span>NEW</span>
                      </div>
                    </div>

                    {/* 제목 */}
                    <h4 className="text-[13px] font-black text-gray-850 dark:text-gray-150 line-clamp-2 leading-snug group-hover:text-accent dark:group-hover:text-accent-purple transition-colors mb-2.5">
                      {cleanTitle}
                    </h4>

                    {/* 내용 요약 */}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold line-clamp-3 leading-relaxed">
                      {card.summary}
                    </p>
                  </div>

                  {/* 하단 메타 정보 */}
                  <div className="flex items-center justify-between text-[9.5px] font-bold text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 mt-4">
                    <span>📅 {card.date}</span>
                    <span className="text-accent dark:text-accent-purple flex items-center gap-0.5 font-extrabold group-hover:underline">
                      자세히 <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 도트 인디케이터 (Pagination dots) */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => {
            const isActive = currentIndex === dotIdx;
            return (
              <button
                key={dotIdx}
                onClick={() => handleDotClick(dotIdx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-8 bg-accent dark:bg-accent-purple shadow-sm"
                    : "w-2 bg-gray-250 dark:bg-gray-800 hover:bg-gray-450 dark:hover:bg-gray-700"
                }`}
                aria-label={`${dotIdx + 1}번 뉴스 슬라이드로 이동`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
