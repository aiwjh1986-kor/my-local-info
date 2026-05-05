"use client";

import { useEffect, useRef } from "react";

export default function CoupangDynamicBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // iframe을 생성하여 독립적인 환경에서 쿠팡 스크립트 실행
    // 이 방식이 리액트의 생명주기나 다른 스크립트와 충돌을 피하는 가장 확실한 방법입니다.
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "180px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 170px; overflow: hidden; }
            </style>
          </head>
          <body>
            <div id="coupang-ads"></div>
            <script src="https://ads-partners.coupang.com/g.js"></script>
            <script>
              function initAds() {
                if (window.PartnersCoupang && PartnersCoupang.G) {
                  new PartnersCoupang.G({
                    "id": "985786",
                    "trackingCode": "AF1183921",
                    "subId": null,
                    "template": "carousel",
                    "width": "100%",
                    "height": "170"
                  });
                } else {
                  setTimeout(initAds, 200);
                }
              }
              window.onload = initAds;
              // 혹시 모를 로딩 실패 대비 강제 호출
              setTimeout(initAds, 1000);
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-3 overflow-hidden rounded-[30px] bg-white/60 backdrop-blur-md p-6 border border-white shadow-xl my-10 relative z-30">
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center overflow-hidden min-h-[170px] relative"
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-[10px] font-bold">
          광고 로딩 중...
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-30">
        <div className="w-1 h-1 rounded-full bg-gray-400" />
        <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-tighter">
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
