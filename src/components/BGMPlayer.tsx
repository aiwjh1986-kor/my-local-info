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
    <div className="fixed bottom-[210px] right-6 lg:bottom-[230px] lg:right-6 z-[200] flex flex-col items-center gap-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          togglePlay();
        }}
        className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all border border-white/50 active:scale-95 ${
          isPlaying 
            ? "bg-white text-blue-600 shadow-blue-100" 
            : "bg-gray-100/80 backdrop-blur-md text-gray-400"
        }`}
        style={{ cursor: 'pointer' }}
      >
        <span className={`text-xl lg:text-3xl pointer-events-none ${isPlaying ? "animate-[spin_8s_linear_infinite]" : ""}`}>
          {isPlaying ? "🎵" : "🔇"}
        </span>
      </button>

      <div className={`bg-white/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30 shadow-sm transition-all duration-500 ${
        isPlaying ? "opacity-100" : "opacity-0 scale-90"
      }`}>
        <span className="text-[7px] lg:text-[9px] font-black text-blue-600 uppercase tracking-tighter">
          {isPlaying ? "PLAY" : ""}
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
