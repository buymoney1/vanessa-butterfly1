//src/app/page.tsx

'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, Filters as FiltersType } from "./types/product";
import LoadingState from "@/components/LoadingState";
import ProductsGrid from "@/components/ProductsGrid";
import ResponsiveFilters from "@/components/ResponsiveFilters";
import FAQSection from "@/components/FAQSection";
import AIChatBox from "@/components/AIChatBox";

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
        ]);
        
        setCategories(['زیبایی و سلامت']);
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


 
        <AIChatBox />

      <FAQSection/>
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