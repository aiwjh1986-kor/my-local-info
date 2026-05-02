import Link from "next/link";
import data from "../../public/data/local-info.json";
import featuredCards from "../../public/data/featured-cards.json";
import AdBanner from "@/components/AdBanner";

interface FeaturedCard {
  category: string;
  title: string;
  summary: string;
  date: string;
  region: string;
  cta: string;
  deadline: string | null;
  is_urgent: boolean;
  is_popular: boolean;
}

export default function Home() {
  const { lastUpdate } = data;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      {/* 1. 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <h1 className="text-xl md:text-2xl font-black text-orange-600 font-[family-name:var(--font-baloo-2)] tracking-tight">
              용인 생활가이드
            </h1>
          </Link>
          <nav className="flex gap-4 md:gap-8 font-bold text-gray-600 text-sm md:text-base">
            <Link href="/" className="text-orange-600">홈</Link>
            <Link href="/blog" className="hover:text-orange-600 transition-colors">블로그</Link>
            <Link href="/about" className="hover:text-orange-600 transition-colors">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 메인 비주얼 배너 */}
        <section className="mb-12 bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold mb-4">
              NEW 용인 소식통 루미 🏮
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              용인의 모든 생활정보,<br />한눈에 확인하세요!
            </h2>
            <p className="text-orange-50 text-sm md:text-lg max-w-md font-medium opacity-90">
              지원금부터 축제, 실시간 날씨 정보까지<br />용인 시민을 위한 맞춤 정보를 배달해 드립니다.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-[150px] md:text-[200px] opacity-20 select-none">
            🏙️
          </div>
        </section>

        {/* 광고 영역 */}
        <AdBanner />

        {/* 오늘의 추천 정보 카드 그리드 */}
        <section className="mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-orange-600 font-bold text-sm tracking-wider uppercase">Today's Pick</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-800">놓치면 안 될 용인 소식 ⭐</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium">실시간으로 업데이트되는 최신 정보를 확인하세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {featuredCards.map((card: FeaturedCard, index: number) => (
              <div 
                key={index} 
                className={`group bg-white rounded-3xl p-1 shadow-sm hover:shadow-2xl transition-all duration-300 border-2 ${card.is_urgent ? 'border-red-100 hover:border-red-300' : 'border-transparent hover:border-orange-200'} relative overflow-hidden flex flex-col`}
              >
                {/* 카드 상단 배지 */}
                <div className="p-6 pb-2 flex justify-between items-start">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-tighter ${
                      card.category === '지원금' ? 'bg-green-100 text-green-700' :
                      card.category === '행사' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {card.category}
                    </span>
                    {card.is_urgent && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black animate-bounce">
                        마감임박 ⏰
                      </span>
                    )}
                  </div>
                  {card.is_popular && (
                    <span className="text-xl">🔥</span>
                  )}
                </div>

                {/* 카드 본문 */}
                <div className="px-6 flex-1">
                  <h3 className="text-xl md:text-2xl font-black mb-3 text-gray-900 group-hover:text-orange-600 transition-colors whitespace-pre-line leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base font-medium mb-6 leading-relaxed">
                    {card.summary}
                  </p>
                </div>

                {/* 카드 하단 정보 */}
                <div className="px-6 pb-6 mt-auto">
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Update / Region</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <span>{card.date}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-orange-500">{card.region}</span>
                      </div>
                    </div>
                    <Link 
                      href="/blog"
                      className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-orange-600 hover:scale-105 transition-all shadow-lg shadow-gray-200"
                    >
                      {card.cta}
                    </Link>
                  </div>
                </div>

                {/* 배경 장식 */}
                <div className="absolute -right-4 -top-4 text-6xl opacity-[0.03] rotate-12 group-hover:scale-125 transition-transform">
                  {card.category === '지원금' ? '💰' : card.category === '행사' ? '🎉' : 'ℹ️'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 4. 하단 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 text-center md:text-left">
            <div>
              <h2 className="text-xl font-black text-gray-800 mb-2 font-[family-name:var(--font-baloo-2)]">용인시 생활정보 및 여행가이드</h2>
              <p className="text-sm text-gray-500">루미가 전하는 우리동네의 따뜻하고 유익한 소식들</p>
            </div>
            <div className="flex gap-4">
              <Link href="/blog" className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors">블로그</Link>
              <Link href="/about" className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors">사이트 소개</Link>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              최근 업데이트: {lastUpdate} | 데이터 출처: 공공데이터포털
            </p>
            <p className="text-xs text-gray-400 font-bold">
              © {new Date().getFullYear()} Yongin Life Guide. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
