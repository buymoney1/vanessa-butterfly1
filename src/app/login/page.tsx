"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("register") === "true" ? false : true;
  const [isLogin, setIsLogin] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // ورود
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("ایمیل یا رمز عبور اشتباه است");
        } else {
          toast.success("با موفقیت وارد شدید!");
          router.push("/");
          router.refresh();
        }
      } else {
        // ثبت‌نام
        if (formData.password !== formData.confirmPassword) {
          toast.error("رمز عبور و تأیید آن یکسان نیستند");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("حساب کاربری با موفقیت ایجاد شد!");
          
          // ورود خودکار پس از ثبت‌نام
          await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
          
          router.push("/");
          router.refresh();
        } else {
          toast.error(data.error || "ثبت‌نام ناموفق بود");
        }
      }
    } catch (error) {
      toast.error("مشکلی پیش آمده است");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-[420px]">
        
        {/* لوگو / تیتر بالای کارت */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-gray-900 mb-2 hover:opacity-80 transition-opacity">
            Vanessa<span className="text-gray-400 font-light">Butterfly</span>
          </Link>
        </div>

        {/* کارت فرم اصلی */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          
          {/* تب‌های سوئیچ (Segmented Control) */}
          <div className="p-6 pb-0">
            <div className="bg-gray-100 p-1 rounded-xl flex relative">
              <div 
                className={`absolute inset-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${isLogin ? 'translate-x-0' : 'translate-x-[100%]'}`}
                style={{ width: 'calc(50% - 4px)' }}
              />
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 relative z-10 py-2.5 text-center text-sm font-medium rounded-lg transition-colors duration-300 ${isLogin ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ورود
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 relative z-10 py-2.5 text-center text-sm font-medium rounded-lg transition-colors duration-300 ${!isLogin ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ثبت‌نام
              </button>
            </div>
          </div>

          {/* فرم */}
          <form onSubmit={handleSubmit} className="p-6 pt-6 space-y-5">
            
            {/* فیلد نام (فقط ثبت‌نام) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  نام کامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <FiUser size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                    placeholder="نام خود را وارد کنید"
                    dir="rtl"
                  />
                </div>
              </div>
            )}

            {/* فیلد ایمیل */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ایمیل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                  placeholder="name@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* فیلد رمز عبور */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                رمز عبور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <FiLock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            {/* فیلد تأیید رمز (فقط ثبت‌نام) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  تأیید رمز عبور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    minLength={6}
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* دکمه ارسال */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-black/10"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  پردازش...
                </span>
              ) : (
                <>
                  {isLogin ? "ورود به حساب" : "ایجاد حساب کاربری"}
                  <FiArrowLeft className="rotate-180" size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* لینک بازگشت */}
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <FiArrowRight size={16} className="ml-2" />
            بازگشت به صفحه اصلی
          </Link>
        </div>

      </div>
    </div>
  );
}