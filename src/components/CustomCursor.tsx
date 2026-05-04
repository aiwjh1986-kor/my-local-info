"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a") ||
        target.style.cursor === "pointer"
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseDown = () => setIsActive(true);
    const onMouseUp = () => setIsActive(false);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      {/* 1. 바깥 원 (커진 크기에 맞춰 조절) */}
      <div
        className={`fixed top-0 left-0 w-20 h-20 rounded-full border-2 border-accent/20 pointer-events-none z-[9999] transition-all duration-150 ease-out ${
          isHovered ? "scale-125 bg-accent/5 border-accent/40" : "scale-100"
        } ${isActive ? "scale-90" : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate3d(-50%, -50%, 0)`,
        }}
      />

      {/* 2. 사용자 정의 이미지 커서 (클릭 지점을 끝쪽으로 조정) */}
      <div
        className={`fixed top-0 left-0 w-[72px] h-[72px] pointer-events-none z-[10000] ${
          isActive ? "scale-90" : "scale-100"
        } transition-transform duration-75 ease-out`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          // 클릭 지점을 이미지 끝부분(0,0)으로 정확히 고정
          transform: `translate3d(0, 0, 0) ${isHovered ? "scale(1.15)" : "scale(1)"}`,
        }}
      >
        <img 
          src="/images/mouse.png" 
          alt="cursor" 
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as any).style.display = 'none';
          }}
        />
      </div>
    </>
  );
}
