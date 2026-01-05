"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiMinus, FiPlus, FiLoader, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({ productId, disabled = false, className = "" }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!session) {
      toast.error("لطفاً ابتدا وارد حساب کاربری شوید", {
        position: "bottom-center",
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px 24px',
          fontSize: '14px',
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheck className="text-green-600" size={14} />
            </div>
            <span>محصول با موفقیت به سبد خرید اضافه شد</span>
          </div>,
          {
            position: "bottom-center",
            duration: 2000,
            style: {
              background: '#10b981',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }
        );
        
        // انیمیشن موفقیت
        setAdded(true);
        
        // تاخیر 1.5 ثانیه و سپس هدایت به صفحه سبد خرید
        setTimeout(() => {
          router.push("/cart");
          router.refresh(); // رفرش برای به روزرسانی سبد خرید
        }, 1500);
        
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "خطا در برقراری ارتباط با سرور", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("مشکلی پیش آمده است", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* شمارنده تعداد */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 font-medium">تعداد:</div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDecrement}
            disabled={disabled || quantity <= 1 || isLoading || added}
            className={`
              w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
              ${disabled || quantity <= 1 || isLoading || added
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:scale-95"
              }
            `}
          >
            <FiMinus size={18} />
          </button>
          
          <div className="relative">
            <div className="w-16 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-900 font-bold text-lg">
              {quantity}
            </div>
            <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          <button
            onClick={handleIncrement}
            disabled={disabled || isLoading || added}
            className={`
              w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
              ${disabled || isLoading || added
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:scale-95"
              }
            `}
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>

      {/* دکمه اصلی */}
      <button
        onClick={handleAddToCart}
        disabled={disabled || isLoading || added}
        className={`
          relative w-full h-14 rounded-2xl font-semibold flex items-center justify-center gap-3 
          transition-all duration-300 overflow-hidden group
          ${disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            : added
              ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
              : isLoading
                ? "bg-gray-700 text-white"
                : "bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-2xl hover:shadow-gray-900/30 hover:scale-[1.02] active:scale-[0.98]"
          }
        `}
      >
        {/* افکت پس‌زمینه */}
        {!disabled && !added && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-black to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}
        
        {/* محتوای دکمه */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isLoading ? (
            <>
              <FiLoader className="animate-spin" size={22} />
              <span className="text-base">در حال افزودن...</span>
            </>
          ) : added ? (
            <>
              <div className="animate-bounce">
                <FiCheck size={22} />
              </div>
              <span className="text-base">در حال انتقال...</span>
            </>
          ) : disabled ? (
            <>
              <FiShoppingCart size={22} />
              <span className="text-base">ناموجود</span>
            </>
          ) : (
            <>
              <FiShoppingCart 
                size={22} 
                className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" 
              />
              <span className="text-base">افزودن به سبد خرید</span>
            </>
          )}
        </div>

        {/* خط زیرین انیمیشنی */}
        {!disabled && !added && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}
      </button>
    </div>
  );
}