'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiChevronDown, FiCheck } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import MobileFilterDialog from './MobileFilterDialog';

type ResponsiveFiltersProps = {
  categories: string[];
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    inStock?: boolean;
    search?: string;
  };
  onClearFilters: () => void;
  onRemoveFilter: (filterName: string) => void;
};

export default function ResponsiveFilters({
  categories,
  filters,
  onClearFilters,
  onRemoveFilter,
}: ResponsiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDesktopFilterChange = (name: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === '' || value === false || value === 'all') {
      params.delete(name);
    } else {
      params.set(name, String(value));
    }
    
    router.push(`/?${params.toString()}`);
  };

  const handleDesktopPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const params = new URLSearchParams(searchParams.toString());
    
    const minPrice = formData.get('minPrice') as string;
    const maxPrice = formData.get('maxPrice') as string;
    
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    router.push(`/?${params.toString()}`);
    setShowPriceFilter(false);
  };

  const handleMobileApplyFilters = (mobileFilters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    inStock: boolean;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (mobileFilters.category && mobileFilters.category !== 'all') {
      params.set('category', mobileFilters.category);
    } else {
      params.delete('category');
    }
    
    if (mobileFilters.minPrice) {
      params.set('minPrice', mobileFilters.minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (mobileFilters.maxPrice) {
      params.set('maxPrice', mobileFilters.maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    if (mobileFilters.sortBy !== 'newest') {
      params.set('sortBy', mobileFilters.sortBy);
    } else {
      params.delete('sortBy');
    }
    
    if (mobileFilters.inStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    
    router.push(`/?${params.toString()}`);
  };

  // Desktop Filters - New Improved Design
  const DesktopFilters = () => (
    <div className="hidden lg:block">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">فیلتر محصولات</h3>
            <div className="flex items-center gap-2">
              {(filters.category || filters.minPrice || filters.maxPrice || filters.inStock) && (
                <button
                  onClick={onClearFilters}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4 inline ml-1" />
                  حذف همه
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-10 grid grid-cols-4 gap-6">
            {/* Category Filter */}
            <div className="relative group">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                دسته‌بندی
              </label>
              <div className="relative">
                <select 
                  name="category" 
                  value={filters.category || 'all'}
                  onChange={(e) => handleDesktopFilterChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-100"
                >
                  <option value="all">همه دسته‌بندی‌ها</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Price Filter - Collapsible */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                محدوده قیمت
              </label>
              <button
                onClick={() => setShowPriceFilter(!showPriceFilter)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right flex items-center justify-between transition-all duration-200 hover:bg-gray-100"
              >
                <span className="text-gray-700">
                  {filters.minPrice || filters.maxPrice 
                    ? `${filters.minPrice ? filters.minPrice.toLocaleString() : ''}${filters.minPrice && filters.maxPrice ? ' - ' : ''}${filters.maxPrice ? filters.maxPrice.toLocaleString() : ''} تومان`
                    : 'انتخاب محدوده قیمت'
                  }
                </span>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showPriceFilter ? 'rotate-180' : ''}`} />
              </button>
              
              {showPriceFilter && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                  <form onSubmit={handleDesktopPriceSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          name="minPrice"
                          placeholder="حداقل"
                          defaultValue={filters.minPrice || ''}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="maxPrice"
                          placeholder="حداکثر"
                          defaultValue={filters.maxPrice || ''}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      اعمال قیمت
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sort Filter */}
            <div className="relative group">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                مرتب‌سازی
              </label>
              <div className="relative">
                <select 
                  name="sortBy" 
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => handleDesktopFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 cursor-pointer transition-all duration-200 hover:bg-gray-100"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="price_asc">ارزان‌ترین</option>
                </select>
                <FiChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${filters.inStock ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                  {filters.inStock && <FiCheck className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">فقط موجودی</span>
                  <p className="text-xs text-gray-500 mt-1">محصولات با موجودی انبار</p>
                </div>
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => handleDesktopFilterChange('inStock', e.target.checked)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Applied Filters */}
          {(filters.category || filters.minPrice || filters.maxPrice || filters.search || filters.inStock) && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-600">فیلترهای اعمال شده:</span>
                
                {filters.category && filters.category !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                    دسته: {filters.category}
                    <button 
                      type="button"
                      onClick={() => onRemoveFilter('category')}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm border border-green-100">
                    قیمت: {filters.minPrice ? `${filters.minPrice.toLocaleString()} تومان` : ''}
                    {filters.minPrice && filters.maxPrice && ' - '}
                    {filters.maxPrice ? `${filters.maxPrice.toLocaleString()} تومان` : ''}
                    <button 
                      type="button"
                      onClick={() => {
                        onRemoveFilter('minPrice');
                        onRemoveFilter('maxPrice');
                      }}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-100">
                    جستجو: {filters.search}
                    <button 
                      type="button"
                      onClick={() => onRemoveFilter('search')}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.inStock && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-100">
                    فقط موجودی
                    <button 
                      type="button"
                      onClick={() => onRemoveFilter('inStock')}
                      className="text-orange-600 hover:text-orange-800 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {/* Added Clear All Filters Button */}
                <button
                  onClick={onClearFilters}
                  className="inline-flex items-center gap-1 px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-full text-sm font-medium border border-red-100 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                  حذف همه فیلترها
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopFilters />
      <MobileFilterDialog
        categories={categories}
        filters={filters}
        onApplyFilters={handleMobileApplyFilters}
        onClearFilters={onClearFilters}
      />
    </>
  );
}