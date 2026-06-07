"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F7F7FA] border-t border-gray-100 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          {/* Brand Column (Left - Colspan 4) */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-6.5 h-6.5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 52C28 45 38 42 50 42C62 42 72 45 90 52C82 44 75 32 50 32C25 32 18 44 10 52Z" fill="#1E3B8B" />
                  <path d="M15 50C30 45 40 42 50 42C60 42 70 45 85 50C80 44 75 35 50 35C25 35 20 44 15 50Z" fill="#3B82F6" />
                  <path d="M22 51H78V55H22V51Z" fill="#F59E0B" />
                  <rect x="30" y="55" width="4" height="3" fill="#D97706" />
                  <rect x="48" y="55" width="4" height="3" fill="#D97706" />
                  <rect x="66" y="55" width="4" height="3" fill="#D97706" />
                  <rect x="31" y="58" width="3" height="15" fill="#B45309" />
                  <rect x="66" y="58" width="3" height="15" fill="#B45309" />
                  <path d="M18 73H82V77H18V73Z" fill="#E5E7EB" />
                  <path d="M25 77H75V79H25V77Z" fill="#D1D5DB" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-black text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                  KoreaTripInfo
                </span>
                <span className="text-[8px] font-bold text-gray-400 tracking-wider mt-1">
                  한국 여행의 모든 정보
                </span>
              </div>
            </Link>
            <p className="text-gray-500 text-[13px] leading-relaxed max-w-sm mb-6 font-medium">
              한국 여행을 더 쉽고, 더 즐겁게!
              용인시의 축제, 지원금 혜택부터 생활 꿀팁까지 꼭 필요한 모든 정보를 한곳에 모았습니다.
            </p>

          </div>

          {/* Quick Links Columns (Middle - Colspan 6) */}
          <div className="md:col-span-5 grid grid-cols-3 gap-6">
            {/* Column 3: 고객 센터 */}
            <div>
              <h4 className="text-gray-900 font-bold text-[13px] mb-5 tracking-wide">고객 센터</h4>
              <ul className="space-y-3.5 text-[12.5px] font-semibold text-gray-400">
                <li><Link href="/contact" className="hover:text-gray-900 transition-colors">자주 묻는 질문</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 transition-colors">문의하기</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          {/* Banner Column (Right - Colspan 3) */}
          <div className="md:col-span-3">
            <div className="bg-[#FAF9F5] border border-[#F3EFE0] rounded-3xl p-5 flex flex-col items-start gap-4">
              <span className="text-2xl">🎒</span>
              <div>
                <h5 className="text-[13px] font-bold text-gray-800 leading-snug">
                  다양한 지역행사를<br />확인해보세요!
                </h5>
              </div>
              <Link 
                href="/?tab=지역행사" 
                className="w-full py-2.5 bg-gray-950 text-white rounded-xl text-center text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5"
              >
                지역행사 보러가기 <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="pt-8 border-t border-gray-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs font-semibold">
            © {currentYear} KoreaTripInfo. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Designed for Beautiful Journeys
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
