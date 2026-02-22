"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiCopy,
  FiX,
  FiCreditCard,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    shippingCost?: number;
    images: string[];
    inStock: boolean;
    code: string; // اضافه شده
  };
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  /* ================= AUTH + FETCH ================= */
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    fetchCartItems();
  }, [status, session]);

  const fetchCartItems = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCartItems(data);
    } catch {
      toast.error("خطا در بارگذاری سبد خرید");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= ACTIONS ================= */
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );

    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("خطا در به‌روزرسانی تعداد");
      fetchCartItems();
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setCartItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      toast.success("محصول حذف شد");
    } catch {
      toast.error("خطا در حذف محصول");
    }
  };

  /* ================= TOTALS ================= */
  const productsTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shippingTotal = cartItems.reduce(
    (sum, item) =>
      sum + (item.product.shippingCost || 0) * item.quantity,
    0
  );

  const total = productsTotal + shippingTotal;

  const copyCardNumber = () => {
    navigator.clipboard.writeText("6219861934943506");
    toast.success("شماره کارت کپی شد");
  };

  /* ================= WHATSAPP MESSAGE ================= */
  // ایجاد پیام واتساپ با کدهای محصولات
  const productCodes = cartItems
    .map(item => `کد ${item.product.code}: ${item.quantity} عدد`)
    .join('\n');

  const whatsappMessage = `سلام، مبلغ ${total.toLocaleString()} تومان را به شماره کارت 6219861934943506 واریز کردم.

محصولات خریداری شده:
${productCodes}

فیش را ارسال می‌کنم.`;

  const encodedMessage = encodeURIComponent(whatsappMessage);

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">
            در حال بارگذاری سبد خرید...
          </p>
        </div>
      </div>
    );
  }

  /* ================= PAGE ================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-20 pt-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              سبد خرید شما
            </h1>
            <p className="text-gray-500 mt-2">
              {cartItems.length} محصول در سبد خرید
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              ادامه خرید
            </button>
          )}
        </div>

        {/* Empty */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 mx-auto">
              <FiShoppingBag size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              سبد خرید شما خالی است
            </h2>
            <p className="text-gray-500 mb-8">
              محصولات مورد علاقه خود را به سبد خرید اضافه کنید
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              مشاهده محصولات
              <FiArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Products */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const imageUrl =
                  item.product.images?.[0] || "/placeholder.svg";

                return (
<div
  key={item.id}
  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-gray-200 transition-colors group"
>
  <div className="flex flex-col sm:flex-row gap-4">
    {/* Image */}
    <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
      <Image
        src={imageUrl}
        alt={item.product.title}
        width={96}
        height={96}
        unoptimized
        loading="lazy"
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      />
    </div>

    {/* Info */}
    <div className="flex-1 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="w-full">
          <h3 className="font-bold text-gray-900 leading-tight mb-2 text-base sm:text-lg">
            {item.product.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
            <p className="text-gray-500 text-xs sm:text-sm font-mono">
              {item.product.id?.slice(-6)}
            </p>
            <p className="text-gray-700 text-xs sm:text-sm font-medium">
              کد: {item.product.code}
            </p>
            {(item.product.shippingCost || 0) > 0 ? (
              <div className="flex items-center gap-1 text-xs text-gray-500">
               
                بسته بندی و کارتن:{" "}
                {item.product.shippingCost?.toLocaleString()} تومان
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-green-600">
              
                بسته بندی و کارتن: رایگان
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => removeItem(item.product.id)}
          className="self-end sm:self-start text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
        <div className="text-lg sm:text-xl font-bold text-gray-900 order-2 sm:order-1">
          {item.product.price.toLocaleString()} تومان
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto order-1 sm:order-2">
          <div className="text-sm text-gray-500 sm:hidden">
            تعداد:
          </div>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              disabled={item.quantity <= 1}
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.quantity - 1
                )
              }
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <FiMinus size={16} />
            </button>
            <span className="w-12 text-center font-medium text-gray-900 text-sm">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.quantity + 1
                )
              }
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <FiPlus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  خلاصه سفارش
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>جمع محصولات</span>
                    <span className="font-medium">
                      {productsTotal.toLocaleString()} تومان
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-2">
                       هزینه بسته بندی و کارتن
                    </span>
                    <span
                      className={`font-medium ${
                        shippingTotal === 0
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {shippingTotal === 0
                        ? "رایگان"
                        : `${shippingTotal.toLocaleString()} تومان`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mb-6">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>مبلغ قابل پرداخت</span>
                    <span>{total.toLocaleString()} تومان</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors mb-3 flex items-center justify-center gap-2"
                >
                  <FiCreditCard size={18} />
                  تکمیل سفارش
                </button>

     
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in-0 zoom-in-95 duration-200">

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <FiCreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    پرداخت کارت به کارت
                  </h3>
                  <p className="text-sm text-gray-500">
                    لطفاً مبلغ را به حساب زیر واریز کنید
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm opacity-80">
                  شماره کارت
                </span>
                <button onClick={copyCardNumber}>
                  <FiCopy size={16} />
                </button>
              </div>
              <div dir="ltr" className="font-mono text-lg tracking-wider text-center">
                6219 8618 4284 6312
              </div>
              <div className="text-sm opacity-80 text-center mt-4">
                به نام: نازنین زاهدیان نژادی
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-t border-gray-100">
              <span className="font-medium text-gray-700">
                مبلغ قابل پرداخت:
              </span>
              <span className="text-xl font-bold text-gray-900">
                {total.toLocaleString()} تومان
              </span>
            </div>

            {/* دکمه واتساپ */}
            <a
              href={`https://wa.me/9178506698?text=${encodedMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-green-500 text-white py-3.5 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382C17.111 14.197 15.338 13.322 15.007 13.204C14.676 13.086 14.433 13.027 14.19 13.418C13.947 13.809 13.256 14.625 13.045 14.869C12.834 15.113 12.621 15.146 12.261 14.961C11.9 14.776 10.756 14.407 9.407 13.202C8.336 12.244 7.616 11.059 7.405 10.697C7.194 10.335 7.382 10.139 7.567 9.955C7.734 9.789 7.938 9.526 8.123 9.314C8.308 9.102 8.368 8.948 8.488 8.704C8.608 8.46 8.548 8.248 8.458 8.063C8.368 7.878 7.647 6.088 7.346 5.365C7.054 4.662 6.755 4.758 6.549 4.747C6.355 4.737 6.131 4.734 5.906 4.734C5.681 4.734 5.314 4.822 5.006 5.167C4.698 5.512 3.842 6.319 3.842 7.967C3.842 9.615 5.045 11.207 5.221 11.432C5.397 11.657 7.628 15.117 11.067 16.598C11.936 16.984 12.61 17.212 13.135 17.384C14.009 17.666 14.81 17.627 15.441 17.535C16.141 17.433 17.647 16.757 17.955 15.968C18.263 15.179 18.263 14.508 18.173 14.357C18.083 14.206 17.833 14.108 17.472 13.922ZM12.001 22C6.478 22 2 17.522 2 12C2 6.478 6.478 2 12 2C17.522 2 22 6.478 22 12C22 17.522 17.522 22 12.001 22Z" />
              </svg>
              ارسال فیش در واتساپ
            </a>

            <p className="text-sm text-gray-500 font-bold text-center mt-4">
              پس از واریز، فیش خود را در واتساپ ارسال کنید
            </p>

          </div>
        </div>
      )}
    </div>
  );
}