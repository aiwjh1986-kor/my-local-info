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
  const displayItems = isScrollable ? [...items, ...items] : items;

  // 자동 스크롤 로직
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isScrollable || isDragging || isHovered) return;

    let animationFrameId: number;
    const scrollSpeed = 0.8;

    const scroll = () => {
      if (!el) return;
      
      el.scrollLeft += scrollSpeed;

      const oneSetWidth = el.scrollWidth / 2;
      if (el.scrollLeft >= oneSetWidth) {
        el.scrollLeft = 0;
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

    const oneSetWidth = el.scrollWidth / 2;
    if (el.scrollLeft >= oneSetWidth) {
      el.scrollLeft -= oneSetWidth;
      setStartX(e.pageX - el.offsetLeft);
      setStartScrollLeft(el.scrollLeft);
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += oneSetWidth;
      setStartX(e.pageX - el.offsetLeft);
      setStartScrollLeft(el.scrollLeft);
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
        className={`flex gap-6 overflow-x-auto no-scrollbar ${isScrollable ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
        style={{ 
          scrollBehavior: isDragging ? "auto" : "smooth",
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
