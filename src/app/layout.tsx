import { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2, Gamja_Flower, Noto_Serif_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import BGMPlayer from "@/components/BGMPlayer";
import CustomCursor from "@/components/CustomCursor";

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const gamjaFlower = Gamja_Flower({
  variable: "--font-gamja-flower",
  subsets: ["latin"],
  weight: ["400"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "용인 가볼만한곳 & 용인 생활정보 가이드 | 루미 가이드",
    template: "%s | 루미 가이드"
  },
  description: "2026년 용인 가볼만한곳, 지역 축제, 행사 정보부터 용인시 지원금, 이자 지원, 실생활 꿀팁까지! 용인 주민과 여행자를 위한 필수 정보를 매일 업데이트합니다.",
  alternates: {
    canonical: "https://koreatripinfo.com",
  },
  keywords: ["용인 가볼만한곳", "용인 여행", "용인 축제", "용인 행사", "용인 지원금", "용인 생활정보", "용인시 혜택", "용인 맛집", "용인 꿀팁"],
  authors: [{ name: "LUMI GUIDE" }],
  creator: "LUMI GUIDE",
  publisher: "LUMI GUIDE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "8SgfASfYUu2c3pm5pYJyro_aYc8OEK7RSYHySCoJ8Ho",
    // 네이버 서치어드바이저용 (나중에 키 입력 가능)
    other: {
      "naver-site-verification": ["나중에_여기에_입력"],
    },
  },
  openGraph: {
    title: "용인 가볼만한곳 & 용인 생활정보 가이드 | 루미 가이드",
    description: "용인시 주민과 여행자를 위한 지역 행사, 축제, 지원금, 실생활 꿀팁 정보를 매일 확인하세요.",
    url: "https://koreatripinfo.com",
    siteName: "루미 가이드",
    images: [
      {
        url: "https://koreatripinfo.com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "루미 가이드 - 용인 생활 정보",
      },
    ],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "용인 가볼만한곳 & 용인 생활정보 가이드 | 루미 가이드",
    description: "용인시 주민과 여행자를 위한 필수 정보를 매일 업데이트합니다.",
    images: ["https://koreatripinfo.com/images/og-image.png"],
  },
};

import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo2.variable} ${gamjaFlower.variable} ${notoSerifKr.variable} h-full antialiased light`}
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-5327170974242376" />
        {process.env.NEXT_PUBLIC_ADSENSE_ID && process.env.NEXT_PUBLIC_ADSENSE_ID !== "나중에_입력" && (
          <Script
            id="adsense-id"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
            />
        )}
        {process.env.NEXT_PUBLIC_GA_ID && process.env.NEXT_PUBLIC_GA_ID !== "나중에_입력" && (
          <>
            <Script
              id="google-analytics"
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        <script
          key="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "용인시 생활 정보",
              "url": "https://koreatripinfo.com",
              "description": "용인시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보"
            })
          }}
        />
        <script
          key="json-ld-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "홈",
                  "item": "https://koreatripinfo.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "블로그",
                  "item": "https://koreatripinfo.com/blog"
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-pretendard bg-background text-foreground">
        <CustomCursor />
        {/* 미니멀한 Top Navigation Bar */}
        <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 lg:py-5 w-full">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            {/* 한옥 기와 SVG 로고 + 브랜드명 */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* 지붕 어두운 파랑 오버레이 */}
                  <path d="M10 52C28 45 38 42 50 42C62 42 72 45 90 52C82 44 75 32 50 32C25 32 18 44 10 52Z" fill="#1E3B8B" />
                  {/* 기와 밝은 파랑 */}
                  <path d="M15 50C30 45 40 42 50 42C60 42 70 45 85 50C80 44 75 35 50 35C25 35 20 44 15 50Z" fill="#3B82F6" />
                  {/* 대들보 (나무) */}
                  <path d="M22 51H78V55H22V51Z" fill="#F59E0B" />
                  {/* 서까래 디테일 */}
                  <rect x="30" y="55" width="4" height="3" fill="#D97706" />
                  <rect x="48" y="55" width="4" height="3" fill="#D97706" />
                  <rect x="66" y="55" width="4" height="3" fill="#D97706" />
                  {/* 나무 기둥 */}
                  <rect x="31" y="58" width="3" height="15" fill="#B45309" />
                  <rect x="66" y="58" width="3" height="15" fill="#B45309" />
                  {/* 기단부 돌판 */}
                  <path d="M18 73H82V77H18V73Z" fill="#E5E7EB" />
                  <path d="M25 77H75V79H25V77Z" fill="#D1D5DB" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-black text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                  KoreaTripInfo
                </span>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider mt-1">
                  한국 여행의 모든 정보
                </span>
              </div>
            </a>
            
            {/* 사용자 기획안 Core 6개 메뉴 - 감성적인 사각 버튼 형식 */}
            <nav className="hidden xl:flex items-center gap-3.5 text-[13px] font-bold text-gray-700">
              <a href="/?tab=홈" className="px-5 py-2.5 bg-gray-50 border border-gray-100/70 rounded-xl hover:bg-gray-100 hover:scale-105 hover:text-gray-950 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.005)] text-center min-w-[70px]">홈</a>
              <a href="/?tab=지원금" className="px-5 py-2.5 bg-gray-50 border border-gray-100/70 rounded-xl hover:bg-gray-100 hover:scale-105 hover:text-gray-950 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.005)] text-center min-w-[85px]">지원금</a>
              <a href="/?tab=지역행사" className="px-5 py-2.5 bg-gray-50 border border-gray-100/70 rounded-xl hover:bg-gray-100 hover:scale-105 hover:text-gray-950 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.005)] text-center min-w-[95px]">지역행사</a>
              <a href="/?tab=생활정보" className="px-5 py-2.5 bg-gray-50 border border-gray-100/70 rounded-xl hover:bg-gray-100 hover:scale-105 hover:text-gray-950 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.005)] text-center min-w-[95px]">생활 정보</a>
              <a href="/?tab=도서정보" className="px-5 py-2.5 bg-gray-50 border border-gray-100/70 rounded-xl hover:bg-gray-100 hover:scale-105 hover:text-gray-950 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.005)] text-center min-w-[95px]">도서 소식</a>
              <a href="/?tab=세계 경제" className="px-5 py-2.5 bg-gray-50 border border-gray-100/70 rounded-xl hover:bg-gray-100 hover:scale-105 hover:text-gray-950 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.005)] text-center min-w-[95px]">세계 경제</a>
            </nav>

            {/* 우측 검색버튼 + 햄버거 메뉴 */}
            <div className="flex items-center gap-2.5">
              <button className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 hover:scale-105 transition-all" title="검색">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
              <button className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 hover:scale-105 transition-all" title="메뉴">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow pt-4">
          {children}
        </main>
        <Footer />
        <BGMPlayer />
      </body>
    </html>
  );
}
