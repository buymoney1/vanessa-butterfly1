'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// لود تنبل ProductCard
const ProductCard = dynamic(() => import('./ProductCard'), {
  loading: () => <ProductCardSkeleton />,
  ssr: false
});

// Skeleton برای نمایش در زمان لود
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
      <div className="p-6 space-y-4 flex-grow flex flex-col">
        <div className="h-6 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
        <div className="space-y-2 flex-grow">
          <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-full w-5/6 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full w-1/3 animate-pulse mt-auto"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-full animate-pulse"></div>
      </div>
    </div>
  );
}

interface LazyProductCardProps {
  product: any;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  priority?: boolean; // برای اولین ردیف محصولات
}

const LazyProductCard = memo(function LazyProductCard({ 
  product, 
  isAdmin, 
  onEdit, 
  onDelete,
  priority = false 
}: LazyProductCardProps) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px', // 100px زودتر شروع به لود کن
    triggerOnce: true // فقط یک بار trigger بشه
  });

  // اگر priority باشه، همیشه نشون بده
  if (priority) {
    return (
      <ProductCard
        product={product}
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
      
      />
    );
  }

  return (
    <div ref={ref as any} className="h-full">
      {isVisible ? (
        <ProductCard
          product={product}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          priority={priority}
        />
      ) : (
        <ProductCardSkeleton />
      )}
    </div>
  );
});

export default LazyProductCard;