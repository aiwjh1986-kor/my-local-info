import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "루미 가이드 소개",
  description: "용인시 지역 생활 정보의 중심, 루미 가이드를 소개합니다.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 text-xs font-black rounded-full mb-6 uppercase tracking-widest">
          Since 2024
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
          용인 생활의 즐거운 동반자,<br />
          <span className="text-blue-600">루미 가이드</span>입니다.
        </h1>
        <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed">
          복잡한 공공데이터와 파편화된 지역 정보를 누구나 이해하기 쉬운 
          스토리로 풀어내어 용인 시민의 삶을 더 풍요롭게 만듭니다.
        </p>
      </div>

      {/* Philosophy Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {[
          { title: "정확한 정보", desc: "공공데이터와 공식 문서를 바탕으로 검증된 사실만 전달합니다.", icon: "✅" },
          { title: "현지인 관점", desc: "용인 거주 에디터가 직접 체험하고 느낀 실전 팁을 공유합니다.", icon: "🏡" },
          { title: "빠른 소식", desc: "지원금, 축제 등 시기를 놓치면 안 되는 정보를 가장 빠르게 전합니다.", icon: "🚀" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="text-3xl mb-6">{item.icon}</div>
            <h3 className="text-lg font-black text-gray-900 mb-3">{item.title}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Detailed Content */}
      <div className="bg-gray-50 rounded-[48px] p-10 lg:p-16 border border-gray-100">
        <div className="prose prose-blue max-w-none">
          <h2 className="text-3xl font-black text-gray-900 mb-8">루미 가이드가 특별한 이유</h2>
          <div className="space-y-10 text-gray-600 font-medium leading-relaxed">
            <p>
              인터넷에는 수많은 정보가 넘쳐나지만, 정작 "우리 동네"에 딱 맞는 실무적인 정보를 찾기란 쉽지 않습니다. 
              <strong>루미 가이드</strong>는 이러한 불편함에서 시작되었습니다.
            </p>
            
            <div>
              <h4 className="text-xl font-black text-gray-900 mb-4">📍 로컬에 집중합니다</h4>
              <p>
                우리는 전국 단위의 정보를 단순 복사하지 않습니다. "용인시청 주차는 주말에 무료인가?", 
                "고기동 카페 거리는 몇 시에 가야 안 막히는가?"와 같은 아주 구체적이고 
                실질적인 로컬 지식을 담는 데 집중합니다.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-black text-gray-900 mb-4">🔍 데이터의 인간화</h4>
              <p>
                딱딱한 행정 용어로 가득한 지원금 공고문을 이웃집 언니가 들려주는 이야기처럼 
                쉽게 풀어냅니다. 누락되기 쉬운 혜택을 찾아내어 시민 여러분께 배달해 드리는 것이 
                루미 가이드의 핵심 미션입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-gray-200">
          <Link href="/blog" className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white text-xl font-black rounded-full shadow-2xl shadow-blue-200 hover:scale-105 transition-all">
            루미의 최신 소식 보기 <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
