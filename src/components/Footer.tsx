"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-black text-gray-900 font-[family-name:var(--font-baloo-2)]">LUMI GUIDE</span>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-md uppercase tracking-tighter">Local Expert</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6 font-medium">
              루미 가이드는 용인시의 모든 정보가 모이는 지역 생활정보 전문 포털입니다. 
              축제, 행사, 지원금부터 실생활 꿀팁까지 가장 빠르고 정확하게 전달합니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-black text-sm mb-6 uppercase tracking-widest">메뉴</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="/?tab=지원금" className="hover:text-blue-600 transition-colors">지원금 혜택</Link></li>
              <li><Link href="/?tab=지역행사" className="hover:text-blue-600 transition-colors">지역 행사</Link></li>
              <li><Link href="/?tab=생활정보" className="hover:text-blue-600 transition-colors">생활 정보</Link></li>
              <li><Link href="/blog" className="hover:text-blue-600 transition-colors">전체 블로그</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-gray-900 font-black text-sm mb-6 uppercase tracking-widest">고객지원 & 정책</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">루미 가이드 소개</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors text-gray-900">개인정보처리방침</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">문의하기</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs font-medium">
            © {currentYear} LUMI GUIDE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Designed for Yongin Citizens</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
