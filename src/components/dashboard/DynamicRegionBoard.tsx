"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Eye, Hotel, Utensils, Footprints, ArrowRight, MapPin } from "lucide-react";

interface TourItem {
  title: string;
  addr1: string;
  firstimage: string;
  mapx: string;
  mapy: string;
  contentid: string;
}

export default function DynamicRegionBoard({ areaCode, sigunguCode, regionName }: { areaCode: string, sigunguCode: string, regionName: string }) {
  const [attractions, setAttractions] = useState<TourItem[]>([]);
  const [accommodations, setAccommodations] = useState<TourItem[]>([]);
  const [eats, setEats] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!areaCode || !sigunguCode) return;
    
    setLoading(true);
    
    const API_KEY = process.env.NEXT_PUBLIC_TOUR_API_KEY || "92a89b899c53464e7bc2822b70cbb04236e5c27972e09adabe807f8acd77e6cf";
    const baseUrl = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=15&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&arrange=O&areaCode=${areaCode}&sigunguCode=${sigunguCode}`;

    Promise.all([
      fetch(`${baseUrl}&contentTypeId=12`).then(r => r.json()),
      fetch(`${baseUrl}&contentTypeId=32`).then(r => r.json()),
      fetch(`${baseUrl}&contentTypeId=39`).then(r => r.json()),
    ]).then(([attrData, accomData, eatsData]) => {
      setAttractions(attrData.response?.body?.items?.item || []);
      setAccommodations(accomData.response?.body?.items?.item || []);
      setEats(eatsData.response?.body?.items?.item || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
    
  }, [areaCode, sigunguCode]);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500">[{regionName}] 지역의 숨은 명소와 맛집을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={regionName}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full mt-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* [Bento 1] 왼쪽 5열: 미니 약도 & 구 상세 가이드 소개글 */}
          <div className="lg:col-span-5 premium-glass p-8 rounded-[36px] flex flex-col justify-between shadow-lg border relative overflow-hidden group/bento bg-blue-50/30 dark:bg-blue-900/10 border-blue-500/20">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-blue-500 animate-spin-slow" />
                <span className="text-[12px] font-black tracking-wider uppercase text-gray-400 dark:text-gray-500">
                  지역 통합 가이드
                </span>
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                {regionName}
              </h3>
              <p className="text-[13px] font-black text-blue-500 dark:text-blue-400 mb-4 leading-snug">
                한국관광공사 추천 인증 명소 & 핫플레이스
              </p>
              
              <p className="text-xs text-gray-500 dark:text-gray-450 font-bold leading-relaxed mb-6">
                선택하신 {regionName} 지역의 대표적인 관광 명소, 안락한 숙소, 그리고 현지인들이 추천하는 로컬 맛집 정보입니다. 네이버 지도와 실시간 연동되어 곧바로 길 안내를 받을 수 있습니다.
              </p>
            </div>

            {/* 대표 썸네일 이미지 공간 */}
            <div className="w-full aspect-[16/10] rounded-2xl bg-white dark:bg-gray-850/80 border border-gray-150 dark:border-gray-800 flex items-center justify-center p-0 relative shadow-inner overflow-hidden flex-shrink-0">
               {attractions.length > 0 && attractions[0].firstimage ? (
                 <img src={attractions[0].firstimage} alt={regionName} className="w-full h-full object-cover opacity-90 group-hover/bento:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="flex flex-col items-center gap-2 text-gray-300">
                    <MapPin className="w-10 h-10" />
                    <span className="text-[10px] font-black">대표 이미지 준비중</span>
                 </div>
               )}
            </div>
          </div>

          {/* [Bento 2] 오른쪽 7열: 전체 명소 목록 칩 그리드 */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* [Bento 2-1] 위쪽: 전체 관광명소 */}
            <div className="md:col-span-2 premium-glass p-8 rounded-[36px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎡</span>
                  <h4 className="text-[14.5px] font-black text-gray-900 dark:text-white font-[family-name:var(--font-noto-serif-kr)]">
                    {regionName} 대표 관광 명소
                  </h4>
                </div>

                {/* 명소 칩 배치 */}
                <div className="flex flex-wrap gap-2.5 mb-2 mt-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                  {attractions.map((spot, idx) => (
                    <a
                      key={idx}
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(spot.addr1 + ' ' + spot.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white border border-gray-150 dark:border-slate-700 font-black text-[11px] flex items-center gap-2 shadow-sm transition-all text-left active:scale-[0.98] group"
                    >
                      <span>📍</span>
                      <div className="max-w-[150px]">
                        <span className="block truncate">{spot.title}</span>
                      </div>
                      <span className="ml-1 text-[9px] text-gray-450 group-hover:text-white flex items-center">
                        ↗
                      </span>
                    </a>
                  ))}
                  {attractions.length === 0 && <span className="text-xs text-gray-400">명소 정보가 없습니다.</span>}
                </div>
              </div>
            </div>

            {/* [Bento 2-2] 아래 좌측: 힐링 숙소 목록 */}
            <div className="premium-glass p-8 rounded-[36px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[280px]">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Hotel className="w-4.5 h-4.5 text-blue-500" />
                  <h4 className="text-[13.5px] font-black text-gray-800 dark:text-white">
                    🏡 추천 숙박시설
                  </h4>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                {accommodations.map((stay, idx) => (
                  <div key={idx} className="group/stay flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(stay.addr1 + ' ' + stay.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11.5px] font-black text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors flex items-center gap-0.5 group-hover/stay:translate-x-0.5"
                      >
                        <span className="truncate max-w-[140px]">{stay.title}</span>
                        <span className="text-[9px] text-gray-400 group-hover/stay:text-blue-500 font-bold flex-shrink-0">↗</span>
                      </a>
                    </div>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold leading-snug pl-1 truncate">
                      {stay.addr1}
                    </span>
                  </div>
                ))}
                {accommodations.length === 0 && <span className="text-xs text-gray-400">숙소 정보가 없습니다.</span>}
              </div>
            </div>

            {/* [Bento 2-3] 아래 우측: 찐 로컬 맛집 & 카페 목록 */}
            <div className="premium-glass p-8 rounded-[36px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[280px]">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4.5 h-4.5 text-orange-500" />
                  <h4 className="text-[13.5px] font-black text-gray-800 dark:text-white">
                    🍲 주변 로컬 맛집
                  </h4>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                {eats.map((eat, idx) => (
                  <div key={idx} className="group/eat flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(eat.addr1 + ' ' + eat.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11.5px] font-black text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 hover:underline transition-colors flex items-center gap-0.5 group-hover/eat:translate-x-0.5"
                      >
                        <span className="truncate max-w-[140px]">{eat.title}</span>
                        <span className="text-[9px] text-gray-400 group-hover/eat:text-orange-500 font-bold flex-shrink-0">↗</span>
                      </a>
                    </div>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold leading-snug pl-1 truncate">
                      {eat.addr1}
                    </span>
                  </div>
                ))}
                {eats.length === 0 && <span className="text-xs text-gray-400">맛집 정보가 없습니다.</span>}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
