"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  FiPackage, 
  FiLoader, 
  FiPlus,
  FiBarChart2,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiX,
  FiChevronDown
} from "react-icons/fi";
import ProductForm from "@/components/ProductForm";
import FAQManagement from "@/components/FAQManagement";

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

// تابع تصحیح شده برای تبدیل ObjectId به URL
const getImageUrl = (imageId: string): string => {
  if (!imageId || imageId === 'placeholder') {
    return '/placeholder.svg';
  }
  
  // اگر قبلاً URL کامل است
  if (imageId.startsWith('http') || imageId.startsWith('https')) {
    return imageId;
  }
  
  // اگر مسیر نسبی است
  if (imageId.startsWith('/')) {
    return imageId;
  }
  
  // اگر ObjectId است، به endpoint فایل‌ها لینک بده
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  if (baseUrl) {
    return `${baseUrl}/api/files/${imageId}`;
  }
  
  // در حالت توسعه
  return `/api/files/${imageId}`;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [stockFilter, setStockFilter] = useState("همه");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, stockFilter]);

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
        console.error("خطا در دریافت دسته‌بندی‌ها:");
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

  const filterProducts = () => {
    let filtered = [...products];

    // جستجو
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فیلتر دسته‌بندی
    if (selectedCategory !== "همه") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // فیلتر موجودی
    if (stockFilter === "موجود") {
      filtered = filtered.filter(product => product.inStock);
    } else if (stockFilter === "ناموجود") {
      filtered = filtered.filter(product => !product.inStock);
    }

    setFilteredProducts(filtered);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12">
      {/* هدر موبایل */}
      <div className="mt-20 lg:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">پنل مدیریت</h1>
            <p className="text-xs text-gray-500">خوش آمدید، {session?.user?.name}</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <FiPlus size={16} />
            افزودن محصول
          </button>
        </div>

        {/* دکمه فیلترهای موبایل */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700"
          >
            <span className="flex items-center gap-2">
              <FiFilter size={16} />
              فیلترها
            </span>
            <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* فیلترهای موبایل (قابل جمع شدن) */}
        {showFilters && (
          <div className="px-4 pb-3 space-y-3">
            {/* جستجو */}
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="جستجوی محصول..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="flex gap-2">
              {/* دسته‌بندی */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              >
                <option value="همه">همه دسته‌بندی‌ها</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* وضعیت موجودی */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              >
                <option value="همه">همه</option>
                <option value="موجود">موجود</option>
                <option value="ناموجود">ناموجود</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* فرم محصول در موبایل (مدال) */}
      {isFormOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? "ویرایش محصول" : "افزودن محصول"}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <ProductForm 
                product={editingProduct}
                onSuccess={() => {
                  setEditingProduct(null);
                  setIsFormOpen(false);
                  fetchProducts();
                  toast.success(editingProduct ? "محصول ویرایش شد" : "محصول اضافه شد");
                }}
                existingCategories={categories}
             
              />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 pt-4 lg:pt-28"> {/* افزایش pt برای دسکتاپ */}
        
        {/* بخش دکمه ثبت محصول در دسکتاپ - در بالای صفحه */}
        <div className="hidden lg:block mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">پنل مدیریت محصولات</h1>
              <p className="text-gray-500 mt-1">
                خوش آمدید، <span className="font-medium text-gray-900">{session?.user?.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                نمایش {filteredProducts.length} از {products.length} محصول
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiPlus size={18} />
                افزودن محصول جدید
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* محتوای اصلی */}
          <div className="flex-1">
            {/* فیلترهای دسکتاپ */}
            <div className="hidden lg:block mb-6">
              <div className="flex gap-4 items-center">
                {/* جستجو */}
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="جستجوی محصول..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* دسته‌بندی */}
                <div className="w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="همه">همه دسته‌بندی‌ها</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* وضعیت موجودی */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setStockFilter("همه")}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      stockFilter === "همه" 
                        ? "bg-gray-800 text-white" 
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    همه
                  </button>
                  <button
                    onClick={() => setStockFilter("موجود")}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      stockFilter === "موجود" 
                        ? "bg-green-600 text-white" 
                        : "bg-white text-gray-700 border border-gray-200 hover:border-green-300"
                    }`}
                  >
                    موجود
                  </button>
                  <button
                    onClick={() => setStockFilter("ناموجود")}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      stockFilter === "ناموجود" 
                        ? "bg-red-600 text-white" 
                        : "bg-white text-gray-700 border border-gray-200 hover:border-red-300"
                    }`}
                  >
                    ناموجود
                  </button>
                </div>
              </div>
            </div>

            {/* کارت آمار در دسکتاپ - بالای لیست */}
            <div className="hidden lg:block mb-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiBarChart2 className="text-blue-600" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">آمار کلی</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <div className="text-blue-600 font-bold text-2xl mb-1">{stats.totalProducts}</div>
                    <div className="text-sm text-gray-600">کل محصولات</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-green-600 font-bold text-2xl mb-1">{stats.inStock}</div>
                    <div className="text-sm text-gray-600">موجود</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl text-center">
                    <div className="text-red-600 font-bold text-2xl mb-1">{stats.outOfStock}</div>
                    <div className="text-sm text-gray-600">ناموجود</div>
                  </div>
                </div>
              </div>
            </div>

            {/* لیست محصولات */}
            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* هدر لیست */}
              <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">محصولات</h2>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {filteredProducts.length} محصول
                  </div>
                </div>
              </div>

              {/* لیست */}
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <FiPackage size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">محصولی یافت نشد</h3>
                  <p className="text-gray-500 text-center max-w-sm mb-6">
                    {searchTerm || selectedCategory !== "همه" || stockFilter !== "همه" 
                      ? "هیچ محصولی با فیلترهای انتخاب شده مطابقت ندارد." 
                      : "هنوز هیچ محصولی اضافه نشده است."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("همه");
                      setStockFilter("همه");
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    حذف فیلترها
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    // گرفتن اولین تصویر از آرایه images
                    const firstImage = product.images && product.images.length > 0 
                      ? product.images[0] 
                      : 'placeholder';
                    
                    // تبدیل imageId به URL قابل استفاده
                    const imageUrl = getImageUrl(firstImage);
                    
                    return (
                      <div key={product.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* تصویر */}
                          <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                            {product.images && product.images[0] ? (
                              <img
                                src={imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // اگر تصویر لود نشد، جایگزین کنیم
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiPackage size={32} />
                              </div>
                            )}
                          </div>

                          {/* اطلاعات */}
                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <h3 className="font-bold text-gray-900 text-base mb-1">{product.title}</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {product.category}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    product.inStock 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {product.inStock ? 'موجود' : 'ناموجود'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* دکمه‌های عمل */}
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    if (window.innerWidth < 1024) {
                                      setIsFormOpen(true);
                                    }
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <FiEdit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-500 mb-1">قیمت</div>
                                <div className="font-bold text-gray-900">
                                  {product.price.toLocaleString()} تومان
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500 mb-1">کد محصول</div>
                                <div className="font-mono text-sm text-gray-900">
                                  {product.code || 'ندارد'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* مدیریت FAQ */}
            <div className="mt-6">
              <FAQManagement />
            </div>
          </div>

          {/* فرم محصول در دسکتاپ - به جای سایدبار */}
          <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-32 space-y-6"> {/* افزایش top برای قرار گرفتن زیر navbar */}
              
              {/* فرم محصول */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {editingProduct ? "ویرایش محصول" : "افزودن محصول"}
                  </h2>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className={`p-2 rounded-lg ${editingProduct ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FiPlus size={18} className={editingProduct ? 'rotate-45' : ''} />
                  </button>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* فرم محصول در دسکتاپ (مدال برای حالت ویرایش) */}
      {isFormOpen && window.innerWidth >= 1024 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "ویرایش محصول" : "افزودن محصول"}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <ProductForm 
                product={editingProduct}
                onSuccess={() => {
                  setEditingProduct(null);
                  setIsFormOpen(false);
                  fetchProducts();
                  toast.success(editingProduct ? "محصول ویرایش شد" : "محصول اضافه شد");
                }}
                existingCategories={categories}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}