"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, BookOpen, Gift, Map, Lightbulb } from "lucide-react";

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

interface BentoGridProps {
  eventCards: FeaturedCard[];
  onCardClick: (card: FeaturedCard) => void;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  onImageEdit: (e: React.MouseEvent, card: FeaturedCard) => void;
}

export default function BentoGrid({
  eventCards,
  onCardClick,
  setActiveTab,
  isAdmin,
  onImageEdit,
}: BentoGridProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.scrollWidth - sliderRef.current.offsetWidth);
    }
  }, [eventCards]);

  const IMG_BASE = "/images/";
  const V_NUM = "12";

  // 인기 여행지 데이터
  const popularPlaces = [
    { rank: "01", name: "에버랜드", desc: "봄바람 속 튤립축제와 짜릿한 스릴", img: "everland_roses_thumb.png" },
    { rank: "02", name: "한국민속촌", desc: "타임머신 타고 조선시대로 가는 가을여행", img: "gksrkd_01.png" },
    { rank: "03", name: "농촌테마파크", desc: "들꽃과 원두막이 숨 쉬는 가족 쉼터", img: "thumb-temple.png" },
    { rank: "04", name: "용인자연휴양림", desc: "짚라인과 패러글라이딩, 울창한 숲속 힐링", img: "thumb-rose.png" },
    { rank: "05", name: "경기도박물관", desc: "아이와 함께 떠나는 유익한 역사 탐험", img: "library_booktalk_thumb.png" },
  ];

  // 카테고리 퀵 가이드 카드
  const quickGuides = [
    {
      title: "맞춤 지원금",
      desc: "용인시민 전용 혜택 소식",
      icon: <Gift className="w-5 h-5 text-accent" />,
      tab: "지원금",
      color: "from-accent/20 to-accent-purple/10",
      textColor: "text-accent",
    },
    {
      title: "문화 / 행사",
      desc: "주말에 가볼만한 용인 축제",
      icon: <Map className="w-5 h-5 text-[#3B82F6]" />,
      tab: "지역행사",
      color: "from-blue-500/10 to-indigo-500/10",
      textColor: "text-blue-500",
    },
    {
      title: "실생활 정보",
      desc: "주유비 아끼는 오늘의 정보",
      icon: <Lightbulb className="w-5 h-5 text-emerald-500" />,
      tab: "용인시정보",
      color: "from-emerald-500/10 to-teal-500/10",
      textColor: "text-emerald-500",
    },
    {
      title: "추천 도서",
      desc: "도서관 신간 및 무료 강좌",
      icon: <BookOpen className="w-5 h-5 text-[#8B5CF6]" />,
      tab: "블로그",
      color: "from-purple-500/10 to-pink-500/10",
      textColor: "text-purple-500",
    },
  ];

  return (
    <section className="py-12 max-w-[1400px] mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
            용인 실시간 Bento 보드
          </h2>
          <p className="text-[12px] font-bold text-gray-400 dark:text-gray-500 mt-1">
            가장 중요한 핵심 정보만 골라 담은 요약판
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. 좌측 3열: 실시간 인기 여행지 TOP 5 */}
        <div className="lg:col-span-3 flex flex-col premium-glass p-6 rounded-[32px] justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-[#000000]/05 dark:border-[#FFFFFF]/05">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[14px] font-black text-[#0F172A] dark:text-white">실시간 인기 장소</span>
              <span className="text-[10px] font-black text-accent dark:text-accent-purple tracking-widest uppercase bg-accent/5 dark:bg-accent-purple/10 px-2 py-0.5 rounded-md">
                TOP 5
              </span>
            </div>

            <div className="space-y-4.5">
              {popularPlaces.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab("지역행사");
                    window.history.pushState({}, "", "/?tab=지역행사");
                  }}
                  className="flex items-center gap-3.5 cursor-pointer group/item hover:bg-gray-50 dark:hover:bg-gray-800/40 p-1.5 rounded-2xl transition-all"
                >
                  <span className="text-base font-black text-gray-300 dark:text-gray-600 group-hover/item:text-accent group-hover/item:scale-110 transition-all w-6 text-center">
                    {place.rank}
                  </span>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <img
                      src={IMG_BASE + place.img}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[12.5px] font-bold text-gray-800 dark:text-gray-200 group-hover/item:text-accent transition-colors truncate">
                      {place.name}
                    </span>
                    <span className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {place.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab("지역행사");
              window.history.pushState({}, "", "/?tab=지역행사");
            }}
            className="w-full mt-6 py-3 bg-gray-50 dark:bg-gray-800/40 hover:bg-accent hover:text-white dark:hover:bg-accent text-gray-600 dark:text-gray-300 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group/btn"
          >
            <span>더 많은 추천 명소 보기</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 2. 중앙 6열: 이번 주 지역 축제 및 행사 Custom Swipe Slider */}
        <div className="lg:col-span-6 premium-glass p-6 rounded-[32px] overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-[#0F172A] dark:text-white">이달의 추천 지역 행사</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-0.5">
                  드래그하거나 스와이프하여 넘겨보세요
                </span>
              </div>
              <span className="text-[11px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                이벤트 슬라이더
              </span>
            </div>

            {/* Framer Motion Touch/Drag Slider */}
            <div className="overflow-hidden cursor-grab active:cursor-grabbing py-2" ref={sliderRef}>
              <motion.div
                drag="x"
                dragConstraints={{ right: 0, left: -sliderWidth - 40 }}
                className="flex gap-4.5"
                style={{ width: "max-content" }}
              >
                {eventCards.map((event, idx) => (
                  <motion.div
                    key={idx}
                    onClick={() => onCardClick(event)}
                    className="w-[280px] bg-white dark:bg-gray-800/60 border border-gray-100/80 dark:border-gray-700/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow shrink-0 flex flex-col group select-none pointer-events-auto"
                  >
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-3 bg-gray-50 dark:bg-gray-900 relative group/img">
                      <img
                        src={event.image?.startsWith("http") ? event.image : IMG_BASE + (event.image || "thumb-default.png") + `?v=${V_NUM}`}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        draggable="false"
                      />
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageEdit(e, event);
                          }}
                          className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[9px] font-black hover:scale-105 active:scale-95 transition-all shadow-md z-25 opacity-0 group-hover/img:opacity-100"
                        >
                          📸 이미지 수정
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-accent bg-accent/5 px-2 py-0.5 rounded-full w-fit mb-2">
                      지역행사
                    </span>
                    <h4 className="text-[13px] font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">
                      {event.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-2 h-[32px] leading-snug">
                      {event.summary}
                    </p>
                    <div className="flex items-center justify-between text-[9.5px] font-bold text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700/30 pt-2.5 mt-3">
                      <span className="flex items-center gap-1">📅 {event.date}</span>
                      <span className="flex items-center gap-0.5">📍 {event.region || "용인"}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-4 border-t border-gray-100 dark:border-gray-700/30 pt-3">
            <span>👈 슬라이드하여 혜택 더 보기</span>
            <button
              onClick={() => {
                setActiveTab("지역행사");
                window.history.pushState({}, "", "/?tab=지역행사");
              }}
              className="text-accent dark:text-accent-purple hover:underline"
            >
              전체 일정 보기
            </button>
          </div>
        </div>

        {/* 3. 우측 3열: 카테고리 4분할 Bento Quick Guides */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {quickGuides.map((guide, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3, scale: 1.02 }}
              onClick={() => {
                setActiveTab(guide.tab);
                window.history.pushState({}, "", `/?tab=${guide.tab}`);
              }}
              className="premium-glass p-4.5 rounded-[24px] cursor-pointer flex flex-col justify-between h-[155px] hover:premium-glass-hover"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${guide.color} ${guide.textColor}`}>
                  {guide.icon}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-[13px] font-extrabold text-gray-800 dark:text-white leading-tight">
                  {guide.title}
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-1 leading-snug">
                  {guide.desc}
                </p>
              </div>
              <span className="text-[9.5px] font-black text-accent dark:text-accent-purple mt-2 flex items-center gap-1 group">
                바로가기 <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
