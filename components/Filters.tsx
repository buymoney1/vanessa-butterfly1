'use client';

import { useRouter, useSearchParams } from "next/navigation";

type FiltersProps = {
  categories: string[];
  onClearFilters: () => void;
  onRemoveFilter: (filterName: string) => void;
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    inStock?: boolean;
    search?: string;
  };
};

export default function Filters({ categories, onClearFilters, onRemoveFilter, filters }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (name: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === '' || value === false || value === 'all') {
      params.delete(name);
    } else {
      params.set(name, String(value));
    }
    
    router.push(`/?${params.toString()}`);
  };

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
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
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">دسته‌بندی:</label>
              <div className="flex gap-2">
                <select 
                  name="category" 
                  value={filters.category || 'all'}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">همه دسته‌بندی‌ها</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">محدوده قیمت:</label>
              <form onSubmit={handlePriceFilterSubmit} className="flex gap-2 items-center">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="حداقل"
                  defaultValue={filters.minPrice || ''}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">تا</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="حداکثر"
                  defaultValue={filters.maxPrice || ''}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                  اعمال
                </button>
              </form>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">مرتب‌سازی:</label>
              <div className="flex gap-1">
                <select 
                  name="sortBy" 
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="price_asc">ارزان‌ترین</option>
                </select>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">فقط موجودی انبار</span>
                </label>
              </div>
            </div>

          </div>
          
          {/* Applied Filters */}
          {(filters.category || filters.minPrice || filters.maxPrice || filters.search || filters.inStock) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">فیلترهای اعمال شده:</span>
              
              {filters.category && filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  دسته: {filters.category}
                  <button 
                    type="button"
                    onClick={() => onRemoveFilter('category')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  قیمت: {filters.minPrice ? `${filters.minPrice.toLocaleString()} تومان` : ''}
                  {filters.minPrice && filters.maxPrice && ' تا '}
                  {filters.maxPrice ? `${filters.maxPrice.toLocaleString()} تومان` : ''}
                  <button 
                    type="button"
                    onClick={() => {
                      onRemoveFilter('minPrice');
                      onRemoveFilter('maxPrice');
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  جستجو: {filters.search}
                  <button 
                    type="button"
                    onClick={() => onRemoveFilter('search')}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {filters.inStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  فقط موجودی
                  <button 
                    type="button"
                    onClick={() => onRemoveFilter('inStock')}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {(filters.category || filters.minPrice || filters.maxPrice || filters.search || filters.inStock) && (
                <button 
                  type="button"
                  onClick={onClearFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  حذف همه فیلترها
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}