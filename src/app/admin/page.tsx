"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiPackage, FiLoader, FiPlus, FiGrid } from "react-icons/fi";
import ProductCard from "../../../components/ProductCard";
import ProductForm from "../../../components/ProductForm";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  code?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiResponse {
  success: boolean;
  products?: Product[];
  error?: string;
}

interface CategoryResponse {
  success: boolean;
  categories?: string[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      toast.error("شما دسترسی به این صفحه را ندارید");
      router.push("/");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchProducts();
      fetchCategories();
    }
  }, [session, status]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.products) {
        setProducts(data.products);
        
        // محاسبه آمار
        const inStockCount = data.products.filter(p => p.inStock).length;
        setStats({
          totalProducts: data.products.length,
          inStock: inStockCount,
          outOfStock: data.products.length - inStockCount
        });
      } else {
        toast.error(data.error || "خطا در دریافت محصولات");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("خطا در اتصال به سرور");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CategoryResponse = await response.json();
      
      if (data.success && data.categories) {
        setCategories(data.categories);
      } else {
        console.error("خطا در دریافت دسته‌بندی‌ها:", data.error);
        // استفاده از دسته‌بندی‌های پیش‌فرض
        setCategories([
          'الکترونیک',
          'پوشاک',
          'خانه و آشپزخانه',
          'کتاب و لوازم تحریر',
          'ورزشی',
          'زیبایی و سلامت'
        ]);
      }
    } catch (error) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", error);
      // استفاده از دسته‌بندی‌های پیش‌فرض در صورت خطا
      setCategories([
        'الکترونیک',
        'پوشاک',
        'خانه و آشپزخانه',
        'کتاب و لوازم تحریر',
        'ورزشی',
        'زیبایی و سلامت'
      ]);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("آیا از حذف این محصول مطمئنید؟ این عملیات غیرقابل بازگشت است.")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("محصول با موفقیت حذف شد");
          setProducts(products.filter(p => p.id !== productId));
          if (editingProduct?.id === productId) {
            setEditingProduct(null);
          }
          
          // آپدیت آمار
          fetchProducts();
        } else {
          toast.error(result.error || "خطا در حذف محصول");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "خطا در حذف محصول");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("مشکلی پیش آمده است");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">در حال بارگذاری پنل مدیریت...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* هدر صفحه */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                پنل مدیریت محصولات
              </h1>
              <p className="text-gray-500 mt-1">
                خوش آمدید، <span className="font-medium text-gray-900">{session?.user?.name}</span>
              </p>
            </div>
 
          </div>
        </header>

        {/* چیدمان اصلی */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ستون فرم */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {editingProduct ? (
                    "ویرایش محصول"
                  ) : (
                    <>
                      <FiPlus className="text-blue-600" size={20} />
                      افزودن محصول جدید
                    </>
                  )}
                </h2>

              </div>
              
              <ProductForm 
                product={editingProduct}
                onSuccess={() => {
                  setEditingProduct(null);
                  fetchProducts();
                  toast.success(editingProduct ? "محصول ویرایش شد" : "محصول اضافه شد");
                }}
                existingCategories={categories}
              />
              
              {editingProduct && (
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-full mt-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  انصراف از ویرایش
                </button>
              )}
            </div>
          </div>

          {/* ستون لیست محصولات */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">لیست محصولات</h2>
              <div className="text-sm text-gray-500">
                نمایش {products.length} محصول
              </div>
            </div>
            
            {!Array.isArray(products) || products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <FiPackage size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">محصولی یافت نشد</h3>
                <p className="text-gray-500 text-center max-w-sm mb-6">
                  هنوز هیچ محصولی اضافه نشده است. محصول اول را از طریق فرم سمت راست اضافه کنید.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div key={product.id}>
                    <ProductCard 
                      product={product}
                      isAdmin
                      onEdit={() => {
                        setEditingProduct(product);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onDelete={() => handleDelete(product.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}