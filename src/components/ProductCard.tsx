"use client";

import { useState, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { FiShoppingCart, FiEdit, FiTrash2, FiHeart, FiEye, FiCheck } from "react-icons/fi";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    shippingCost?: number;
    images: string[];
    category: string;
    inStock: boolean;
    code?: string;
  };
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  priority?: boolean; // اضافه کردن priority به props
}

// کش برای URLهای تصاویر
const imageUrlCache = new Map<string, string>();

// تابع برای تبدیل ObjectId به URL (بهینه شده)
function getImageUrl(imageId: string): string {
  if (!imageId || imageId === 'placeholder') {
    return '/placeholder.svg';
  }
  
  // بررسی کش
  if (imageUrlCache.has(imageId)) {
    return imageUrlCache.get(imageId)!;
  }
  
  let url: string;
  if (imageId.startsWith('http') || imageId.startsWith('/')) {
    url = imageId;
  } else {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    url = `${baseUrl}/api/files/${imageId}`;
  }
  
  // ذخیره در کش
  imageUrlCache.set(imageId, url);
  return url;
}

// تابع ایمن برای فرمت کردن قیمت (بهینه شده)
const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return "0";
  }
  return price.toLocaleString('fa-IR');
};

const ProductCard = memo(function ProductCard({ 
  product, 
  isAdmin, 
  onEdit, 
  onDelete,
  priority = false // مقدار پیش‌فرض false
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // محاسبات با useMemo
  const imageUrl = useMemo(() => {
    if (imageError) return '/placeholder.svg';
    return product.images[currentImageIndex] 
      ? getImageUrl(product.images[currentImageIndex])
      : '/placeholder.svg';
  }, [product.images, currentImageIndex, imageError]);

  const getFinalPrice = useCallback((): number => {
    const basePrice = product.price || 0;
    const shippingCost = product.shippingCost || 0;
    return basePrice + shippingCost;
  }, [product.price, product.shippingCost]);

  const finalPrice = useMemo(() => getFinalPrice(), [getFinalPrice]);

  const hasMultipleImages = useMemo(() => product.images.length > 1, [product.images]);
  const isFreeShipping = useMemo(() => 
    product.shippingCost === undefined || product.shippingCost <= 0
  , [product.shippingCost]);
  const isLuxury = useMemo(() => (product.price || 0) > 10000000, [product.price]);

  // هندلرهای بهینه شده با useCallback
  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!session) {
      toast.error("لطفاً ابتدا وارد حساب کاربری شوید");
      return;
    }

    if (!product.inStock) {
      toast.error("این محصول در حال حاضر موجود نیست");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: product.id, 
          quantity: 1 
        }),
      });

      if (response.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheck className="w-4 h-4 text-green-600" />
            </div>
            <span>{product.title} به سبد خرید اضافه شد</span>
          </div>
        );
        
        setTimeout(() => {
          router.push('/cart');
        }, 1500);
      } else {
        throw new Error('خطا در افزودن به سبد خرید');
      }
    } catch {
      toast.error('مشکلی در افزودن به سبد خرید پیش آمده');
    } finally {
      setIsLoading(false);
    }
  }, [session, product.inStock, product.id, product.title, router]);

  const handleCardClick = useCallback(() => {
    router.push(`/products/${product.id}`);
  }, [router, product.id]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/products/${product.id}`);
  }, [router, product.id]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // اینجا می‌توانید modal برای نمایش سریع محصول باز کنید
  }, []);

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsLiked(prev => !prev);
  }, []);

  const handleImageNavClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex(index);
    setImageError(false); // ریست خطای تصویر وقتی ایندکس عوض میشه
  }, []);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit?.();
  }, [onEdit]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.();
  }, [onDelete]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // کامپوننت‌های فرعی با useMemo
  const Badges = useMemo(() => (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {!product.inStock ? (
        <div className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-full shadow-lg">
          ناموجود
        </div>
      ) : (
        <div className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-medium rounded-full shadow-lg">
          موجود
        </div>
      )}
      
      {isFreeShipping && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-lg">
          بسته بندی رایگان
        </div>
      )}
      
      {isLuxury && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-medium rounded-full shadow-lg">
          لاکچری
        </div>
      )}
    </div>
  ), [product.inStock, isFreeShipping, isLuxury]);

  const CategoryBadge = useMemo(() => (
    <div className="absolute top-4 right-4 z-10">
      <div className="px-4 py-1.5 bg-white/80 backdrop-blur-md text-gray-800 text-xs font-medium rounded-full border border-white/40 shadow-lg">
        {product.category}
      </div>
    </div>
  ), [product.category]);

  const ImageNavigation = useMemo(() => {
    if (!hasMultipleImages) return null;
    
    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-30">
        {product.images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => handleImageNavClick(e, index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`تصویر ${index + 1}`}
          />
        ))}
      </div>
    );
  }, [hasMultipleImages, product.images, currentImageIndex, handleImageNavClick]);

  const PriceBreakdown = useMemo(() => {
    if (!isHovered) return null;
    
    return (
      <div className="absolute bottom-28 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-200 z-40 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="space-y-2 min-w-[180px]">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">قیمت محصول:</span>
            <span className="font-medium text-gray-900">{formatPrice(product.price)} تومان</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">هزینه بسته بندی:</span>
            <span className={`font-medium ${isFreeShipping ? 'text-green-600' : 'text-gray-900'}`}>
              {isFreeShipping ? 'رایگان' : `${formatPrice(product.shippingCost)} تومان`}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between items-center font-bold">
              <span className="text-gray-700">قیمت نهایی:</span>
              <span className="text-blue-600">{formatPrice(finalPrice)} تومان</span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [isHovered, product.price, product.shippingCost, isFreeShipping, finalPrice]);

  return (
    <div 
      className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-blue-50/20 group-hover:via-purple-50/10 group-hover:to-transparent transition-all duration-500"></div>
      
      {Badges}
      {CategoryBadge}

      {/* Product Image Container */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent z-10"></div>
        
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 rotate-1' : 'scale-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized={imageUrl.includes('/api/files/')}
          // رفع مشکل: استفاده از priority یا loading لزی، نه هر دو
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={handleImageError}
        />

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={handleQuickView}
            className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-white transition-all duration-200 shadow-lg"
            title="مشاهده سریع"
          >
            <FiEye size={18} />
          </button>

          <button
            onClick={handleLikeClick}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-white transition-all duration-200 shadow-lg"
            title={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          >
            <FiHeart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
          </button>

          {isAdmin && (
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={handleEditClick}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-blue-600 hover:bg-white transition-all duration-200 shadow-lg"
                title="ویرایش محصول"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-white transition-all duration-200 shadow-lg"
                title="حذف محصول"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          )}

          {product.inStock && !isAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 z-30"
              title="افزودن به سبد خرید"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiShoppingCart size={20} />
              )}
            </button>
          )}
        </div>

        {ImageNavigation}
      </div>

      {/* Product Info */}
      <div className="p-6 relative flex-grow flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
          {product.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="mb-3">
          {isFreeShipping ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <FiCheck size={16} />
              <span>بسته بندی و کارتن رایگان</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>+ {formatPrice(product.shippingCost)} تومان بسته بندی</span>
            </div>
          )}
        </div>

        <div className="mt-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {formatPrice(product.price)}
                <span className="text-sm font-normal text-gray-500 mr-1">تومان</span>
              </span>
              {product.code && (
                <span className="text-xs text-gray-400 mt-1">کد: {product.code}</span>
              )}
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              product.inStock 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-100' 
                : 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-100'
            }`}>
              {product.inStock ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs">موجود</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-xs">ناموجود</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isLoading}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
              product.inStock && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-[1.02] active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className={`relative z-10 flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <FiShoppingCart className="w-4 h-4" />
              {isLoading ? 'در حال افزودن...' : (product.inStock ? 'افزودن به سبد' : 'ناموجود')}
            </div>
          </button>
          
          <button 
            onClick={handleViewDetails}
            className="px-4 py-3 border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            جزئیات
          </button>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={handleEditClick}
              className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <FiEdit size={16} />
              ویرایش
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <FiTrash2 size={16} />
              حذف
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {PriceBreakdown}
    </div>
  );
});

export default ProductCard;