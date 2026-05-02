"use client";

import { useEffect } from "react";

export default function AdBanner() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  // ID가 설정되어 있지 않거나 기본값인 경우 아무것도 렌더링하지 않음
  if (!adsenseId || adsenseId === "나중에_입력") {
    return null;
  }

  return (
    <div className="my-8 w-full overflow-hidden text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4 min-h-[100px] flex flex-col justify-center items-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <p className="text-[10px] text-gray-300 mt-2 uppercase tracking-widest">Advertisement</p>
    </div>
  );
}
