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
    <div className="min-h-screen bg-white font-sans text-[#111111]">
      {/* 1. 고정형 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏮</span>
            <span className="text-xl font-black tracking-tighter text-[#111111]">용인생활가이드</span>
          </Link>
          <nav className="hidden md:flex gap-10 text-sm font-bold text-[#666666]">
            <Link href="/" className="text-[#FF7A00]">홈</Link>
            <Link href="/blog" className="hover:text-[#FF7A00] transition-colors">지원금</Link>
            <Link href="/blog" className="hover:text-[#FF7A00] transition-colors">행사</Link>
            <Link href="/blog" className="hover:text-[#FF7A00] transition-colors">생활정보</Link>
          </nav>
          <div className="md:hidden text-2xl">≡</div>
        </div>
      </header>

      <main className="pt-16">
        {/* 2. 히어로 영역 */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-50 text-[#FF7A00] rounded-full text-xs font-bold mb-6">
            LUMI'S LOCAL GUIDE ✨
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight text-[#111111]">
            용인의 모든 생활정보,<br />가장 빠르고 정확하게.
          </h2>
          <p className="text-[#666666] text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            지원금부터 축제, 실시간 날씨 정보까지<br />
            용인 시민을 위해 매일 아침 업데이트되는 맞춤 정보를 확인하세요.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link 
              href="/blog" 
              className="px-10 py-4 bg-[#FF7A00] text-white rounded-full font-bold text-lg hover:bg-[#E66E00] transition-all shadow-lg shadow-orange-100"
            >
              지금 혜택 보기
            </Link>
            <Link 
              href="/about" 
              className="px-10 py-4 bg-gray-50 text-[#666666] rounded-full font-bold text-lg hover:bg-gray-100 transition-all border border-gray-100"
            >
              서비스 소개
            </Link>
          </div>
        </section>

        {/* 광고 영역 */}
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <AdBanner />
        </div>

        {/* 3. 카드 섹션 (메인 영역) */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-[#111111]">실시간 추천 정보 ⭐</h2>
            <div className="flex gap-2">
              <span className="w-8 h-1 bg-[#FF7A00] rounded-full"></span>
              <span className="w-2 h-1 bg-gray-200 rounded-full"></span>
              <span className="w-2 h-1 bg-gray-200 rounded-full"></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredCards.map((card: FeaturedCard, index: number) => (
              <div 
                key={index} 
                className="group bg-white rounded-[20px] p-8 border border-gray-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col relative"
              >
                {/* 뱃지 영역 */}
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white ${
                    card.category === '지원금' ? 'bg-[#FF7A00]' :
                    card.category === '행사' ? 'bg-[#2D7FF9]' :
                    'bg-[#10B981]'
                  }`}>
                    {card.category}
                  </span>
                  <div className="flex gap-2">
                    {card.is_urgent && (
                      <span className="bg-[#EF4444] text-white px-2 py-1 rounded-md text-[9px] font-black">
                        마감임박
                      </span>
                    )}
                    {card.is_popular && (
                      <span className="bg-[#FBBF24] text-white px-2 py-1 rounded-md text-[9px] font-black">
                        인기
                      </span>
                    )}
                  </div>
                </div>

                {/* 제목 및 설명 */}
                <h3 className="text-xl font-bold mb-4 text-[#111111] leading-snug min-h-[3.5rem] group-hover:text-[#FF7A00] transition-colors">
                  {card.title}
                </h3>
                <p className="text-[#666666] text-sm font-medium mb-8 leading-relaxed line-clamp-2">
                  {card.summary}
                </p>

                {/* 하단 정보 */}
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-[#999999]">
                    {card.date} · {card.region}
                  </div>
                  <Link 
                    href="/blog"
                    className="px-5 py-2.5 rounded-full bg-[#FF7A00] text-white text-xs font-black hover:bg-[#E66E00] transition-all shadow-sm"
                  >
                    {card.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 4. 푸터 */}
      <footer className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <h3 className="text-xl font-black text-[#111111] mb-2 font-[family-name:var(--font-baloo-2)]">용인생활가이드</h3>
            <p className="text-[#999999] text-sm">루미가 전하는 우리동네의 유익한 소식들</p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-[#666666]">
            <Link href="/blog">블로그</Link>
            <Link href="/about">사이트 소개</Link>
            <Link href="/contact">문의하기</Link>
          </div>
          <p className="text-[10px] text-[#999999] font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} Yongin Guide. Updated: {lastUpdate}
          </p>
        </div>
      </footer>
    </div>
  );
}
