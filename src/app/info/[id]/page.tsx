import Link from "next/link";
import data from "../../../../public/data/local-info.json";
import { notFound } from "next/navigation";

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

// 정적 배포를 위해 미리 경로(ID)를 생성합니다.
export async function generateStaticParams() {
  const allItems = [...data.events, ...data.benefits];
  return allItems.map((item) => ({
    id: item.id,
  }));
}

export default async function InfoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allItems: InfoItem[] = [...data.events, ...data.benefits];
  const item = allItems.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  const isEvent = item.category === "행사";
  const bgColor = isEvent ? "bg-orange-500" : "bg-green-500";
  const hoverBgColor = isEvent ? "hover:bg-orange-600" : "hover:bg-green-600";
  const tagBgColor = isEvent ? "bg-orange-100" : "bg-green-100";
  const tagTextColor = isEvent ? "text-orange-700" : "text-green-700";

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-900 pb-20">
      {/* 상단 네비게이션 */}
      <nav className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-orange-600 font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span>⬅️</span>
            <span>목록으로 돌아가기</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <article className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          {/* 상단 장식 바 */}
          <div className={`h-4 ${bgColor} w-full`}></div>
          
          <div className="p-8 md:p-12">
            {/* 카테고리 태그 */}
            <div className={`inline-block px-4 py-1.5 rounded-full ${tagBgColor} ${tagTextColor} text-sm font-bold mb-6`}>
              {item.category}
            </div>

            {/* 제목 */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
              {item.name}
            </h1>

            {/* 주요 정보 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl mb-10">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">기간</p>
                    <p className="text-gray-700 font-medium">{item.startDate} ~ {item.endDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">장소</p>
                    <p className="text-gray-700 font-medium">{item.location}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">대상</p>
                    <p className="text-gray-700 font-medium">{item.target}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="prose prose-orange max-w-none mb-12">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span> 상세 내용
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                {item.summary}
                {"\n\n"}
                본 정보는 공공데이터포털을 통해 제공되는 성남시의 공식 정보입니다. 
                행사 일정이나 혜택 조건은 주관 부서의 사정에 따라 변경될 수 있으므로, 
                반드시 아래 원본 사이트의 공지사항을 확인해 주시기 바랍니다.
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
              <a 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 text-center py-4 px-6 rounded-2xl ${bgColor} text-white font-bold text-lg ${hoverBgColor} transition-all shadow-lg hover:shadow-xl active:scale-[0.98]`}
              >
                자세히 보기 →
              </a>
            </div>
          </div>
        </article>

        {/* 하단 안내 */}
        <p className="text-center text-gray-400 text-sm mt-8">
          정보 오류 제보 및 문의는 성남시청 홈페이지를 이용해 주세요.
        </p>
      </main>
    </div>
  );
}
