// components/RelatedProducts.tsx
"use client";

import { FiCheck } from "react-icons/fi";

interface Product {
  id: string;
  title: string;
  price: number;
  shippingCost: number;
  images: string[];
  code?: string;
  category: string;
  inStock: boolean;
}

interface RelatedProductsProps {
  products: Product[];
}

// تابع تصحیح شده برای تبدیل ObjectId به URL
const getImageUrl = (imageId: string): string => {
  if (!imageId || imageId === 'placeholder') {
    return '/placeholder.jpg';
  }
  
  // اگر قبلاً URL کامل است
  if (imageId.startsWith('http') || imageId.startsWith('https')) {
    return imageId;
  }
  
  // اگر مسیر نسبی است
  if (imageId.startsWith('/')) {
    return imageId;
  }
  
  // اگر ObjectId است، به endpoint فایل‌ها لینک بده
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  if (baseUrl) {
    return `${baseUrl}/api/files/${imageId}`;
  }
  
  // در حالت توسعه
  return `/api/files/${imageId}`;
};

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">محصولات مرتبط</h2>
        <div className="h-px bg-gray-200 flex-grow"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          // گرفتن اولین تصویر از آرایه images
          const firstImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : 'placeholder';
          
          // تبدیل imageId به URL قابل استفاده
          const imageUrl = getImageUrl(firstImage);
          
          return (
            <a 
              key={product.id}
              href={`/products/${product.id}`}
              className="group block bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-50 mb-3">
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // اگر تصویر لود نشد، جایگزین کنیم
                    e.currentTarget.src = '/placeholder.jpg';
                  }}
                />
              </div>
              
              <div className="px-1 pb-1">
                <h3 className="font-bold text-gray-600 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.title}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-gray-800 font-bold text-xl">
                    {product.price.toLocaleString()} 
                    <span className="text-xs font-normal text-gray-500"> تومان</span>
                  </span>
                </div>
                {product.shippingCost > 0 ? (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">
                      + {product.shippingCost.toLocaleString()} تومان ارسال
                    </span>
                  </div>
                ) : (
                  <div className="mt-1">
                    <span className="text-xs text-green-600">
                      ✓ ارسال رایگان
                    </span>
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}