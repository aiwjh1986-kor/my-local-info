"use client";

export default function CoupangBanner() {
  const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;

  // ID가 설정되어 있지 않거나 기본값인 경우 아무것도 렌더링하지 않음
  if (!partnerId || partnerId === "나중에_입력") {
    return null;
  }

  return (
    <div className="my-6 w-full flex flex-col items-center">
      <div className="w-full max-w-[728px] bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
        <p className="text-xs text-gray-400 mb-3">쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
        
        {/* 쿠팡 배너 영역 (실제 스크립트나 iframe이 들어갈 자리) */}
        <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200">
          <p className="text-gray-500 font-bold mb-2">🛍️ 추천 상품 영역</p>
          <p className="text-sm text-gray-400">나중에 쿠팡 파트너스에서 발급받은 배너 코드를 이곳에 넣으시면 됩니다.</p>
        </div>
      </div>
    </div>
  );
}
