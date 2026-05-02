import Link from "next/link";
import data from "../../public/data/local-info.json";
import AdBanner from "@/components/AdBanner";

interface InfoItem {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

export default function Home() {
  const { events, benefits, lastUpdate } = data;

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-900">
      {/* 1. 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              성남시 생활 정보 🏠
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              우리 동네의 생생한 축제와 따뜻한 혜택을 전해드립니다.
            </p>
          </div>
          <nav className="flex gap-6 font-bold text-gray-600">
            <Link href="/" className="text-orange-600 underline decoration-2 underline-offset-8">홈</Link>
            <Link href="/blog" className="hover:text-orange-600 transition-colors">블로그</Link>
            <Link href="/about" className="hover:text-orange-600 transition-colors">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* 2. 이번 달 행사/축제 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🎉</span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">이번 달 행사/축제</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: InfoItem) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-orange-50 flex flex-col">
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Event",
                      "name": event.name,
                      "startDate": event.startDate,
                      "endDate": event.endDate,
                      "location": {
                        "@type": "Place",
                        "name": event.location,
                        "address": event.location
                      },
                      "description": event.summary
                    })
                  }}
                />
                <div className="p-6 flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-3">
                    {event.category}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.summary}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center text-xs">📅</span>
                      <span>{event.startDate} ~ {event.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center text-xs">📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link 
                    href="/blog"
                    className="block text-center py-3 px-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 광고 영역 */}
        <AdBanner />

        {/* 3. 지원금/혜택 정보 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">💰</span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">지원금/혜택 정보</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit: InfoItem) => (
              <div key={benefit.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-green-50 flex flex-col md:flex-row">
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "GovernmentService",
                      "name": benefit.name,
                      "description": benefit.summary,
                      "provider": {
                        "@type": "Organization",
                        "name": "성남시"
                      }
                    })
                  }}
                />
                <div className="p-6 flex-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-3">
                    {benefit.category}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{benefit.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{benefit.summary}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center text-xs">👤</span>
                      <span>대상: {benefit.target}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center text-xs">📍</span>
                      <span>장소: {benefit.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0 md:pt-6 md:pl-0 flex items-end">
                  <Link 
                    href="/blog"
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors text-center"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 4. 하단 푸터 */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-sm text-gray-500 mb-2">
            본 사이트의 정보는 공공데이터포털(data.go.kr)의 데이터를 바탕으로 제공됩니다.
          </p>
          <p className="text-xs text-gray-400">
            최근 업데이트: {lastUpdate} | © {new Date().getFullYear()} 성남시 생활 정보
          </p>
        </div>
      </footer>
    </div>
  );
}
