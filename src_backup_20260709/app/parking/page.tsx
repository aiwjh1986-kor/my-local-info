import Link from "next/link";

export default function ParkingPage() {
  const parkingLots = [
    {
      name: "수지구청 공영주차장",
      address: "경기도 용인시 수지구 포은대로 435",
      type: "공영",
      price: "30분 600원",
      status: "운영중",
      isFreeWeekend: true,
      tag: "가장 인기"
    },
    {
      name: "용인중앙시장 주차장",
      address: "경기도 용인시 처인구 금령로 71",
      type: "전통시장",
      price: "1시간 무료 (구매시)",
      status: "운영중",
      isFreeWeekend: false,
      tag: "전통시장"
    },
    {
      name: "기흥역 환승주차장",
      address: "경기도 용인시 기흥구 기흥역로 10",
      type: "환승",
      price: "10분 200원",
      status: "혼잡",
      isFreeWeekend: false,
      tag: "역세권"
    },
    {
      name: "처인구청 주차장",
      address: "경기도 용인시 처인구 중부대로 1199",
      type: "공공기관",
      price: "평일 유료 / 주말 무료",
      status: "운영중",
      isFreeWeekend: true,
      tag: "공공기관"
    }
  ];

  return (
    <div className="dashboard-container">
      {/* 1. 좌측 사이드바 (메인과 동일) */}
      <aside className="sidebar-left p-6 flex flex-col space-y-8">
        <div className="flex items-center gap-2 px-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏮</span>
            <span className="text-xl font-black tracking-tighter">용인생활가이드</span>
          </Link>
        </div>
        
        <nav className="space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            <span>🏠</span><span>홈</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            <span>💰</span><span>지원금</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all">
            <span>📅</span><span>행사</span>
          </Link>
          <Link href="/parking" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-accent text-white shadow-lg shadow-accent/20 font-bold text-sm transition-all">
            <span>🅿️</span><span>주차정보</span>
          </Link>
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <div className="p-4 bg-accent-light rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl">🌧️</span>
              <span className="text-xl font-black">26°</span>
            </div>
            <p className="text-[10px] font-bold text-accent text-center">용인시 현재 날씨</p>
          </div>
        </div>
      </aside>

      {/* 2. 메인 영역 (주차 정보 상세) */}
      <main className="main-content">
        <header className="mb-12">
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-accent flex items-center gap-2 mb-6 transition-colors">
            ← 목록으로 돌아가기
          </Link>
          <h2 className="text-4xl font-black mb-4 leading-tight text-[#111111]">
            용인시 <span className="text-accent">실시간 주차</span> 가이드 🚗
          </h2>
          <p className="text-gray-500 font-medium">용인시 내 주요 공영 및 환승 주차장 정보를 한눈에 확인하세요.</p>
        </header>

        {/* 루미의 주차 꿀팁 (검은 고양이 일러스트 활용) */}
        <div className="glass-card bg-accent-light p-8 mb-12 flex items-center gap-8 border-none relative overflow-hidden">
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🐈‍⬛</span>
              <h4 className="font-black text-lg">루미의 주차 꿀팁!</h4>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              "대부분의 용인시 공영주차장은 <span className="text-accent font-bold">주말과 공휴일에 무료</span>로 개방돼요! <br />
              수지구청이나 처인구청 주차장을 이용하시면 주말 나들이가 더 가벼워진답니다.🐾"
            </p>
          </div>
          <div className="w-40 h-40 relative z-10 flex items-center justify-center">
            <img src="/images/black-cat-hero.png" alt="Lumi" className="w-full h-full object-contain scale-150 mt-4" />
          </div>
        </div>

        {/* 주차장 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {parkingLots.map((lot, idx) => (
            <div key={idx} className="glass-card p-8 group flex flex-col hover:border-accent/30">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase text-white ${
                  lot.type === '공영' ? 'bg-accent' :
                  lot.type === '환승' ? 'bg-blue-400' : 'bg-emerald-400'
                }`}>
                  {lot.type} 주차장
                </span>
                <span className={`text-xs font-black ${lot.status === '운영중' ? 'text-emerald-500' : 'text-orange-500'}`}>
                  ● {lot.status}
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#111111] mb-2 group-hover:text-accent transition-colors">{lot.name}</h3>
              <p className="text-gray-400 text-xs mb-6 font-medium">📍 {lot.address}</p>
              
              <div className="space-y-3 pt-6 border-t border-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">💰 이용 요금</span>
                  <span className="text-[#111111] font-black">{lot.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">🕒 운영 시간</span>
                  <span className="text-[#111111] font-black">24시간 운영</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">🎁 주말 혜택</span>
                  <span className={`font-black ${lot.isFreeWeekend ? 'text-accent' : 'text-gray-300'}`}>
                    {lot.isFreeWeekend ? "주말 무료 개방" : "주말 유료 운영"}
                  </span>
                </div>
              </div>

              <button className="mt-8 w-full py-3 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-accent hover:text-white transition-all">
                지도로 위치 보기 ➔
              </button>
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <footer className="mt-20 py-10 border-t border-gray-100 flex justify-between items-center text-[#999999] text-[11px] font-bold">
          <p>© {new Date().getFullYear()} Yongin Guide. All rights reserved.</p>
          <div className="flex gap-6">
            <span>정보 출처: 용인도시공사</span>
            <span>문의하기</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
