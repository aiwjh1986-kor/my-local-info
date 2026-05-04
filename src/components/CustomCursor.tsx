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
      
      {/* 1. 바깥 원 (살짝 뒤따라오는 느낌) */}
      <div
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-accent/40 pointer-events-none z-[9999] transition-all duration-150 ease-out ${
          isHovered ? "scale-150 bg-accent/10 border-accent" : "scale-100"
        } ${isActive ? "scale-90" : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate3d(-50%, -50%, 0)`,
        }}
      />

      {/* 2. 안쪽 점 (실시간 즉각 반응) */}
      <div
        className={`fixed top-0 left-0 w-1.5 h-1.5 bg-accent rounded-full pointer-events-none z-[10000] ${
          isActive ? "scale-150" : "scale-100"
        } transition-transform duration-100`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate3d(-50%, -50%, 0)`,
        }}
      />
    </>
  );
}
