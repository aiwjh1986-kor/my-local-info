'use client';
 
import { useEffect, useRef, useState } from 'react';
 
export default function BGMPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
 
  // 사용자의 재생 의사를 기억하기 위한 효과
  useEffect(() => {
    const savedPlayStatus = localStorage.getItem('lumi-bgm-user-stop');
    
    const handleInitialPlay = () => {
      // 사용자가 수동으로 정지한 기록이 없을 때만 자동 재생 시도
      if (audioRef.current && !hasInteracted && savedPlayStatus !== 'true') {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        }).catch(err => {
          console.log("Autoplay blocked, waiting for interaction:", err);
        });
      }
      window.removeEventListener('click', handleInitialPlay);
    };
 
    if (savedPlayStatus !== 'true') {
      window.addEventListener('click', handleInitialPlay);
    }
    
    return () => window.removeEventListener('click', handleInitialPlay);
  }, [hasInteracted]);
 
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        localStorage.setItem('lumi-bgm-user-stop', 'true'); // 사용자가 정지했음을 기억
      } else {
        audioRef.current.play();
        localStorage.setItem('lumi-bgm-user-stop', 'false'); // 다시 재생 의사 표시
      }
      setIsPlaying(!isPlaying);
      setHasInteracted(true);
    }
  };
 
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2">
      {/* 🎵 음악 재생 상태 표시 및 조절 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          togglePlay();
        }}
        className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 active:scale-95 ${
          isPlaying 
            ? "bg-white border-blue-500 text-blue-600 scale-110 shadow-blue-200" 
            : "bg-gray-100 border-gray-300 text-gray-400"
        }`}
        style={{ cursor: 'pointer' }}
      >
        <span className={`text-xl lg:text-3xl pointer-events-none ${isPlaying ? "animate-[spin_8s_linear_infinite]" : ""}`}>
          {isPlaying ? "🎵" : "🔇"}
        </span>
      </button>
 
      {/* 상태 노출 */}
      <div className={`bg-white/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-sm transition-all duration-500 ${
        isPlaying ? "opacity-100 translate-y-0" : "opacity-40 -translate-y-1 scale-90"
      }`}>
        <span className="text-[8px] lg:text-[10px] font-black text-gray-800 uppercase tracking-widest whitespace-nowrap">
          {isPlaying ? "LUMI THEME PLAYING" : "MUSIC PAUSED"}
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
