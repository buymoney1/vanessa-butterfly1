"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // اضافه شده
import { useState } from "react";
import { FiHome, FiShoppingBag, FiUser, FiLogOut, FiMenu, FiX, FiPlus } from "react-icons/fi";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter(); // اضافه شده
  
  const isAdmin = session?.user?.role === "ADMIN";

  // تابع کمکی برای بستن منو و ناوبری
  const handleMobileLinkClick = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // تاخیر کوتاه برای بسته شدن انیمیشن منو قبل از ناوبری
    setTimeout(() => {
      router.push(href);
    }, 200); // 200ms برای انیمیشن بسته شدن
  };

  // تابع کمکی برای خروج
  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 200);
  };

  // لودینگ بسیار مینیمال
  if (status === "loading") {
    return (
      <nav className="h-20 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        
        {/* لوگو */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="font-bold text-lg">V</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
            Vanessa<span className="text-gray-400 font-light">Butterfly</span>
          </span>
        </Link>

        {/* منوی دسکتاپ */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            صفحه اصلی
          </Link>
          
          {/* لینک مدیریت فقط برای ادمین */}
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
            >
              <FiPlus size={14} />
              <span>پنل مدیریت</span>
            </Link>
          )}
        </div>

        {/* بخش کاربر و اکشن‌ها */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* سبد خرید */}
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-black transition-colors">
            <FiShoppingBag size={22} />
            <span className="absolute top-1 right-0 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
          </Link>

          {session ? (
            // وضعیت لاگین شده
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right leading-none">
                  <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{isAdmin ? "مدیر سیستم" : "کاربر"}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
                  <FiUser size={20} />
                </div>
              </div>
              
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <FiLogOut size={18} />
                <span>خروج</span>
              </button>
            </div>
          ) : (
            // وضعیت مهمان
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                ورود
              </Link>
              <Link
                href="/login?register=true"
                className="text-sm font-medium text-white bg-black px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
              >
                ثبت‌نام
              </Link>
            </div>
          )}
        </div>

        {/* دکمه منوی موبایل */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

      </div>

      {/* منوی موبایل (پنهان/آشکار) */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 md:hidden shadow-xl animate-in slide-in-from-top-2">
          {/* استفاده از دکمه‌ها به جای لینک‌ها برای جلوگیری از ریلود */}
          <button 
            onClick={(e) => handleMobileLinkClick(e, "/")}
            className="text-right text-base font-medium text-gray-900 py-2 hover:text-black transition-colors"
          >
            صفحه اصلی
          </button>
          
          {isAdmin && (
            <button 
              onClick={(e) => handleMobileLinkClick(e, "/admin")}
              className="justify-start text-right text-base font-medium text-purple-600 py-2 flex items-center justify-end gap-2 hover:text-purple-700 transition-colors"
            >
              <FiPlus /> پنل مدیریت
            </button>
          )}

          <button 
            onClick={(e) => handleMobileLinkClick(e, "/cart")}
            className="justify-start text-right text-base font-medium text-gray-900 py-2 flex items-center justify-end gap-2 hover:text-black transition-colors"
          >
            <FiShoppingBag /> سبد خرید
          </button>

          <div className="h-px bg-gray-100 my-2"></div>

          {session ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <FiUser size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">خوش آمدید</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-right py-3 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
              >
                خروج از حساب
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <button 
                onClick={(e) => handleMobileLinkClick(e, "/login")}
                className="w-full text-right py-3 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
              >
                ورود
              </button>
              <button 
                onClick={(e) => handleMobileLinkClick(e, "/login?register=true")}
                className="w-full text-right py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
              >
                ثبت‌نام
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}