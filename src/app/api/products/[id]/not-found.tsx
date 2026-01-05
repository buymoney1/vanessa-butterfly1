import Link from "next/link";
import { FiHome, FiSearch, FiShoppingBag } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="text-center">
        <div className="glass-card rounded-2xl p-12 max-w-md">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-white mb-4">محصول یافت نشد</h1>
          <p className="text-white/70 mb-8">
            متأسفانه محصول مورد نظر شما پیدا نشد. ممکن است حذف شده باشد یا آدرس اشتباه باشد.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center"
            >
              <FiHome className="ml-2" />
              بازگشت به صفحه اصلی
            </Link>
            
            <Link
              href="/"
              className="block w-full glass-button py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <FiShoppingBag className="ml-2" />
              مشاهده محصولات دیگر
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}