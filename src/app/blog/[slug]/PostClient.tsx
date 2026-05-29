"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CoupangDynamicBanner from "@/components/CoupangDynamicBanner";

// 캐시 방지 버전
const V_NUM = "4";
const IMG_BASE = "/images/";

interface PostData {
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  image?: string;
  link?: string;
  tags: string[];
}

export default function PostClient({ initialPost }: { initialPost: PostData }) {
  const router = useRouter();
  const [post] = useState<PostData>(initialPost);

  const getCategoryStyles = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === "grant" || c === "지원금") return "bg-orange-500 text-white";
    if (c === "event" || c === "행사" || c === "지역행사") return "bg-blue-500 text-white";
    if (c === "info" || c === "생활정보") return "bg-green-500 text-white";
    if (c === "book" || c === "도서소식" || c === "도서정보") return "bg-purple-500 text-white";
    return "bg-gray-500 text-white";
  };

  return (
    <div className="dashboard-container min-h-screen relative">


      {/* 3. 본문 영역 (전체화면 스타일 적용) */}
      <main className="pt-24 lg:pt-32 pb-20 px-0 sm:px-6">
        <article className="max-w-[1600px] mx-auto bg-white rounded-none sm:rounded-[60px] lg:rounded-[80px] shadow-2xl overflow-hidden border-none sm:border border-white">
          {/* 포스트 헤더 */}
          <header className="p-10 lg:p-24 bg-gradient-to-br from-white to-gray-50 border-b border-gray-100">
            {post.image && (
              <div className="mb-12 lg:mb-24 rounded-[40px] lg:rounded-[80px] overflow-hidden shadow-2xl aspect-video">
                <img 
                  src={IMG_BASE + post.image.replace(".png", "") + ".png?v=" + V_NUM} 
                  className="w-full h-full object-cover" 
                  alt={post.title} 
                />
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <span className={`px-6 py-2 ${getCategoryStyles(post.category)} text-xs lg:text-xl font-black rounded-full uppercase tracking-widest shadow-lg`}>
                {post.category === "grant" ? "지원금" : 
                 post.category === "event" || post.category === "행사" || post.category === "지역행사" ? "지역행사" : 
                 post.category === "info" ? "생활정보" : 
                 post.category === "book" ? "도서소식" : post.category}
              </span>
              <time className="text-sm lg:text-2xl font-bold text-gray-300">{post.date}</time>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-8xl font-black text-[#111111] mb-6 lg:mb-10 leading-tight tracking-tighter font-handwriting">
              {post.title}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-3xl text-gray-500 font-bold leading-relaxed opacity-80">
              {post.summary}
            </p>

            {/* 🚀 상단 퀵 예매/신청 버튼 (글 시작하자마자 보이게!) */}
            {post.link && (
              <div className="mt-8 lg:mt-16">
                <button 
                  onClick={() => window.open(post.link, "_blank", "noopener,noreferrer")}
                  className="w-full py-6 lg:py-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-[30px] lg:rounded-[60px] font-black text-xl lg:text-5xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 lg:gap-8 group"
                >
                  <span className="text-2xl lg:text-6xl animate-bounce">🔗</span>
                  <span>홈페이지 바로가기</span>
                  <span className="text-2xl lg:text-6xl group-hover:translate-x-4 transition-transform">➔</span>
                </button>
              </div>
            )}
          </header>

          {/* 본문 콘텐츠 */}
          <div className="p-10 lg:p-24">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                  p: (props) => <p className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold mb-6 lg:mb-12 leading-[1.6] text-gray-700" {...props} />,
                  h1: (props) => <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black mb-8 lg:mb-20 text-[#111111] tracking-tighter" {...props} />,
                  h2: (props) => <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black mb-6 lg:mb-16 text-[#111111] tracking-tighter border-b-4 border-accent/10 pb-3" {...props} />,
                  h3: (props) => <h3 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-black mb-4 lg:mb-12 text-[#111111] tracking-tighter" {...props} />,
                  li: (props) => <li className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold mb-4 lg:mb-10 ml-6 lg:ml-12 list-disc text-gray-700" {...props} />,
                  strong: (props) => <strong className="font-black text-accent border-b-2 border-accent/20" {...props} />,
                  img: (props) => <img className="rounded-[20px] lg:rounded-[60px] shadow-2xl my-8 lg:my-12 w-full object-cover aspect-video" {...props} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* 🛍️ 쿠팡 파트너스 다이나믹 배너 */}
            <div className="mt-20 mb-10">
              <CoupangDynamicBanner />
            </div>

            {/* 태그 영역 */}
            <div className="mt-12 pt-12 border-t border-gray-50 flex flex-wrap gap-4">
              {post.tags?.map((tag) => (
                <span key={tag} className="px-6 py-2 bg-gray-50 text-gray-400 text-sm lg:text-2xl font-black rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            {/* 하단 버튼 영역 */}
            <div className="mt-20 flex flex-col lg:flex-row gap-8">
              {post.link && (
                <button 
                  onClick={() => window.open(post.link, "_blank", "noopener,noreferrer")}
                  className="flex-1 py-10 lg:py-14 bg-accent text-white rounded-[40px] lg:rounded-[60px] font-black text-2xl lg:text-5xl shadow-2xl hover:scale-[1.02] transition-all"
                >
                  홈페이지 바로가기 ➔
                </button>
              )}
              <button 
                onClick={() => router.back()}
                className="py-10 lg:py-14 px-12 lg:px-20 bg-gray-100 text-gray-400 rounded-[40px] lg:rounded-[60px] font-black text-2xl lg:text-5xl"
              >
                목록으로
              </button>
            </div>
          </div>
        </article>
      </main>

      {/* 5. 우측 하단 플로팅 버튼 (홈 & TOP) */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col gap-4">
        <button 
          onClick={() => router.push("/")}
          className="w-16 h-16 lg:w-24 h-24 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-110 hover:bg-white transition-all group p-2"
          title="홈으로"
        >
          <span className="text-accent text-2xl lg:text-5xl font-black group-hover:scale-110 transition-transform">H</span>
          <span className="text-[10px] lg:text-lg font-black tracking-tighter text-accent">HOME</span>
        </button>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-16 h-16 lg:w-24 h-24 bg-accent text-white rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-110 transition-all"
          title="맨 위로"
        >
          <span className="text-2xl lg:text-4xl">▲</span>
          <span className="text-[10px] lg:text-lg font-black tracking-tighter">TOP</span>
        </button>
      </div>

    </div>
  );
}
