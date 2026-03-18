import Link from "next/link";
import localInfo from "../../public/data/local-info.json";

export default function Home() {
  const events = localInfo.filter((item) => item.category === "행사/축제");
  const benefits = localInfo.filter((item) => item.category === "지원금/혜택");

  return (
    <div className="min-h-screen font-sans text-rose-950 bg-pink-50">
      <header className="bg-pink-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-black text-pink-600 tracking-tight flex items-center gap-2">
            <span className="text-2xl">🌸</span> 성남시 생활 정보
          </Link>
          <p className="text-sm text-pink-500 hidden sm:block font-medium">
            따뜻하게 모아보는 우리 동네 꿀정보
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pb-16 space-y-12">
        <div className="mt-8 mx-4 md:mx-6 rounded-3xl bg-gradient-to-r from-pink-500 to-rose-400 p-8 md:p-12 shadow-lg shadow-pink-200 text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-rose-800 opacity-20 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              놓치기 아까운<br />우리 동네 소식.
            </h2>
            <p className="text-pink-50 text-lg md:text-xl font-medium max-w-lg mb-6">
              알짜배기 축제부터 꼭 필요한 예산 지원금까지, 나에게 딱 맞는 정보를 한눈에 찾아보세요!
            </p>
            <div className="inline-flex items-center bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-semibold text-white border border-white/30 cursor-default">
              ✨ 최신 정보 업데이트 완료
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 space-y-16">
          <section>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center text-xl shadow-sm">🎀</div>
                <h2 className="text-2xl font-bold text-rose-900">이번 달 행사/축제</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link href={`/detail/${event.id}`} key={event.id} className="group bg-white/90 rounded-2xl shadow-sm border border-pink-100 p-6 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-200 transition-all duration-300 flex flex-col h-full cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <span className="shrink-0 bg-pink-100 text-pink-600 border border-pink-200 text-xs px-3 py-1 rounded-full font-bold">🎉 축제 정보</span>
                  </div>
                  <h3 className="text-xl font-bold text-rose-900 leading-tight mb-3 group-hover:text-pink-600 transition-colors">{event.name}</h3>
                  <p className="text-rose-800/80 text-sm mb-6 leading-relaxed flex-grow">{event.summary}</p>
                  <div className="text-sm text-rose-800 space-y-2 mb-6 bg-pink-50 p-4 rounded-xl border border-pink-100">
                    <p className="flex items-start gap-2"><span className="text-pink-400 mt-0.5">📅</span> <span>{event.startDate} ~ {event.endDate}</span></p>
                    <p className="flex items-start gap-2"><span className="text-pink-400 mt-0.5">📍</span> <span>{event.location}</span></p>
                  </div>
                  <div className="w-full bg-pink-100 text-pink-700 font-bold px-4 py-3 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-colors text-center mt-auto">상세 정보 보기</div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 text-white flex items-center justify-center text-xl shadow-sm">💝</div>
                <h2 className="text-2xl font-bold text-rose-900">놓치면 아쉬운 혜택</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <Link href={`/detail/${benefit.id}`} key={benefit.id} className="group bg-white/90 rounded-2xl shadow-sm border border-pink-100 p-6 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-200 transition-all duration-300 flex flex-col h-full relative overflow-hidden cursor-pointer">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="shrink-0 bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 text-xs px-3 py-1 rounded-full font-bold">💡 꿀팁 혜택</span>
                  </div>
                  <h3 className="text-xl font-bold text-rose-900 leading-tight mb-3 group-hover:text-fuchsia-600 transition-colors">{benefit.name}</h3>
                  <p className="text-rose-800/80 text-sm mb-6 leading-relaxed flex-grow">{benefit.summary}</p>
                  <div className="text-sm text-rose-800 space-y-2 mb-6 bg-fuchsia-50/50 border border-fuchsia-100 p-4 rounded-xl">
                    <p className="flex items-start gap-2"><span className="text-fuchsia-400 mt-0.5">📅</span> <span>{benefit.startDate} ~ {benefit.endDate}</span></p>
                    <p className="flex items-start gap-2"><span className="text-fuchsia-400 mt-0.5">👥</span> <span>{benefit.target}</span></p>
                  </div>
                  <div className="w-full bg-fuchsia-50 text-fuchsia-700 font-bold px-4 py-3 rounded-xl group-hover:bg-fuchsia-500 group-hover:text-white transition-colors text-center mt-auto">상세 안내 보기</div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-rose-950 text-rose-200 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
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
