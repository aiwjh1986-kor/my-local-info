'use client';

import { useEffect, useRef, useState } from 'react';

export default function BGMPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 처음 사용자가 사이트 어디든 클릭하면 재생 시도 (브라우저 정책 대응)
  useEffect(() => {
    const handleFirstClick = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay blocked, waiting for interaction:", err);
        });
      }
      window.removeEventListener('click', handleFirstClick);
    };

    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed top-6 left-32 lg:left-48 z-[200] flex items-center gap-3">
      {/* 🎵 음악 재생 상태 표시 및 조절 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          togglePlay();
        }}
        className={`w-10 h-10 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 active:scale-95 ${
          isPlaying 
            ? "bg-white border-blue-500 text-blue-600 scale-110 shadow-blue-200" 
            : "bg-gray-100 border-gray-300 text-gray-400"
        }`}
        style={{ cursor: 'pointer' }}
      >
        <span className={`text-lg lg:text-3xl pointer-events-none ${isPlaying ? "animate-[spin_8s_linear_infinite]" : ""}`}>
          {isPlaying ? "🎵" : "🔇"}
        </span>
      </button>

      {/* 상태 노출 (필요 시) */}
      <div className={`hidden lg:block bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-sm transition-opacity duration-500 ${
        isPlaying ? "opacity-100" : "opacity-0"
      }`}>
        <span className="text-[10px] lg:text-xs font-black text-gray-800 uppercase tracking-widest">
          LUMI THEME
        </span>
      </div>

      <audio
        ref={audioRef}
        src="/audio/Lumi%20song.mp3"
        loop
        preload="auto"
      />
    </div>
  );
}
