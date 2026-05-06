"use client";

import React from "react";

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
  onClick: () => void;
  isAdmin?: boolean;
  onImageEdit?: (e: React.MouseEvent, card: FeaturedCard) => void;
}

const renderTags = (cat: string) => {
  let label = cat;
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-600";

  if (cat === "grant" || cat === "지원금") {
    label = "지원금";
    bgColor = "bg-orange-100";
    textColor = "text-orange-600";
  } else if (cat === "event" || cat === "행사") {
    label = "행사";
    bgColor = "bg-blue-100";
    textColor = "text-blue-600";
  } else if (cat === "info" || cat === "생활정보") {
    label = "생활정보";
    bgColor = "bg-green-100";
    textColor = "text-green-600";
  } else if (cat === "book" || cat === "도서정보") {
    label = "도서정보";
    bgColor = "bg-purple-100";
    textColor = "text-purple-600";
  }

  return (
    <span className={`${bgColor} ${textColor} text-[10px] px-2 py-0.5 rounded-full font-medium`}>
      {label}
    </span>
  );
};

export const Card = ({ card, onClick, isAdmin, onImageEdit }: CardProps) => (
  <div
    onClick={onClick}
    className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-white/20 cursor-pointer hover:shadow-md transition-all group active:scale-[0.98] w-full"
  >
    <div className="relative aspect-video overflow-hidden bg-gray-50 flex items-center justify-center">
      <img
        src={card.image?.startsWith("http") ? card.image : (IMG_BASE + (card.image || "thumb-youth.png") + "?v=" + V_NUM)}
        alt={card.title}
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 flex gap-1.5 items-center">
        {renderTags(card.category)}
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
              <span className="bg-red-500/90 text-white text-[10px] px-2.5 py-1 rounded-lg font-black animate-pulse shadow-lg shadow-red-200 border border-red-400/50 backdrop-blur-sm">
                마감임박
              </span>
            );
          }
          return null;
        })()}
      </div>
      {isAdmin && card.slug && onImageEdit && (
        <button
          onClick={(e) => onImageEdit(e, card)}
          className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-all z-20 shadow-lg"
          title="이미지 수정"
        >
          📸
        </button>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 whitespace-pre-line">
        {card.title}
      </h3>
      <p className="text-gray-500 text-xs line-clamp-2 mb-3">{card.summary}</p>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <span className="text-[10px] text-gray-400">{card.date}</span>
        <span className="text-blue-500 text-[10px] font-bold">🔍</span>
      </div>
    </div>
  </div>
);
