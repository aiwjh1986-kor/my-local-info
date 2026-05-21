"use client";

import { motion } from "framer-motion";
import { Bell, ArrowRight } from "lucide-react";

interface FeaturedCard {
  category: string;
  title: string;
  summary: string;
  date: string;
  region: string;
  cta: string;
  deadline: string | null;
  is_urgent: boolean;
  is_popular: boolean;
  detail?: string;
  content?: string;
  slug?: string;
  link?: string;
  image?: string;
  id?: string;
}

interface NoticeBoardProps {
  setActiveTab: (tab: string) => void;
  onCardClick: (card: FeaturedCard) => void;
  setSearchKeyword?: (keyword: string) => void;
}

export default function NoticeBoard({
  setActiveTab,
  onCardClick,
  setSearchKeyword,
}: NoticeBoardProps) {
  const notices = [
    {
      id: "notice-oil",
      title: "⛽ 실시간 오늘의 주유 가격 업데이트 시스템 적용 완료",
      date: "2026.05.21",
      category: "공지사항",
      badgeColor: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20",
      content: `### ⛽ 용인시 실시간 알뜰 주유비 업데이트 시스템 개통 안내!

안녕하세요! 용인 지역 정보 플랫폼 수석 개발자입니다. 
치솟는 고유가 시대에 우리 용인시민들의 지갑을 든든하게 지켜드리기 위해, 한국석유공사(오피넷) API와 연동된 **[실시간 용인 3개구 최저가 주유소 안내 위젯]**이 메인화면 Hero 섹션에 정식 개통되었습니다!

이제 수지구, 기흥구, 처인구별로 오늘 가장 싼 알뜰 주유소 이름과 실시간 단가를 1초 만에 비교해 보실 수 있습니다.

#### 💡 용인 3대 구별 주유 꿀팁!
- **수지구**: 죽전로 부근 알뜰주유소가 강세를 보입니다.
- **기흥구**: 기흥IC 진입로 부근의 대형 셀프주유소가 가격 경쟁력이 높습니다.
- **처인구**: 도심지 외곽 국도변 주유소들이 상시 최저가를 갱신하고 있습니다.

이 모든 실시간 정보는 매일 아침 자동으로 갱신되며, 메인 화면 최상단 위젯에서 구별 스위치를 클릭해 즉시 확인해 보세요!
용인시민들의 알뜰한 소비 생활을 위해 끊임없이 고도화하는 수석 개발자가 되겠습니다. 감사합니다!`,
    },
    {
      id: "notice-election",
      title: "🗳️ 제9회 전국동시지방선거(6월 3일) 투표소 및 후보자 정보 안내",
      date: "2026.05.18",
      category: "안내",
      badgeColor: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20",
      content: `### 🗳️ 제9회 전국동시지방선거 용인시 투표 및 후보자 총정리

다가오는 **2026년 6월 3일**은 우리 용인의 내일을 결정하는 제9회 전국동시지방선거일입니다. 
용인 시민 여러분의 소중한 한 표 행사를 돕기 위해 투표소 안내 및 최신 후보자동향 정보를 한눈에 알려 드립니다.

#### 📅 주요 일정
- **사전 투표**: 2026년 5월 29일(금) ~ 5월 30일(토) 매일 오전 6시 ~ 오후 6시
- **본 투표일**: 2026년 6월 3일(수) 오전 6시 ~ 오후 6시

#### 📍 용인시 사전투표소 안내
- **수지구**: 수지구청 5층 대회의실, 동천동 주민자치센터 등 각 동 주민센터
- **기흥구**: 기흥구청 2층 다목적실, 신갈동/보정동 행정복지센터 등
- **처인구**: 처인구청 대강당, 포곡읍/모현읍 행정복지센터 등

#### 🔍 후보자 핵심 공약 동향
현재 용인시장 선거는 재선에 도전하는 **이상일 후보**와 정책 대안을 내세운 **현근택 후보** 간의 팽팽한 2파전 구도가 확정되었습니다.
- **이상일 후보**: 용인 반도체 클러스터 고속도로 조기 착공, 수지·기흥 노후도시 특별법 재건축 신속 추진 공약
- **현근택 후보**: 용인 청년 기본소득 부활, 구별 맞춤형 공공 보육 거점 센터 대폭 확충 공약

시민 여러분의 현명한 선택을 위해 중앙선거관리위원회 공식 사이트와 연동된 상세 후보 공약집 링크를 준비했으니 참고하셔서 소중한 주권을 행사해 주세요!`,
      link: "https://www.nec.go.kr",
    },
    {
      id: "notice-bus",
      title: "🎡 용인 에버랜드 장미축제 맞춤 교통 셔틀버스 운행 시간표",
      date: "2026.05.15",
      category: "이벤트",
      badgeColor: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20",
      content: `### 🌹 2026 에버랜드 장미축제 셔틀버스 & 교통편 핵심 요약

용인의 대표 자랑거리 에버랜드에서 눈부신 장미의 향연이 시작되었습니다!
주말 극심한 교통난과 주차난으로 인한 시민분들의 고충을 덜어드리기 위해 용인시와 에버랜드가 협력하여 **[장미축제 특별 맞춤 셔틀버스]**를 대대적으로 긴급 운행합니다.

#### 🚌 용인 권역 무료 셔틀버스 노선 정보
1. **수지 노선**: 수지구청역 ➔ 동천역 ➔ 에버랜드 정문 (30분 간격 운행)
2. **기흥 노선**: 기흥역(수인분당선) ➔ 구성역 ➔ 에버랜드 정문 (20분 간격 운행)
3. **용인 터미널 노선**: 용인공용버스터미널 ➔ 운동장·송담대역 ➔ 에버랜드 정문 (15분 간격 운행)

#### ⏰ 운행 시간표 (장미축제 기간 내 주말/공휴일 적용)
- **첫차**: 출발지 기준 오전 08:30 분부터
- **막차**: 에버랜드 정문 회차지 기준 밤 22:30 분까지 (야간 개장 종료 30분 후까지 지원)

#### 🚗 자차 이용 시 꿀팁!
- 에버랜드 공식 유료 주차장은 오전 10시면 만차가 됩니다.
- 외곽에 마련된 **무료 외곽 주차장(1A, 1B, 2, 3, 4번 주차장)**에 주차하신 후 상시 운행하는 에버랜드 무료 셔틀버스를 타고 이동하시는 것이 대기 시간을 평균 40분 이상 아낄 수 있는 지혜입니다!

싱그러운 5월, 가족들과 연인들과 함께 꽃향기 가득한 주말을 에버랜드에서 스트레스 없이 즐겨 보세요!`,
    },
    {
      id: "notice-youth",
      title: "💰 2026 상반기 용인 청년 소상공인 사업안정 지원금 추가 신청 안내",
      date: "2026.05.12",
      category: "지원금",
      badgeColor: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
      content: `### 💰 2026 상반기 용인 청년 소상공인 사업안정 지원금 신청 가이드

금리 인상과 경기 침체 속에서 꿋꿋하게 자리를 지키며 땀 흘리고 계시는 우리 용인의 자랑스러운 청년 소상공인들을 위해 용인시에서 **[사업안정자금 추가 긴급 지원]** 정책을 공고했습니다!
지원 예산 소진 시 조기 마감될 수 있으니 지원 대상 여부를 꼭 확인하시고 서둘러 신청해 주세요.

#### 👤 지원 대상자 자격 요건
1. **나이**: 만 19세 이상 ~ 만 39세 이하의 청년 사업자
2. **주소지**: 공고일 기준 용인시에 주민등록 및 사업장 소재지를 두고 영업 중인 자
3. **매출액**: 연간 매출액 3억 원 이하의 영세 소상공인
4. **업종**: 상시 근로자 수 5인 미만의 전 업종 (단, 사행성 및 사치성 업종 등 일부 업종은 제외)

#### 💵 지원 혜택 및 규모
- **일시불 현금 150만 원 무상 지급** (사업장 임대료 및 공공요금 보조 목적)
- 특례 보증 신용 대출 연동 시 연 2.5% 수준의 이자 차액 추가 지원(이차보전)

#### 📝 제출 서류 및 신청 방법
- **필수 제출 서류**: 사업자등록증명원, 부가가치세과세표준증명, 주민등록초본, 신분증 사본
- **신청 방법**: 용인시청 일자리 정책과 온라인 portal 접수 또는 관할 주민센터 방문 접수

힘든 시기일수록 우리 용인시민 모두가 서로를 밀어주고 끌어주며 극복해 나가기를 진심으로 바랍니다. 청년 사장님들 모두 힘내세요!`,
      link: "https://www.yongin.go.kr",
    },
  ];

  const handleNoticeClick = (notice: typeof notices[0]) => {
    const dummyCard: FeaturedCard = {
      id: notice.id,
      category: notice.category,
      title: notice.title,
      summary: notice.title.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "").trim(),
      date: notice.date,
      region: "용인시 전역",
      cta: "자세히 보기",
      deadline: null,
      is_urgent: true,
      is_popular: true,
      content: notice.content,
      detail: notice.content,
      image: notice.id === "notice-oil" 
        ? "everland_roses_thumb.png" 
        : notice.id === "notice-election"
          ? "gksrkd_01.png"
          : notice.id === "notice-bus"
            ? "everland_roses_thumb.png"
            : "library_booktalk_thumb.png",
      link: notice.link,
    };
    onCardClick(dummyCard);
  };

  return (
    <section className="py-12 max-w-[1400px] mx-auto px-6">
      <div className="premium-glass p-8 sm:p-10 rounded-[36px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-[#000000]/05 dark:border-[#FFFFFF]/05 relative overflow-hidden group">
        {/* 장식용 화사한 광채 장식 */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-accent/8 transition-all duration-700" />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-accent-purple animate-swing" />
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-[family-name:var(--font-noto-serif-kr)] tracking-tight">
                  용인시 주요 공지 및 뉴스
                </h3>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold leading-relaxed">
                클릭하시면 신청 링크, 일정 및 혜택 등 **세부 내용이 가득한 특별 모달**을 바로 확인하실 수 있습니다.
              </p>
            </div>
            
            <button
              onClick={() => {
                setActiveTab("블로그");
                if (setSearchKeyword) setSearchKeyword("");
                window.history.pushState({}, "", "/?tab=블로그");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="premium-glass px-5 py-2.5 rounded-full hover:premium-glass-hover hover:scale-102 transition-all font-black text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <span>전체 게시글 보러가기</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent-purple" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {notices.map((notice) => (
              <motion.div
                key={notice.id}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleNoticeClick(notice)}
                className="p-6 rounded-3xl bg-white/70 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 border border-gray-100/60 dark:border-gray-700/30 transition-all flex flex-col justify-between h-[180px] cursor-pointer hover:shadow-xl group/card relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-accent to-accent-purple opacity-0 group-hover/card:opacity-100 transition-opacity" />
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${notice.badgeColor}`}>
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">{notice.date}</span>
                  </div>
                  <h4 className="text-[13px] font-black text-gray-800 dark:text-gray-100 leading-snug group-hover/card:text-accent dark:group-hover/card:text-accent-purple transition-colors line-clamp-3">
                    {notice.title}
                  </h4>
                </div>
                
                <span className="text-[10px] font-black text-accent dark:text-accent-purple group-hover/card:underline flex items-center gap-0.5 self-end mt-2">
                  상세 가이드 읽기 ➔
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
