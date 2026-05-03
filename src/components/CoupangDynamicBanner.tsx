"use client";

import { useEffect, useRef } from "react";

export default function CoupangDynamicBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  // 고유 ID 생성 (여러 개가 동시에 뜰 때를 대비)
  const uniqueId = useRef(`coupang-banner-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const targetContainer = containerRef.current;
    targetContainer.innerHTML = "";

    // 1단계: 쿠팡 파트너스 스크립트(g.js) 로드
    const gScript = document.createElement("script");
    gScript.src = "https://ads-partners.coupang.com/g.js";
    gScript.async = true;
    targetContainer.appendChild(gScript);

    // 2단계: g.js 로드 완료 후 배너 초기화 (정확한 container ID 지정)
    gScript.onload = () => {
      const initScript = document.createElement("script");
      initScript.textContent = `
        new PartnersCoupang.G({
          "id": 985786,
          "trackingCode": "AF1183921",
          "subId": null,
          "template": "carousel",
          "width": "1000",
          "height": "170",
          "container": "${uniqueId.current}"
        });
      `;
      targetContainer.appendChild(initScript);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3 overflow-hidden rounded-[30px] bg-white/40 backdrop-blur-sm p-6 border border-white/50 shadow-sm">
      <div
        id={uniqueId.current}
        ref={containerRef}
        className="w-full flex justify-center overflow-hidden"
        style={{ minHeight: "170px" }}
      />
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

declare global {
  interface Window {
    PartnersCoupang: any;
  }
}
