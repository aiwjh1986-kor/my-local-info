import Link from "next/link";

const V_NUM = "12";
const IMG_BASE = "/images/";

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
  endDate?: string | null;
}

interface CardProps {
  card: FeaturedCard;
  onClick?: () => void;
  isAdmin?: boolean;
  onImageEdit?: (e: React.MouseEvent, card: FeaturedCard) => void;
  href?: string;
}

const renderTags = (cat: string) => {
  let label = cat;
  let tagStyles = "bg-gray-100 text-gray-600 border border-gray-200/50";
  
  if (cat === "grant" || cat === "지원금") {
    label = "지원금";
    tagStyles = "bg-[#FFF0EB] text-[#FF6B35] border border-[#FFE0D5]";
  } else if (cat === "event" || cat === "행사" || cat === "지역행사") {
    label = "지역행사";
    tagStyles = "bg-[#EBF5FF] text-[#0066CC] border border-[#D5EBFF]";
  } else if (cat === "info" || cat === "생활정보") {
    label = "생활정보";
    tagStyles = "bg-[#EDF7ED] text-[#2E7D32] border border-[#DBEED9]";
  } else if (cat === "book" || cat === "도서정보") {
    label = "도서정보";
    tagStyles = "bg-[#F7EEFF] text-[#7B1FA2] border border-[#EED7FF]";
  } else if (cat === "world" || cat === "세계 경제") {
    label = "세계 경제";
    tagStyles = "bg-[#FFF0F2] text-[#E53935] border border-[#FFE0E4]";
  } else if (cat === "election" || cat === "지방선거") {
    label = "지방선거";
    tagStyles = "bg-[#E6F8F8] text-[#008080] border border-[#C6F1F1]";
  }

  return (
    <span className={`${tagStyles} text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wide`}>
      {label}
    </span>
  );
};

export const Card = ({ card, onClick, isAdmin, onImageEdit, href }: CardProps) => {
  const CardContent = (
    <div className="flex flex-col h-full bg-white border border-gray-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.015)] rounded-[24px] overflow-hidden transition-all duration-300">
      {/* 썸네일 영역 */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
        <img
          src={card.image?.startsWith("http") ? card.image : (IMG_BASE + (card.image || "thumb-youth.png") + "?v=" + V_NUM)}
          alt={card.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
        />
        <div className="absolute top-4 left-4 flex gap-1.5 items-center">
          {renderTags(card.category)}
        </div>
        
        {/* 마감임박 태그 (미니멀 레드) */}
        {(() => {
          const todayDate = new Date();
          const targetDate = card.endDate || card.deadline;
          let autoUrgent = false;

          if (card.title.includes("[종료]")) return null;

          if (targetDate) {
            const dDate = new Date(targetDate);
            const diffTime = dDate.getTime() - todayDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 7) autoUrgent = true;
          }

          if (card.is_urgent || autoUrgent) {
            return (
              <span className="absolute bottom-4 right-4 bg-red-500 text-white text-[9.5px] px-2.5 py-1 rounded-full font-bold tracking-wide shadow-sm border border-red-400">
                마감임박
              </span>
            );
          }
          return null;
        })()}

        {isAdmin && card.slug && onImageEdit && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onImageEdit(e, card);
            }}
            className="absolute top-4 right-4 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-20 border border-white/10"
            title="이미지 수정"
          >
            📸
          </button>
        )}
      </div>
      
      {/* 텍스트 영역 */}
      <div className="p-5 flex flex-col flex-grow bg-white">
        <h3 className="font-bold text-gray-800 text-[14.5px] leading-[1.45] mb-2.5 group-hover:text-blue-600 transition-colors line-clamp-2 tracking-tight">
          {card.title}
        </h3>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4 font-semibold">
          {card.summary}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/60">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{card.date.replace(/-/g, '.')}</span>
          <span className="text-gray-400 text-[10px] font-bold tracking-wide">
            {card.category === 'world' ? '6 min read' : '5 min read'}
          </span>
        </div>
      </div>
    </div>
  );

  const containerClass = "block rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] w-full h-full";

  if (href) {
    return (
      <Link 
        href={href}
        className={containerClass}
      >
        {CardContent}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className={containerClass}
    >
      {CardContent}
    </div>
  );
};
