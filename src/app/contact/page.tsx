import { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의하기 | 루미 가이드",
  description: "루미 가이드에 궁금한 점이 있으시거나 제보할 소식이 있다면 언제든 연락주세요.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-gray-900 mb-4">문의하기</h1>
        <p className="text-gray-500 font-bold">루미 가이드는 시민 여러분의 소중한 의견을 기다립니다.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-2xl">📧</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">이메일 문의</h3>
          <p className="text-gray-500 text-sm font-medium mb-4">가장 빠르게 답변을 받으실 수 있는 방법입니다.</p>
          <p className="text-blue-600 font-black">wonjihyo86@gmail.com</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 text-2xl">📍</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">활동 지역</h3>
          <p className="text-gray-500 text-sm font-medium mb-4">루미 가이드는 용인시 전역을 무대로 활동합니다.</p>
          <p className="text-gray-900 font-black">경기도 용인시 처인구·기흥구·수지구</p>
        </div>
      </div>

      <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">자주 묻는 질문 (FAQ)</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl">
            <h4 className="font-black text-gray-900 mb-2">Q. 정보의 출처는 어디인가요?</h4>
            <p className="text-sm text-gray-500 font-medium">루미 가이드의 모든 정보는 용인시청, 공공데이터포털, 그리고 에디터의 직접 취재를 통해 검증된 내용만 전달합니다.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl">
            <h4 className="font-black text-gray-900 mb-2">Q. 제보나 협업 문의도 가능한가요?</h4>
            <p className="text-sm text-gray-500 font-medium">네! 지역 미담, 축제 제보, 비즈니스 협업 등 모든 제안을 환영합니다. 이메일로 상세 내용을 보내주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
