import localInfo from "../../../../public/data/local-info.json";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return localInfo.map((item) => ({
    id: item.id,
  }));
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const item = localInfo.find((data) => data.id === id);
  
  if (!item) {
    notFound();
  }

  // 따뜻하고 핑크핑크한 색상 테마 분기
  const isEvent = item.category === "행사/축제";
  const themeColor = isEvent ? "text-pink-600" : "text-fuchsia-600";
  const themeBgLight = isEvent ? "bg-pink-100" : "bg-fuchsia-100";
  const themeBgDark = isEvent ? "bg-pink-500" : "bg-fuchsia-500";
  const themeBorder = isEvent ? "border-pink-200" : "border-fuchsia-200";
  const shadowColor = isEvent ? "shadow-pink-200" : "shadow-fuchsia-200";

  return (
    <div className="min-h-screen font-sans text-rose-950 bg-pink-50">
      <header className="bg-pink-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-black text-pink-600 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🌸</span> 성남시 생활 정보
          </Link>
          <Link href="/" className="text-sm font-semibold text-pink-500 hover:text-pink-700 transition-colors">
            ← 목록으로
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className={`bg-white/90 rounded-3xl p-8 md:p-12 shadow-xl ${shadowColor} border border-pink-100`}>
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${themeBgLight} ${themeColor} ${themeBorder}`}>
              {isEvent ? "🎉 축제 정보" : "💡 꿀팁 혜택"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-rose-900 leading-tight mb-8">
            {item.name}
          </h1>

          <div className="bg-pink-50/80 rounded-2xl p-6 md:p-8 space-y-4 mb-10 border border-pink-100">
            <p className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base md:text-lg">
              <span className={`font-bold ${themeColor} w-12 shrink-0`}>기간</span> 
              <span className="text-rose-900 font-medium">{item.startDate} ~ {item.endDate}</span>
            </p>
            <hr className="border-pink-200/50" />
            <p className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base md:text-lg">
              <span className={`font-bold ${themeColor} w-12 shrink-0`}>장소</span> 
              <span className="text-rose-900 font-medium">{item.location}</span>
            </p>
            <hr className="border-pink-200/50" />
            <p className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base md:text-lg">
              <span className={`font-bold ${themeColor} w-12 shrink-0`}>대상</span> 
              <span className="text-rose-900 font-medium">{item.target}</span>
            </p>
          </div>

          <div className="prose prose-rose prose-lg max-w-none text-rose-800 leading-relaxed mb-12">
            <h3 className="text-2xl font-bold text-rose-900 mb-4 inline-block border-b-2 border-pink-400 pb-1">상세 안내</h3>
            <p className="whitespace-pre-wrap font-medium">{item.summary}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center mt-12 pt-8 border-t border-pink-100">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex-1 w-full text-center text-white py-4 rounded-xl font-bold text-lg shadow-md hover:-translate-y-1 transition-transform ${themeBgDark} hover:shadow-lg`}
            >
              자세히 보기 →
            </a>
            <Link 
              href="/"
              className="flex-1 w-full text-center bg-pink-50 hover:bg-pink-100 text-pink-700 py-4 rounded-xl font-bold text-lg transition-colors border border-pink-200"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-rose-950 text-rose-200 py-12 mt-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="mb-4 font-medium text-rose-300">본 사이트는 공공데이터포털(data.go.kr)의 데이터를 활용하여 안내를 돕는 웹페이지입니다.</p>
          <div className="flex items-center justify-center gap-4 text-sm mt-6 pt-6 border-t border-rose-900">
            <p>업데이트: 2026-03-18</p>
            <span>|</span>
            <p>성남시 생활 정보 서비스</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
