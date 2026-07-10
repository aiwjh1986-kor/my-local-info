"use client";

import { useState, useEffect } from "react";
import { ToiletInfo, fetchNearbyToilets } from "@/utils/toilet";

export default function ToiletFinderPage() {
  const [toilets, setToilets] = useState<ToiletInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const findMyToilets = () => {
    setLoading(true);
    setErrorMsg("");
    setToilets([]);

    if (!navigator.geolocation) {
      setErrorMsg("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        try {
          const result = await fetchNearbyToilets(lat, lng);
          if (result.length === 0) {
            setErrorMsg("주변 10km 이내에 화장실을 찾지 못했습니다.");
          } else {
            setToilets(result);
          }
        } catch (err) {
          setErrorMsg("화장실 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        let errMsg = "위치 정보를 가져올 수 없습니다.";
        if (error.code === error.PERMISSION_DENIED) errMsg = "위치 정보 제공(GPS)에 동의해주세요.";
        setErrorMsg(errMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-gray-900 pb-20 font-pretendard">
      <div className="bg-white px-5 py-4 flex items-center shadow-sm sticky top-0 z-50">
        <button 
          onClick={() => window.history.back()} 
          className="mr-3 text-xl font-bold text-gray-700 p-2 -ml-2 active:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h1 className="font-extrabold text-lg tracking-tight">내 주변 공중화장실 찾기</h1>
      </div>

      <div className="p-5 flex flex-col items-center">
        <div className="bg-white p-6 rounded-3xl shadow-sm w-full mb-6 border border-gray-100 text-center">
          <div className="text-4xl mb-3">🧻</div>
          <h2 className="text-[15px] font-bold text-gray-800 mb-2">급할 때 가장 빠른 해결책!</h2>
          <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
            아래 버튼을 눌러 내 위치를 허용해주시면,<br />현재 계신 곳에서 가장 가까운 화장실을 찾아드려요.
          </p>
          <button 
            onClick={findMyToilets}
            disabled={loading}
            className="w-full bg-[#A855F7] text-white py-3.5 rounded-2xl font-bold text-[15px] shadow-md shadow-purple-500/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>위치 탐색 및 불러오는 중...</span>
              </>
            ) : (
              "내 주변 화장실 바로 찾기"
            )}
          </button>
          {errorMsg && <div className="text-red-500 text-xs mt-3 font-bold bg-red-50 p-2 rounded-lg">{errorMsg}</div>}
        </div>

        {toilets.length > 0 && (
          <div className="w-full">
            <h3 className="font-bold text-[14px] text-gray-700 mb-3 ml-1 flex justify-between items-end">
              <span>가장 가까운 화장실 TOP 20</span>
              {userLocation && <span className="text-[10px] font-normal text-gray-400">내 위치 수신 완료</span>}
            </h3>
            <div className="flex flex-col gap-3">
              {toilets.map((t, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#A855F7]/10 text-[#A855F7] text-[10px] font-black px-3 py-1 rounded-bl-xl">
                    {t.distance ? `${t.distance.toFixed(1)} km` : '거리 알수없음'}
                  </div>
                  <h4 className="font-bold text-[15px] text-gray-900 pr-16 leading-tight mb-1">{t.toiletNm}</h4>
                  <div className="text-[12px] text-gray-500 mb-3 line-clamp-1">{t.rdnmadr}</div>
                  
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      개방: {t.openTime}
                    </span>
                    <span className={`px-2 py-1 rounded-md ${t.unisexToiletYn === 'Y' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      {t.unisexToiletYn === 'Y' ? '남녀공용' : '남녀분리'}
                    </span>
                  </div>

                  <a 
                    href={`https://map.kakao.com/link/map/${encodeURIComponent(t.toiletNm)},${t.latitude},${t.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold py-2 rounded-xl text-center transition-colors"
                  >
                    카카오맵으로 길찾기
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
