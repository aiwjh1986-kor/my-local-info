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

    window.addEventListener("mousemove", onMouseMove);
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
        body {
          cursor: none !important;
        }
        a, button, [role="button"] {
          cursor: none !important;
        }
      `}</style>
      <div
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-accent/30 pointer-events-none z-[9999] transition-transform duration-300 ease-out flex items-center justify-center ${
          isHovered ? "scale-150 bg-accent/10 border-accent" : "scale-100"
        } ${isActive ? "scale-90" : ""}`}
        style={{
          transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) ${
            isHovered ? "scale(1.5)" : "scale(1)"
          }`,
        }}
      >
        <div className={`w-1 h-1 bg-accent rounded-full ${isActive ? "scale-150" : "scale-100"} transition-transform`} />
      </div>
    </>
  );
}
