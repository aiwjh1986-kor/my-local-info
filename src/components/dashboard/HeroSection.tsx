"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Fuel, Compass, CloudSun, CalendarDays, TrendingUp } from "lucide-react";

interface GasResponse {
  suji: { name: string; price: number; brand: string; } | null;
  giheung: { name: string; price: number; brand: string; } | null;
  cheoin: { name: string; price: number; brand: string; } | null;
}

interface HeroSectionProps {
  gasPrices: GasResponse | null;
  visitorCount: number;
  setActiveTab: (tab: string) => void;
  onElectionClick?: () => void;
}



export default function HeroSection({
  gasPrices,
  visitorCount,
  setActiveTab,
  onElectionClick,
}: HeroSectionProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* 배경 장식 애니메이션 블롭 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-accent-purple/15 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 좌측 60%: 대형 타이포그래피 & 메인 메세지 */}
        <div className="lg:col-span-7 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent dark:bg-accent-purple/10 dark:text-accent-purple text-xs font-bold w-fit mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 최신 용인 맞춤형 정보 서비스</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[62px] font-black leading-[1.1] tracking-tight text-[#0F172A] dark:text-[#F1F5F9] mb-6"
          >
            Live. Learn.<br />
            <span className="bg-gradient-to-r from-accent via-[#8B5CF6] to-accent-purple bg-clip-text text-transparent">
              Yongin Guide
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#0F172A]/70 dark:text-[#F1F5F9]/70 text-base sm:text-lg font-medium mb-8 max-w-xl leading-relaxed"
          >
            용인시의 최신 지원금 소식부터 주간 축제 정보, 그리고 실생활을 더욱 윤택하게 해줄 꿀팁들까지 모두 한눈에 확인해 보세요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => {
                setActiveTab("지역행사");
                window.history.pushState({}, "", "/?tab=지역행사");
              }}
              className="px-7 py-4 bg-gradient-to-r from-accent to-accent-purple text-white rounded-2xl text-[13px] font-extrabold hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>행사 및 축제 안내</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("지원금");
                window.history.pushState({}, "", "/?tab=지원금");
              }}
              className="px-7 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl text-[13px] font-extrabold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all"
            >
              지원금 혜택 보러가기
            </button>
          </motion.div>
        </div>

        {/* 우측 50%: 4개 플로팅 Bento 위젯 카드 */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4 relative z-10">
          {/* Card 1: 날씨 & 실시간 시계 */}
          {/* Card 1: 날씨 & 오늘의 운세/명언 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="premium-glass p-5 rounded-[24px] col-span-2 grid grid-cols-2 gap-4 h-[180px] hover:premium-glass-hover hover:scale-[1.02] cursor-pointer"
          >
            {/* 좌측: 날씨 */}
            <div className="flex flex-col justify-between border-r border-gray-200/50 dark:border-gray-700/50 pr-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">실시간 용인 날씨</span>
                <CloudSun className="w-5 h-5 text-accent" />
              </div>
              <div className="flex flex-col mt-4">
                <span className="text-[32px] font-black text-gray-900 dark:text-white leading-none">21°C</span>
                <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300 mt-1">맑음 (미세먼지 보통)</span>
              </div>
              <div className="text-[10px] font-bold text-[#FF6B6B] dark:text-[#FF8787] mt-auto">
                🕒 {time || "오전 09:00"}
              </div>
            </div>

            {/* 우측: 오늘의 한 줄 */}
            <div className="flex flex-col justify-between pl-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">오늘의 한 줄</span>
                <span className="text-lg">🍀</span>
              </div>
              <div className="flex flex-col mt-2 mb-auto">
                <span className="text-[13px] font-black text-gray-800 dark:text-gray-200 leading-snug break-keep">
                  "시작이 반이다."
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-bold">
                  - 아리스토텔레스 -
                </span>
              </div>
              <div className="text-[10px] font-black text-accent-purple mt-auto">
                기분 좋은 하루 보내세요! ✨
              </div>
            </div>
          </motion.div>

          {/* Card 3: 실시간 최저가 주유소 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="premium-glass p-5 rounded-[24px] col-span-2 flex flex-col justify-between min-h-[160px] hover:premium-glass-hover hover:scale-[1.01] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-emerald-500" />
                <span className="text-[12px] font-black text-[#0F172A] dark:text-white">실시간 최저가 주유소</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Live
              </span>
            </div>

            {gasPrices ? (
              <div className="grid grid-cols-3 gap-3 my-4">
                {[
                  { district: "수지구", data: gasPrices.suji },
                  { district: "기흥구", data: gasPrices.giheung },
                  { district: "처인구", data: gasPrices.cheoin }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">{item.district}</span>
                    <span className="text-gray-700 dark:text-gray-300 text-[11px] font-bold truncate max-w-full">
                      {item.data?.name || "정보없음"}
                    </span>
                    <span className="text-accent dark:text-accent-purple text-lg font-black tracking-tight mt-0.5">
                      {item.data?.price?.toLocaleString() || "-"}원
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-xs font-bold my-4">주유소 가격 정보를 읽어오는 중입니다...</div>
            )}

            <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 font-bold border-t border-gray-150 dark:border-gray-700/30 pt-2.5">
              <span>* 한국석유공사 오피넷 제공</span>
              <span className="text-[#6C757D]">실시간 방문수: {visitorCount.toLocaleString()}명</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
