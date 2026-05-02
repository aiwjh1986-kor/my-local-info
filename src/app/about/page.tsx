import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-900">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <Link href="/">
              <h1 className="text-2xl md:text-3xl font-extrabold text-orange-600 font-[family-name:var(--font-baloo-2)]">
                용인시 생활정보 및 여행가이드 🏠
              </h1>
            </Link>
            <p className="mt-1 text-gray-600 text-sm font-medium">
              용인시의 알찬 정보와 전국 여행 소식을 전합니다.
            </p>
          </div>
          <nav className="flex gap-6 font-bold text-gray-600">
            <Link href="/" className="hover:text-orange-600 transition-colors">홈</Link>
            <Link href="/blog" className="hover:text-orange-600 transition-colors">블로그</Link>
            <Link href="/about" className="text-orange-600 underline decoration-2 underline-offset-8">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          <div className="bg-orange-500 p-10 text-white text-center">
            <span className="text-5xl mb-4 block">🏮</span>
            <h2 className="text-3xl font-black font-[family-name:var(--font-baloo-2)]">안녕하세요! 루미의 우리동네 소식통입니다.</h2>
          </div>
          
          <div className="p-10 space-y-12">
            <section>
              <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                🎯 운영 목적
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                용인시 주민분들과 전국 여행자분들이 꼭 필요한 <strong>생활정보, 문화행사, 정부 지원금, 전국 여행 및 행사</strong> 소식을 놓치지 않도록 돕기 위해 시작되었습니다. 실시간 <strong>날씨 정보</strong>까지 포함하여 더욱 유용한 정보를 매일 전달해 드립니다.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                📊 데이터 출처 및 신뢰성
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                본 블로그의 모든 정보는 <strong>대한민국 공공데이터포털(data.go.kr)</strong>의 공식 API를 통해 수집된 공신력 있는 데이터를 바탕으로 합니다.
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm text-gray-500">
                <ul className="list-disc ml-5 space-y-2">
                  <li>성남시/경기도 문화 행사 및 축제 정보</li>
                  <li>정부24 중앙부처 및 지자체 수혜 서비스</li>
                  <li>공공기관 주요 공지사항 및 소식</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                🤖 콘텐츠 생성 방식
              </h3>
              <p className="text-gray-600 leading-relaxed">
                방대한 공공데이터를 더 이해하기 쉽고 읽기 편한 블로그 글로 변환하기 위해 <strong>Google Gemini AI</strong> 기술을 활용하고 있습니다. AI는 수집된 원문 데이터를 바탕으로 핵심 내용을 요약하고 풍부한 설명을 덧붙이는 역할을 수행하며, 최종적인 신뢰성을 위해 본문에 항상 원문 링크를 제공하고 있습니다.
              </p>
            </section>

            <div className="pt-10 border-t border-gray-100 text-center">
              <Link 
                href="/blog"
                className="inline-block px-10 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200"
              >
                최신 소식 보러가기
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} 용인시 생활정보 및 여행가이드 | 소개 페이지
        </div>
      </footer>
    </div>
  );
}
