"use client";

import { useEffect, useRef } from "react";

interface CoupangBannerProps {
  id: number;
  trackingCode: string;
  width?: string;
  height?: string;
}

export default function CoupangDynamicBanner({ id, trackingCode, width = "100%", height = "170" }: CoupangBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjected = useRef(false);

  useEffect(() => {
    if (scriptInjected.current) return;

    const scriptId = "coupang-partners-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initBanner = () => {
      if (window.PartnersCoupang && containerRef.current) {
        // 컨테이너가 준비되었을 때만 실행
        try {
          containerRef.current.innerHTML = "";
          new window.PartnersCoupang.G({
            id: id,
            trackingCode: trackingCode,
            container: containerRef.current,
            width: width === "100%" ? containerRef.current.offsetWidth || 1000 : width,
            height: height,
            template: "carousel",
            subId: null
          });
        } catch (e) {
          console.error("Coupang banner init error:", e);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://ads-partners.coupang.com/g.js";
      script.async = true;
      script.onload = () => {
        setTimeout(initBanner, 100); // 스크립트 로드 후 아주 잠깐 대기 후 실행
      };
      document.head.appendChild(script);
    } else {
      if (window.PartnersCoupang) {
        setTimeout(initBanner, 100);
      } else {
        script.addEventListener("load", initBanner);
      }
    }

    scriptInjected.current = true;
  }, [id, trackingCode, width, height]);

  return (
    <div className="w-full flex flex-col items-center gap-4 overflow-hidden rounded-[30px] bg-white/40 backdrop-blur-sm p-6 border border-white/50 shadow-sm">
      <div 
        ref={containerRef} 
        className="coupang-banner-container w-full flex justify-center overflow-hidden"
        style={{ minHeight: `${height}px` }}
      >
        {/* 쿠팡 배너가 여기에 렌더링됩니다 */}
      </div>
      <div className="flex items-center gap-2 opacity-40">
        <div className="w-1 h-1 rounded-full bg-gray-400" />
        <p className="text-[9px] lg:text-[11px] font-bold text-gray-400 text-center uppercase tracking-tighter">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
        <div className="w-1 h-1 rounded-full bg-gray-400" />
      </div>
    </div>
  );
}

// 전역 윈도우 객체 타입 확장
declare global {
  interface Window {
    PartnersCoupang: any;
  }
}
