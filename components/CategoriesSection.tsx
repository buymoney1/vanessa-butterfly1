'use client';

type CategoriesSectionProps = {
  categories: string[];
  selectedCategory?: string;
  products: Array<{ category: string }>;
  onCategorySelect: (category: string) => void;
};

export default function CategoriesSection({ 
  categories, 
  selectedCategory, 
  products, 
  onCategorySelect 
}: CategoriesSectionProps) {
  return (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">دسته‌بندی‌های محصولات</h2>
          <span className="text-gray-500 text-sm">
            {products.length} محصول یافت شد
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.slice(0, 6).map((category, index) => (
            <button
              key={index}
              onClick={() => onCategorySelect(category)}
              className={`group relative overflow-hidden bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${selectedCategory === category ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">{category}</span>
              <div className="mt-1 text-xs text-gray-500">
                {products.filter(p => p.category === category).length} محصول
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}