import { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "루미 가이드의 개인정보처리방침을 안내해 드립니다.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-black text-gray-900 mb-12">개인정보처리방침</h1>
      
      <div className="prose prose-blue max-w-none text-gray-600 space-y-8 font-medium">
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            루미 가이드는 별도의 회원가입 없이 모든 콘텐츠를 이용할 수 있는 익명 기반의 정보 포털입니다. 
            당사는 원칙적으로 사용자의 개인정보를 수집하지 않으며, 사이트 방문 시 발생하는 로그 데이터 및 
            쿠키 정보는 서비스 최적화 및 광고 게재를 위해서만 활용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. 쿠키(Cookie)의 사용 및 거부</h2>
          <p>
            당사는 사용자에게 개인화된 서비스를 제공하기 위해 '쿠키(cookie)'를 사용합니다. 
            쿠키는 웹사이트를 운영하는 데 이용되는 서버가 사용자의 브라우저에 보내는 아주 작은 텍스트 파일로 
            사용자의 컴퓨터 하드디스크에 저장됩니다.
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>쿠키 사용 목적</strong>: 사용자 접속 빈도나 방문 시간 분석, 방문 회수 파악 등을 통한 서비스 개선 및 타겟팅 광고 게재</li>
            <li><strong>쿠키 설정 거부</strong>: 사용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 브라우저 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.</li>
          </ul>
        </section>

        <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">3. 구글 애드센스(Google AdSense) 관련 고지</h2>
          <p className="text-blue-800">
            본 웹사이트는 구글(Google)에서 제공하는 웹 분석 서비스 및 광고 게재 서비스인 구글 애드센스를 사용합니다. 
            구글은 사용자가 본 사이트 또는 다른 사이트를 방문한 기록을 바탕으로 사용자에게 적절한 광고를 제공하기 위해 쿠키를 사용합니다.
          </p>
          <ul className="list-disc pl-5 mt-4 text-blue-800 space-y-2">
            <li>구글은 광고주가 제공하는 타겟팅 광고를 위해 쿠키를 사용하며, 사용자는 <a href="https://adssettings.google.com" target="_blank" className="underline font-black">구글 광고 설정</a>을 통해 맞춤 설정 광고를 해제할 수 있습니다.</li>
            <li>구글의 데이터 수집 및 사용 방식에 관한 자세한 내용은 <a href="https://policies.google.com/technologies/ads" target="_blank" className="underline font-black">구글 정책 및 약관</a>을 참조하시기 바랍니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. 데이터 보안</h2>
          <p>
            당사는 수집된 익명 데이터를 안전하게 보호하기 위해 기술적, 관리적 대책을 강구하고 있으며, 
            사용자의 동의 없이 제3자에게 데이터를 판매하거나 공유하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. 개인정보 보호 책임자</h2>
          <p>
            본 정책에 관한 문의사항은 아래 연락처로 문의해 주시기 바랍니다.
            <br />
            이메일: wonjihyo86@gmail.com
          </p>
        </section>

        <p className="pt-12 text-sm text-gray-400">
          공고일자: 2026년 5월 15일
          <br />
          시행일자: 2026년 5월 15일
        </p>
      </div>
    </div>
  );
}
