'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, Filters as FiltersType } from "./types/product";
import CategoriesSection from "../../components/CategoriesSection";
import HeroSection from "../../components/HeroSection";
import LoadingState from "../../components/LoadingState";
import ProductsGrid from "../../components/ProductsGrid";
import ResponsiveFilters from "../../components/ResponsiveFilters";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const filters: FiltersType = {
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    sortBy: searchParams.get('sortBy') || 'newest',
    inStock: searchParams.get('inStock') === 'true',
    search: searchParams.get('search') || undefined,
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const clearFilters = () => {
    router.push('/');
  };

  const removeFilter = (filterName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterName);
    router.push(`/?${params.toString()}`);
  };

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        
        if (filters.category && filters.category !== 'all') {
          params.set('category', filters.category);
        }
        
        if (filters.minPrice) {
          params.set('minPrice', filters.minPrice.toString());
        }
        
        if (filters.maxPrice) {
          params.set('maxPrice', filters.maxPrice.toString());
        }
        
        if (filters.sortBy) {
          params.set('sortBy', filters.sortBy);
        }
        
        if (filters.inStock) {
          params.set('inStock', 'true');
        }
        
        if (filters.search) {
          params.set('search', filters.search);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('خطا در دریافت داده‌ها');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products || []);
          setCategories(data.categories || []);
        } else {
          throw new Error(data.error || 'خطا در دریافت داده‌ها');
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        
        // داده‌های نمونه برای حالت آفلاین
        setProducts([
          {
            id: '1',
            title: 'فنجان قهوه مینیمال',
            description: 'طراحی شده توسط آرشیتکت‌های برتر، با شیشه بوروسیلیکات مقاوم.',
            price: 350000,
            images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80'],
            category: 'خانه و آشپزخانه',
            inStock: true,
            createdAt: new Date(),
            code: 'PRD-001'
          },
          {
            id: '2',
            title: 'هدفون نویز کنسلینگ',
            description: 'تجربه صدا با خلوص ۱۰۰٪ و طراحی ارگونومیک.',
            price: 4500000,
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
            category: 'الکترونیک',
            inStock: true,
            createdAt: new Date(),
            code: 'PRD-002'
          },
          {
            id: '3',
            title: 'صندلی مطالعه کلاسیک',
            description: 'چرم طبیعی و پایه‌های چوب بلوط. راحتی برای ساعات طولانی.',
            price: 12000000,
            images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80'],
            category: 'مبلمان',
            inStock: false,
            createdAt: new Date(),
            code: 'PRD-003'
          },
          {
            id: '4',
            title: 'ساعت هوشمند اولترا',
            description: 'صفحه نمایش AMOLED و باتری ۷ روزه.',
            price: 8900000,
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
            category: 'گجت پوشیدنی',
            inStock: true,
            createdAt: new Date(),
            code: 'PRD-004'
          },
          {
            id: '5',
            title: 'کیف لپ تاپ چرمی',
            description: 'چرم طبیعی ایتالیایی، ضد آب و مقاوم در برابر ضربه.',
            price: 2500000,
            images: ['https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80'],
            category: 'لوازم جانبی',
            inStock: true,
            createdAt: new Date(),
            code: 'PRD-005'
          },
          {
            id: '6',
            title: 'کتاب برنامه‌نویسی پیشرفته',
            description: 'آموزش کامل زبان‌های برنامه‌نویسی مدرن.',
            price: 850000,
            images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
            category: 'کتاب و لوازم تحریر',
            inStock: true,
            createdAt: new Date(),
            code: 'PRD-006'
          },
          {
            id: '7',
            title: 'توپ فوتبال حرفه‌ای',
            description: 'توپ رسمی فیفا، سایز ۵، مناسب مسابقات حرفه‌ای.',
            price: 1200000,
            images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80'],
            category: 'ورزشی',
            inStock: true,
            createdAt: new Date(),
            code: 'PRD-007'
          },
          {
            id: '8',
            title: 'ست آرایشی کامل',
            description: 'شامل ۱۲ رنگ رژلب، ۶ رنگ سایه و براش‌های حرفه‌ای.',
            price: 3200000,
            images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'],
            category: 'زیبایی و سلامت',
            inStock: true,
            createdAt: new Date(),
            code: 'PRD-008'
          },
        ]);
        
        setCategories(['الکترونیک', 'پوشاک', 'خانه و آشپزخانه', 'کتاب و لوازم تحریر', 'ورزشی', 'زیبایی و سلامت']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* <HeroSection searchQuery={filters.search} /> */}
      <ResponsiveFilters 
        categories={categories} 
        filters={filters}
        onClearFilters={clearFilters}
        onRemoveFilter={removeFilter}
      />
      {/* <CategoriesSection 
        categories={categories}
        selectedCategory={filters.category}
        products={products}
        onCategorySelect={handleCategorySelect}
      /> */}
      <ProductsGrid 
        products={products}
        filters={filters}
        onClearFilters={clearFilters}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HomeContent />
    </Suspense>
  );
}