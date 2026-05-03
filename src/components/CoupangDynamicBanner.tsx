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
        <html>
          <body style="margin:0; padding:0; display:flex; justify-content:center; align-items:center;">
            <script src="https://ads-partners.coupang.com/g.js"></script>
            <script>
              window.onload = function() {
                new PartnersCoupang.G({
                  "id": 985786,
                  "trackingCode": "AF1183921",
                  "subId": null,
                  "template": "carousel",
                  "width": "1000",
                  "height": "170"
                });
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3 overflow-hidden rounded-[30px] bg-white/40 backdrop-blur-sm p-6 border border-white/50 shadow-sm">
      <div
        ref={containerRef}
        className="w-full flex justify-center overflow-hidden"
        style={{ minHeight: "180px" }}
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
