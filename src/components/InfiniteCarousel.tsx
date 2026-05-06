"use client";

import React, { useRef, useEffect, useState } from "react";

interface InfiniteCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  minItemsForScroll?: number;
}

function InfiniteCarousel<T>({ 
  items, 
  renderItem, 
  minItemsForScroll = 5 
}: InfiniteCarouselProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  const isScrollable = items.length >= minItemsForScroll;
  // 끊김 방지를 위해 아이템 세트를 3배로 늘립니다 (넓은 화면 대응)
  const displayItems = isScrollable ? [...items, ...items, ...items] : items;

  // 자동 스크롤 로직
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isScrollable || isDragging || isHovered) return;

    let animationFrameId: number;
    const scrollSpeed = 0.8;

    const scroll = () => {
      if (!el) return;
      
      el.scrollLeft += scrollSpeed;

      // 정확한 한 세트의 너비를 계산 (아이템 간의 gap 포함)
      let oneSetWidth = 0;
      if (el.children.length > items.length) {
        const firstElement = el.children[0] as HTMLElement;
        const secondSetElement = el.children[items.length] as HTMLElement;
        if (firstElement && secondSetElement) {
          oneSetWidth = secondSetElement.offsetLeft - firstElement.offsetLeft;
        }
      }

      if (oneSetWidth > 0 && el.scrollLeft >= oneSetWidth) {
        el.scrollLeft -= oneSetWidth;
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrollable, isDragging, isHovered, items.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || !isScrollable) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    const el = scrollRef.current;
    el.scrollLeft = startScrollLeft - walk;

    let oneSetWidth = 0;
    if (el.children.length > items.length) {
      const firstElement = el.children[0] as HTMLElement;
      const secondSetElement = el.children[items.length] as HTMLElement;
      if (firstElement && secondSetElement) {
        oneSetWidth = secondSetElement.offsetLeft - firstElement.offsetLeft;
      }
    }

    if (oneSetWidth > 0) {
      if (el.scrollLeft >= oneSetWidth * 2) {
        el.scrollLeft -= oneSetWidth;
        setStartX(e.pageX - el.offsetLeft);
        setStartScrollLeft(el.scrollLeft);
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += oneSetWidth;
        setStartX(e.pageX - el.offsetLeft);
        setStartScrollLeft(el.scrollLeft);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="relative w-full overflow-hidden py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
    >
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragStart={(e) => e.preventDefault()}
        className={`flex gap-6 overflow-x-auto no-scrollbar ${isScrollable ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
        style={{ 
          scrollBehavior: "auto",
          userSelect: isDragging ? "none" : "auto"
        }}
      >
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0"
          >
            {renderItem(item, index, isDragging)}
          </div>
        ))}
      </div>
      
      {isScrollable && (
        <>
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F8F9FD] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F8F9FD] to-transparent z-10 pointer-events-none" />
        </>
      )}
    </div>
  );
}

export default InfiniteCarousel;
