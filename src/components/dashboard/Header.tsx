"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("홈");
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  // 현재 탭 및 테마, 관리자 상태 로드
  useEffect(() => {
    // 탭 파라미터 감지
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("홈");
    }

    // 테마 설정 감지
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);

    // 관리자 쿠키 감지
    const isAdminCookie = document.cookie.split('; ').find(row => row.startsWith('is_admin='));
    if (isAdminCookie && isAdminCookie.split('=')[1] === 'true') {
      setIsAdmin(true);
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchParams]);

  // 다크모드 토글
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsAdmin(false);
    window.location.reload();
  };

  const navItems = [
    { id: "홈", label: "홈", path: "/" },
    { id: "지원금", label: "지원금", path: `/?tab=${encodeURIComponent("지원금")}` },
    { id: "지역행사", label: "지역행사", path: `/?tab=${encodeURIComponent("지역행사")}` },
    { id: "생활정보", label: "생활정보", path: `/?tab=${encodeURIComponent("생활정보")}` },
    { id: "도서정보", label: "도서정보", path: `/?tab=${encodeURIComponent("도서정보")}` },
    { id: "블로그", label: "블로그", path: `/?tab=${encodeURIComponent("블로그")}` },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id);
    router.push(item.path);

  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 ${
          scrolled
            ? "py-3 bg-[#F8FAFC]/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-[#000000]/05 dark:border-[#FFFFFF]/05 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
            : "py-5 bg-white/40 dark:bg-transparent border-b border-[#000000]/03 dark:border-transparent backdrop-blur-sm dark:backdrop-blur-none"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          {/* 좌측: 로고 */}
          <div className="flex items-center gap-4">

            {/* 프리미엄 로고 */}
            <div
              onClick={() => {
                setActiveTab("홈");
                router.push("/");
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-accent-purple flex items-center justify-center shadow-lg shadow-accent/20 overflow-hidden">
                <span className="text-white font-extrabold text-lg group-hover:scale-110 transition-transform">L</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15.5px] font-black tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                  LUMI PORTAL
                </span>
                <span className="text-[9.5px] font-bold text-accent dark:text-accent-purple uppercase tracking-wider -mt-0.5">
                  Yongin Guide
                </span>
              </div>
            </div>
          </div>

          {/* 중앙: 내비게이션 (데스크탑) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#FFFFFF]/50 dark:bg-[#0F172A]/30 p-1.5 rounded-2xl border border-gray-200/40 dark:border-[#FFFFFF]/05 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeTab === item.id && pathname === "/";
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-[#0F172A]/70 dark:text-[#F1F5F9]/70 hover:text-[#0F172A] dark:hover:text-[#F1F5F9]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-gradient-to-r from-accent to-accent-purple rounded-xl shadow-md z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 우측: 다크모드 토글, 관리자, 검색 */}
          <div className="flex items-center gap-2.5">
            {/* 다크모드 토글 */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 text-[#0F172A]/80 dark:text-[#F1F5F9]/80 shadow-sm transition-all hover:scale-105 active:scale-95"
              aria-label="화면 모드 변경"
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* 관리자 프로필 / 로그인 */}
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl text-xs font-black transition-all border border-red-100/50 dark:border-red-900/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            ) : (
              <a
                href="/admin"
                className="p-2.5 rounded-xl bg-[#FFFFFF]/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 text-[#0F172A]/80 dark:text-[#F1F5F9]/80 shadow-sm transition-all hover:scale-105 active:scale-95"
                aria-label="관리자 로그인"
              >
                <User className="w-[18px] h-[18px]" />
              </a>
            )}
          </div>
        </div>
      </motion.header>


    </>
  );
}
