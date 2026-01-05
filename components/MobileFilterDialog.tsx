'use client';

import { useState } from 'react';
import { FiX, FiFilter } from 'react-icons/fi';

type MobileFilterDialogProps = {
  categories: string[];
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    inStock?: boolean;
  };
  onApplyFilters: (filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    inStock: boolean;
  }) => void;
  onClearFilters: () => void;
};

export default function MobileFilterDialog({
  categories,
  filters,
  onApplyFilters,
  onClearFilters,
}: MobileFilterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || 'all',
    minPrice: filters.minPrice?.toString() || '',
    maxPrice: filters.maxPrice?.toString() || '',
    sortBy: filters.sortBy || 'newest',
    inStock: filters.inStock || false,
  });

  const handleApply = () => {
    onApplyFilters({
      category: localFilters.category,
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
      sortBy: localFilters.sortBy,
      inStock: localFilters.inStock,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      inStock: false,
    });
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-2xl"
      >
        <FiFilter className="w-5 h-5" />
        فیلترها
      </button>

      {/* Mobile Filter Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Content */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-slideIn">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">فیلتر محصولات</h2>
                  <p className="text-sm text-gray-500 mt-1">انتخاب‌های خود را تنظیم کنید</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <FiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    دسته‌بندی
                  </label>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <select
                  value={localFilters.category}
                  onChange={(e) => setLocalFilters({...localFilters, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">همه دسته‌بندی‌ها</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    محدوده قیمت (تومان)
                  </label>
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="حداقل قیمت"
                      value={localFilters.minPrice}
                      onChange={(e) => setLocalFilters({...localFilters, minPrice: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="حداکثر قیمت"
                      value={localFilters.maxPrice}
                      onChange={(e) => setLocalFilters({...localFilters, maxPrice: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    مرتب‌سازی بر اساس
                  </label>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                </div>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => setLocalFilters({...localFilters, sortBy: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="price_asc">ارزان‌ترین</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${localFilters.inStock ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                    {localFilters.inStock && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">فقط محصولات موجود</span>
                    <p className="text-xs text-gray-500 mt-1">نمایش محصولات با موجودی انبار</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </label>
                <input
                  type="checkbox"
                  checked={localFilters.inStock}
                  onChange={(e) => setLocalFilters({...localFilters, inStock: e.target.checked})}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleApply}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  اعمال فیلترها
                </button>
                <button
                  onClick={handleClear}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                >
                  حذف همه فیلترها
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}