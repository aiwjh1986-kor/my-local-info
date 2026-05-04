'use client';
 
import { useEffect, useRef, useState } from 'react';
 
export default function BGMPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // 01~06 음원 목록
  const playlist = [
    '/audio/01.mp3',
    '/audio/02.mp3',
    '/audio/03.mp3',
    '/audio/04.mp3',
    '/audio/05.mp3',
    '/audio/06.mp3',
  ];

  // 처음 로드 시 랜덤 트랙 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * playlist.length);
    setCurrentTrackIndex(randomIndex);
  }, []);
 
  // 사용자의 재생 의사를 기억하기 위한 효과
  useEffect(() => {
    const savedPlayStatus = localStorage.getItem('lumi-bgm-user-stop');
    
    const handleInitialPlay = () => {
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

  // 노래가 끝나면 다음 곡으로 자동 재생
  const handleEnded = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
  };

  // 트랙이 바뀌면 재생 시도
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => console.log("Play failed on track change:", err));
    }
  }, [currentTrackIndex]);
 
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        localStorage.setItem('lumi-bgm-user-stop', 'true');
      } else {
        audioRef.current.play();
        localStorage.setItem('lumi-bgm-user-stop', 'false');
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
          {isPlaying ? `TRACK 0${currentTrackIndex + 1}` : ""}
        </span>
      </div>
 
      <audio
        ref={audioRef}
        src={playlist[currentTrackIndex]}
        onEnded={handleEnded}
        preload="auto"
      />
    </div>
  );
}
