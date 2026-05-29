"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TipData } from "@/lib/posts";
import CoupangDynamicBanner from "@/components/CoupangDynamicBanner";

const V_NUM = "12";
const IMG_BASE = "/images/";

export default function TipClient({ initialTip }: { initialTip: TipData }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 이미지 경로 도우미
  const getImageUrl = (path: string) => {
    if (!path) return "/images/background1.png";
    if (path.startsWith("http")) return path;
    let cleanPath = path;
    if (cleanPath.startsWith("/images/")) cleanPath = cleanPath.replace("/images/", "");
    if (cleanPath.startsWith("images/")) cleanPath = cleanPath.replace("images/", "");
    return `${IMG_BASE}${cleanPath}?v=${V_NUM}`;
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 pb-20 relative overflow-x-hidden">
      {/* 🖼️ 배경 */}
      <div 
        className="fixed inset-0 z-[-1] opacity-50 pointer-events-none"
        style={{
          backgroundImage: `url(${getImageUrl("background1.png")})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* 🏮 상단 메뉴 & 헤더 (기존 디자인 유지) */}
      <div className="fixed top-6 left-5 z-[60] flex items-center gap-4">
        <button 
          onClick={() => router.push("/")}
          className="bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 rounded-full shadow-xl hover:scale-110 transition-all font-black text-gray-800"
        >
          HOME
        </button>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 lg:pt-48">
        <article className="bg-white/90 backdrop-blur-2xl rounded-[40px] lg:rounded-[60px] overflow-hidden shadow-2xl border border-white">
          {/* 상단 이미지 */}
          <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
            <img 
              src={getImageUrl(initialTip.image)} 
              alt={initialTip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-8 left-8">
              <span className="bg-yellow-400 text-gray-900 text-xs lg:text-lg font-black px-6 py-2 rounded-full shadow-lg">
                {initialTip.category}
              </span>
            </div>
          </div>

          <div className="p-10 lg:p-20">
            <h1 className="text-3xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
              {initialTip.title}
            </h1>
            
            <div className="flex gap-4 mb-12 text-sm lg:text-lg font-bold text-gray-400">
              <span>📅 {initialTip.date}</span>
              <span>👤 루미 가이드</span>
            </div>

            {/* 본문 내용 */}
            <div className="prose prose-lg lg:prose-2xl max-w-none prose-slate prose-headings:font-black prose-p:leading-relaxed prose-strong:text-blue-600 mb-16">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  )
                }}
              >
                {initialTip.content}
              </ReactMarkdown>
            </div>

            {/* 🛒 루미의 추천 아이템 박스 */}
            {initialTip.productName && (
              <div className="bg-gray-50 rounded-[32px] lg:rounded-[48px] p-8 lg:p-12 border border-gray-100 mb-12">
                <div className="text-xs lg:text-base text-gray-400 font-black mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-12 h-[2px] bg-gray-200"></span>
                  루미의 추천 아이템
                </div>
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="text-2xl lg:text-4xl font-black text-gray-900 text-center lg:text-left">
                    {initialTip.productName}
                  </div>
                  <button 
                    onClick={() => window.open(initialTip.productLink, "_blank", "noopener,noreferrer")}
                    className="w-full lg:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-12 py-5 lg:py-6 rounded-3xl font-black text-xl lg:text-2xl flex items-center justify-center gap-4 shadow-xl shadow-yellow-100 hover:scale-105 transition-all group"
                  >
                    <span>최저가 확인</span>
                    <span className="text-3xl group-hover:rotate-12 transition-transform">🛒</span>
                  </button>
                </div>
              </div>
            )}

            {/* 쿠팡 다이나믹 배너 */}
            <div className="mt-12">
              <CoupangDynamicBanner />
            </div>

            {/* 하단 버튼 */}
            <div className="mt-20 flex gap-4">
              <button 
                onClick={() => router.back()}
                className="flex-1 py-6 bg-gray-100 text-gray-500 rounded-3xl font-black text-xl hover:bg-gray-200 transition-all"
              >
                뒤로가기
              </button>
              <button 
                onClick={() => router.push("/")}
                className="flex-1 py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                메인으로
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
