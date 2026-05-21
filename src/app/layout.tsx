import { Suspense } from "react";
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

import Header from "@/components/dashboard/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo2.variable} ${gamjaFlower.variable} ${notoSerifKr.variable} h-full antialiased dark`}
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
      <body className="min-h-full flex flex-col font-pretendard bg-background text-foreground transition-colors duration-300">
        <CustomCursor />
        
        {/* 프리미엄 반응형 글래스모피즘 헤더 */}
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>

        <main className="flex-grow pt-4">
          {children}
        </main>
        <Footer />
        <BGMPlayer />
      </body>
    </html>
  );
}
