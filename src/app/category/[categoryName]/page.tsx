// app/category/[categoryName]/page.tsx
import { notFound } from "next/navigation";
import { FiFilter, FiChevronLeft } from "react-icons/fi";
import ProductCard from "../../../../components/ProductCard";
import { prisma } from "../../../../lib/prisma";

interface CategoryPageProps {
  params: Promise<{ categoryName: string }>;
  searchParams?: Promise<{
    sort?: string;
  }>;
}

// تعریف تایپ برای محصولات دریافتی از Prisma
interface PrismaProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  code: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// تایپ تبدیل شده برای ProductCard
interface FormattedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  code?: string; // تبدیل از string | null به string | undefined
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  try {
    const { categoryName } = await params;
    const resolvedSearchParams = await searchParams;
    
    // دیکد کردن نام دسته‌بندی از URL
    const decodedCategory = decodeURIComponent(categoryName);
    
    // دریافت محصولات دسته‌بندی
    const prismaProducts = await prisma.product.findMany({
      where: {
        category: decodedCategory,
        inStock: true,
      },
      orderBy: { 
        createdAt: "desc" 
      },
    });

    // تبدیل محصولات Prisma به فرمت مناسب ProductCard
    const products: FormattedProduct[] = prismaProducts.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      inStock: product.inStock,
      code: product.code ?? undefined, // تبدیل null به undefined
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    // اگر محصولی در این دسته‌بندی نبود
    if (products.length === 0) {
      notFound();
    }

    // دریافت همه دسته‌بندی‌های منحصربه‌فرد
    const allCategories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    const categories = Array.from(new Set(
      allCategories
        .map(p => p.category)
        .filter(Boolean)
        .filter(cat => typeof cat === 'string' && cat.trim() !== "")
    )) as string[];

    // تنظیمات مرتب‌سازی
    const sort = resolvedSearchParams?.sort || 'newest';
    let sortedProducts = [...products];

    switch (sort) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // 'newest'
        sortedProducts.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    }

    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center text-sm text-gray-600 mb-4 overflow-x-auto whitespace-nowrap pb-2">
              <a href="/" className="hover:text-gray-900 transition-colors">خانه</a>
              <span className="mx-2 text-gray-400">/</span>
              <a href="/categories" className="hover:text-gray-900 transition-colors">دسته‌بندی‌ها</a>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{decodedCategory}</span>
            </nav>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{decodedCategory}</h1>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{products.length}</span> محصول موجود
                </p>
              </div>
              
              <div className="text-sm text-gray-500">
                مرتب‌سازی بر اساس: 
                <span className="font-medium text-gray-900 mr-1">
                  {sort === 'newest' ? 'جدیدترین' : 
                   sort === 'price-low' ? 'ارزان‌ترین' :
                   sort === 'price-high' ? 'گران‌ترین' : 'الفبایی'}
                </span>
              </div>
            </div>
          </div>

          {/* دسته‌بندی‌های دیگر */}
          {categories.length > 1 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FiFilter className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">دسته‌بندی‌های مرتبط</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter(cat => cat !== decodedCategory)
                  .map((category) => (
                    <a
                      key={category}
                      href={`/category/${encodeURIComponent(category)}`}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                      {category}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* مرتب‌سازی در موبایل */}
          <div className="mb-6 block md:hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">مرتب‌سازی:</span>
              <div className="flex gap-1">
                <a
                  href={`/category/${categoryName}?sort=newest`}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    sort === 'newest'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  جدیدترین
                </a>
                <a
                  href={`/category/${categoryName}?sort=price-low`}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    sort === 'price-low'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  ارزان‌ترین
                </a>
                <a
                  href={`/category/${categoryName}?sort=price-high`}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    sort === 'price-high'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  گران‌ترین
                </a>
                <a
                  href={`/category/${categoryName}?sort=name`}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    sort === 'name'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  الفبایی
                </a>
              </div>
            </div>
          </div>

          {/* مرتب‌سازی در دسکتاپ */}
          <div className="mb-6 hidden md:block">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <a
                href={`/category/${categoryName}?sort=newest`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sort === 'newest'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                جدیدترین
              </a>
              <a
                href={`/category/${categoryName}?sort=price-low`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sort === 'price-low'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                ارزان‌ترین
              </a>
              <a
                href={`/category/${categoryName}?sort=price-high`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sort === 'price-high'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                گران‌ترین
              </a>
              <a
                href={`/category/${categoryName}?sort=name`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sort === 'name'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                الفبایی
              </a>
            </div>
          </div>

          {/* محصولات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* پیام خالی */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">محصولی یافت نشد</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                هیچ محصولی در این دسته‌بندی وجود ندارد. ممکن است محصولات این دسته‌بندی در حال حاضر موجود نباشند.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <FiChevronLeft />
                بازگشت به فروشگاه
              </a>
            </div>
          )}

          {/* همه دسته‌بندی‌ها */}
          {categories.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">همه دسته‌بندی‌ها</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((category) => {
                  const isCurrent = category === decodedCategory;
                  return (
                    <a
                      key={category}
                      href={`/category/${encodeURIComponent(category)}`}
                      className={`
                        group relative overflow-hidden rounded-xl p-4 text-center transition-all duration-200
                        ${isCurrent 
                          ? 'bg-blue-500 text-white ring-2 ring-blue-300' 
                          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="relative z-10">
                        <h4 className={`font-semibold mb-1 text-sm ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                          {category}
                        </h4>
                        <div className={`text-xs ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                          مشاهده محصولات
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in category page:', error);
    notFound();
  }
}