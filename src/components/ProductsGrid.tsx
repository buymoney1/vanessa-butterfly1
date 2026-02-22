'use client';

import { Product } from "@/app/types/product";
import ProductCard from "./ProductCard";
import { memo, useMemo } from "react";

type ProductsGridProps = {
  products: Product[];
  filters: {
    category?: string;
  };
  onClearFilters: () => void;
};

// استفاده از memo برای جلوگیری از رندر مجدد غیرضروری
const ProductsGrid = memo(function ProductsGrid({ products, filters, onClearFilters }: ProductsGridProps) {
  // محاسبه عنوان با useMemo
  const pageTitle = useMemo(() => {
    return filters.category && filters.category !== 'all' ? `محصولات ${filters.category}` : '';
  }, [filters.category]);

  // استفاده از useMemo برای جلوگیری از محاسبه مجدد در هر رندر
  const hasProducts = useMemo(() => products.length > 0, [products]);

  // استفاده از useMemo برای ProductCardها
  const productCards = useMemo(() => {
    if (!hasProducts) return null;
    
    return products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ));
  }, [products, hasProducts]);

  // کامپوننت خالی بودن محصولات
  const EmptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">محصولی یافت نشد</h3>
      <p className="text-gray-500 max-w-md text-center mb-6">
        با فیلترهای انتخاب شده هیچ محصولی پیدا نشد. می‌توانید فیلترها را تغییر دهید.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        حذف همه فیلترها
      </button>
    </div>
  ), [onClearFilters]);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Products Grid */}
      {!hasProducts ? (
        EmptyState
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productCards}
        </div>
      )}
    </section>
  );
});

export default ProductsGrid;