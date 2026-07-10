"use client";

import { useState, useEffect } from 'react';

interface GasData {
  name: string;
  price: number;
  brand: string;
}

interface GasResponse {
  suji: GasData | null;
  giheung: GasData | null;
  cheoin: GasData | null;
}

export default function GasPriceWidget() {
  const [data, setData] = useState<GasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Static Export 환경에서 API Route 불가하므로 정적 json을 읽어옵니다.
    // (서버에서 cron 등으로 갱신)
    fetch('/data/gas-prices.json')
      .then(res => {
        if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
        return res.json();
      })
      .then(json => {
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error(json.error || '알 수 없는 오류가 발생했습니다.');
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[32px] p-6 mb-8 shadow-lg flex flex-col items-center justify-center min-h-[150px]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">실시간 최저가 주유소 찾는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-white/60 backdrop-blur-xl border border-red-100 rounded-[32px] p-6 mb-8 shadow-lg flex items-center justify-center">
        <p className="text-red-500 font-bold">⚠️ 주유소 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div id="gas-widget-section" className="w-full bg-gradient-to-br from-blue-50/50 to-white backdrop-blur-xl border border-blue-100/50 rounded-[32px] p-6 lg:p-8 mb-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">⛽</span>
        <h2 className="text-xl lg:text-3xl font-black text-gray-800 tracking-tighter">오늘의 용인시 최저가 주유소</h2>
        <span className="ml-auto bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
          Live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <PriceCard district="수지구" gasData={data.suji} />
        <PriceCard district="기흥구" gasData={data.giheung} />
        <PriceCard district="처인구" gasData={data.cheoin} />
      </div>
      <p className="text-right text-gray-400 text-[10px] mt-4 font-bold">
        * 오피넷(Opinet) 실시간 데이터 기준 (반경 5km)
      </p>
    </div>
  );
}

function PriceCard({ district, gasData }: { district: string; gasData: GasData | null }) {
  if (!gasData) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-gray-100 flex flex-col items-center justify-center opacity-50 min-h-[150px]">
        <span className="text-gray-400 font-bold">{district} 정보 없음</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100/60 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col min-h-[150px]">
      <div className="flex justify-between items-center mb-4">
        <span className="bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          {district}
        </span>
        <span className="text-xs font-bold text-gray-400">
          {gasData.brand}
        </span>
      </div>
      <h3 className="text-lg font-black text-gray-800 mb-3 truncate" title={gasData.name}>
        {gasData.name}
      </h3>
      <div className="mt-auto flex items-baseline gap-1">
        <span className="text-3xl lg:text-4xl font-black text-red-500 tracking-tight">
          {gasData.price.toLocaleString()}
        </span>
        <span className="text-sm font-bold text-gray-400">원/ℓ</span>
      </div>
    </div>
  );
}
