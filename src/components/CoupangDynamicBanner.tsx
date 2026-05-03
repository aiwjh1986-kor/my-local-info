"use client";

import { useEffect, useRef } from "react";

interface CoupangBannerProps {
  id: number;
  trackingCode: string;
  width?: string;
  height?: string;
}

export default function CoupangDynamicBanner({ id, trackingCode, width = "1000", height = "170" }: CoupangBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이미 스크립트가 로드되었는지 확인
    const scriptId = "coupang-partners-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initBanner = () => {
      if (window.PartnersCoupang && containerRef.current) {
        containerRef.current.innerHTML = ""; // 초기화
        new window.PartnersCoupang.G({
          id: id,
          trackingCode: trackingCode,
          container: containerRef.current,
          width: width,
          height: height,
          template: "carousel"
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://ads-partners.coupang.com/g.js";
      script.async = true;
      script.onload = initBanner;
      document.head.appendChild(script);
    } else {
      // 이미 로드된 경우 바로 초기화 시도
      if (window.PartnersCoupang) {
        initBanner();
      } else {
        script.addEventListener("load", initBanner);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener("load", initBanner);
      }
    };
  }, [id, trackingCode, width, height]);

  return (
    <div className="w-full flex flex-col items-center gap-4 overflow-hidden rounded-[20px] lg:rounded-[40px] bg-white/50 p-4">
      <div 
        ref={containerRef} 
        className="coupang-banner-container w-full flex justify-center"
        style={{ minHeight: `${height}px` }}
      >
        {/* 쿠팡 배너가 여기에 렌더링됩니다 */}
      </div>
      <p className="text-[10px] lg:text-xs text-gray-400 text-center opacity-60">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}

// 전역 윈도우 객체 타입 확장
declare global {
  interface Window {
    PartnersCoupang: any;
  }
}
