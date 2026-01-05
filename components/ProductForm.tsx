// components/ProductForm.tsx
"use client";

import { useState, useEffect } from "react";
import { FiUpload, FiX, FiPlus, FiTrash2, FiCopy, FiPackage, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

interface ProductFormProps {
  product?: {
    id: string;
    code?: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    inStock: boolean;
  } | null;
  onSuccess: () => void;
  existingCategories?: string[];
}

export default function ProductForm({ product, onSuccess, existingCategories = [] }: ProductFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    price: "",
    category: "",
    newCategory: "",
    inStock: true,
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(existingCategories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [suggestedCodes, setSuggestedCodes] = useState<string[]>([]);

  // توابع تولید کد پیشنهادی
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PRD-${timestamp}-${random}`;
  };

  const generatePersianProductCode = () => {
    const persianChars = 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
    let result = 'کد-';
    for (let i = 0; i < 4; i++) {
      result += persianChars[Math.floor(Math.random() * persianChars.length)];
    }
    result += '-';
    for (let i = 0; i < 3; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  };

  const generateSimpleProductCode = () => {
    const timestamp = Date.now().toString().slice(-8);
    return `P-${timestamp}`;
  };

  const generateCategoryBasedCode = (category: string) => {
    if (!category) return generateProductCode();
    
    const categoryPrefix = category.slice(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${categoryPrefix}-${Date.now().toString().slice(-6)}-${random}`;
  };

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || "",
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        newCategory: "",
        inStock: product.inStock,
      });
      setImagePreviews(product.images);
      
      if (!product.code) {
        // برای محصول موجود بدون کد، پیشنهادات تولید کن
        generateCodeSuggestions(product.category);
      }
    } else {
      // برای محصول جدید، پیشنهادات تولید کن
      generateCodeSuggestions("");
    }
    
    // اضافه کردن دسته‌بندی محصول به لیست اگر وجود ندارد
    if (product?.category && !categories.includes(product.category)) {
      setCategories(prev => [...prev, product.category]);
    }
    
    // دریافت دسته‌بندی‌های موجود از API
    fetchCategories();
  }, [product]);

  useEffect(() => {
    // هر بار که دسته‌بندی تغییر کرد، پیشنهادات جدید تولید کن
    if (formData.category && !showNewCategory) {
      generateCodeSuggestions(formData.category);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", error);
    }
  };

  const generateCodeSuggestions = (category: string) => {
    const suggestions = [
      generateProductCode(),
      generatePersianProductCode(),
      generateSimpleProductCode(),
      generateCategoryBasedCode(category),
      `محصول-${Date.now().toString().slice(-6)}`,
    ];
    setSuggestedCodes(suggestions);
    
    // اگر کد خالی است، اولین پیشنهاد را قرار بده
    if (!formData.code.trim()) {
      setFormData(prev => ({ ...prev, code: suggestions[0] }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "category" && value === "new") {
      setShowNewCategory(true);
    } else if (name === "category" && value !== "new") {
      setShowNewCategory(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast.error("حداکثر ۱۰ تصویر مجاز است");
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // ایجاد پیش‌نمایش
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    if (imagePreviews[index].startsWith("data:")) {
      // حذف فایل جدید
      setImages(prev => prev.filter((_, i) => i !== index - (imagePreviews.length - images.length)));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCategory = () => {
    if (formData.newCategory.trim() === "") {
      toast.error("نام دسته‌بندی را وارد کنید");
      return;
    }
    
    const newCategory = formData.newCategory.trim();
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
    
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      newCategory: ""
    }));
    setShowNewCategory(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formData.code);
    toast.success("کد محصول کپی شد");
  };

  const handleUseSuggestedCode = (suggestedCode: string) => {
    setFormData(prev => ({ ...prev, code: suggestedCode }));
    toast.success("کد پیشنهادی انتخاب شد");
  };

  const handleGenerateNewSuggestions = () => {
    generateCodeSuggestions(formData.category);
    toast.success("پیشنهادات جدید تولید شدند");
  };

// components/ProductForm.tsx (قسمت handleSubmit)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("code", formData.code.trim());
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category", showNewCategory ? formData.newCategory : formData.category);
    formDataToSend.append("inStock", formData.inStock.toString());
    
    // اضافه کردن تصاویر
    images.forEach((image, index) => {
      formDataToSend.append(`image${index}`, image);
    });

    // اگر در حال ویرایش هستیم و تصاویر قبلی داریم
    if (product) {
      imagePreviews.forEach((preview, index) => {
        if (!preview.startsWith("data:")) {
          formDataToSend.append("existingImages", preview);
        }
      });
    }

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      body: formDataToSend,
    });

    // بررسی وجود response
    if (!response) {
      throw new Error("پاسخ از سرور دریافت نشد");
    }

    // بررسی وضعیت response
    if (response.ok) {
      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.warn("خطا در parsing پاسخ:", parseError);
        result = {};
      }
      
      // ذخیره دسته‌بندی جدید
      const selectedCategory = showNewCategory ? formData.newCategory : formData.category;
      if (selectedCategory && !categories.includes(selectedCategory)) {
        try {
          await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: selectedCategory }),
          });
        } catch (categoryError) {
          console.error("خطا در ذخیره دسته‌بندی:", categoryError);
          // خطا در ذخیره دسته‌بندی نباید فرآیند اصلی را متوقف کند
        }
      }

      toast.success(product ? "محصول به‌روزرسانی شد!" : "محصول اضافه شد!");
      resetForm();
      onSuccess();
    } else {
      // مدیریت خطا
      let errorData;
      try {
        const errorText = await response.text();
        errorData = errorText ? JSON.parse(errorText) : { error: "خطای ناشناخته" };
      } catch (parseError) {
        console.error("خطا در parsing خطا:", parseError);
        errorData = { 
          error: `خطای ${response.status}: ${response.statusText || "خطای سرور"}` 
        };
      }
      
      // اگر خطای تکراری بودن کد بود
      if (errorData.code === 'P2002' && errorData.meta?.target?.includes('code')) {
        toast.error("این کد محصول قبلاً استفاده شده است. لطفاً کد دیگری انتخاب کنید.");
      } else {
        toast.error(errorData.error || errorData.message || "خطایی رخ داد");
      }
    }
  } catch (error) {
    console.error("خطا در ذخیره محصول:", error);
    toast.error(error instanceof Error ? error.message : "ذخیره محصول ناموفق بود");
  } finally {
    setIsLoading(false);
  }
};
  const resetForm = () => {
    setFormData({
      code: generateProductCode(),
      title: "",
      description: "",
      price: "",
      category: "",
      newCategory: "",
      inStock: true,
    });
    setImages([]);
    setImagePreviews([]);
    setShowNewCategory(false);
    generateCodeSuggestions("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* کد محصول */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FiPackage className="text-blue-500" />
          کد محصول (اختیاری)


        </label>
        
        {/* فیلد ورود کد */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="کد محصول را وارد کنید (اختیاری)"
              dir="auto"
              maxLength={50}
            />

          </div>

        </div>

   

      </div>

      {/* عنوان محصول */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان محصول *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="عنوان کامل محصول را وارد کنید"
          dir="rtl"
        />
      </div>

      {/* توضیحات */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          توضیحات *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
          placeholder="توضیحات کامل محصول را بنویسید"
          dir="rtl"
        />
      </div>

      {/* قیمت و دسته‌بندی */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            قیمت (تومان) *
          </label>
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="1000"
              className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              
              dir="ltr"
            />
      
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            دسته‌بندی *
          </label>
          <div className="space-y-2">
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required={!showNewCategory}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              dir="rtl"
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ ایجاد دسته‌بندی جدید</option>
            </select>
            
            {showNewCategory && (
              <div className="flex gap-2">
                <input
                  type="text"
                  name="newCategory"
                  value={formData.newCategory}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="نام دسته‌بندی "
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiPlus />
                  
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* وضعیت موجودی */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <label className="text-sm font-medium text-gray-700">وضعیت موجودی</label>
          <p className="text-xs text-gray-500 mt-1">
            {formData.inStock ? "محصول قابل سفارش است" : "موجودی تمام شده"}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="inStock"
            name="inStock"
            checked={formData.inStock}
            onChange={handleInputChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>

      {/* تصاویر محصول */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          تصاویر محصول
          <span className="text-xs text-gray-500 mr-2">(حداکثر ۱۰ تصویر)</span>
        </label>
        
        {/* پیش‌نمایش تصاویر */}
        <div className="mb-4">
          {imagePreviews.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`پیش‌نمایش ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {imagePreviews.length < 10 && (
                <label className="cursor-pointer">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <FiUpload className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-500">افزودن تصویر</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUpload className="text-blue-500" size={24} />
              </div>
              <p className="text-gray-600 mb-2">تصاویر محصول را اینجا بکشید یا آپلود کنید</p>
              <p className="text-sm text-gray-500 mb-4">فرمت‌های مجاز: JPG, PNG, GIF (حداکثر ۵MB)</p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors cursor-pointer">
                <FiUpload />
                آپلود تصاویر
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
        
        {imagePreviews.length > 0 && imagePreviews.length < 10 && (
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            <FiUpload />
            افزودن تصاویر بیشتر
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* دکمه‌های ثبت */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                در حال ذخیره...
              </>
            ) : product ? (
              "به‌روزرسانی محصول"
            ) : (
              "افزودن محصول جدید"
            )}
          </button>
          
          {product && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  code: generateProductCode(),
                  title: "",
                  description: "",
                  price: "",
                  category: "",
                  newCategory: "",
                  inStock: true,
                });
                setImages([]);
                setImagePreviews([]);
                setShowNewCategory(false);
                generateCodeSuggestions("");
              }}
              className="py-3.5 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              محصول جدید
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          فیلدهای ستاره‌دار (*) اجباری هستند
        </p>
      </div>
    </form>
  );
}