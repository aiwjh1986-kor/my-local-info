"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 배포 환경(Static Export 등)에서 API 라우트가 작동하지 않을 경우를 대비하여 
      // 클라이언트 측에서 직접 아이디/비밀번호를 확인합니다.
      const adminId = "wonjihyo86"; // 사용자님의 아이디
      const adminPassword = "password123!"; // 실제 사용하실 비밀번호로 설정하세요

      if (id === adminId && password === adminPassword) {
        // 쿠키 설정 (로그인 유지)
        document.cookie = `is_admin=true; path=/; max-age=${60 * 60 * 24}`;
        // 로그인 성공 시 홈으로 이동하며 새로고침
        window.location.href = "/";
      } else {
        setError("아이디 또는 비밀번호가 틀렸습니다.");
      }
    } catch (err) {
      setError("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2FF] flex items-center justify-center p-5 font-[family-name:var(--font-pretendard)]">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-white">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🏮</div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">관리자 로그인</h1>
          <p className="text-gray-400 text-sm mt-2">아이디와 비밀번호를 입력해 주세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Admin ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center animate-bounce">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-2xl text-lg font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            로그인하기
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
