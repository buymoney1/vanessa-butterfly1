// components/FAQManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { FiHelpCircle, FiEdit2, FiTrash2, FiPlus, FiChevronUp, FiChevronDown, FiSave, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "", isActive: true });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/faqs");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.faqs) {
        // مرتب سازی بر اساس order
        const sortedFaqs = data.faqs.sort((a: FAQ, b: FAQ) => a.order - b.order);
        setFaqs(sortedFaqs);
      } else {
        toast.error(data.error || "خطا در دریافت سوالات متداول");
        setFaqs([]);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("خطا در اتصال به سرور");
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      toast.error("لطفاً سوال و جواب را وارد کنید");
      return;
    }

    try {
      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: newFAQ.question.trim(),
          answer: newFAQ.answer.trim(),
          isActive: newFAQ.isActive,
          order: faqs.length, // آخرین موقعیت
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("سوال جدید اضافه شد");
          setNewFAQ({ question: "", answer: "", isActive: true });
          setIsAdding(false);
          fetchFAQs();
        } else {
          toast.error(data.error || "خطا در افزودن سوال");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "خطا در افزودن سوال");
      }
    } catch (error) {
      console.error("Error adding FAQ:", error);
      toast.error("مشکلی پیش آمده است");
    }
  };

  
  // در بخش handleUpdateFAQ کامپوننت FAQManagement این تغییرات را اعمال کنید:
const handleUpdateFAQ = async (faq: FAQ) => {
    try {
      const response = await fetch(`/api/faqs/${faq.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          isActive: faq.isActive
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("سوال به‌روزرسانی شد");
          setEditingId(null);
          fetchFAQs();
        } else {
          toast.error(data.error || "خطا در به‌روزرسانی");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "خطا در به‌روزرسانی");
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("مشکلی پیش آمده است");
    }
  };
  
  // در بخش handleReorder:
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = faqs.findIndex(f => f.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === faqs.length - 1)) {
      return;
    }
  
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // تعویض order
    [newFaqs[index].order, newFaqs[targetIndex].order] = 
    [newFaqs[targetIndex].order, newFaqs[index].order];
    
    // مرتب سازی موقت
    newFaqs.sort((a, b) => a.order - b.order);
    
    setFaqs(newFaqs);
  
    // ذخیره تغییرات order در دیتابیس
    try {
      await fetch(`/api/faqs/${id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order: newFaqs.find(f => f.id === id)?.order 
        }),
      });
      
      // همچنین order آیتم مقابل را نیز به‌روزرسانی کنید
      const targetId = newFaqs[targetIndex].id;
      await fetch(`/api/faqs/${targetId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order: newFaqs.find(f => f.id === targetId)?.order 
        }),
      });
    } catch (error) {
      console.error("Error reordering FAQ:", error);
      toast.error("خطا در تغییر ترتیب");
      // در صورت خطا، لیست را دوباره بارگیری کنید
      fetchFAQs();
    }
  };
  
  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("آیا از حذف این سوال مطمئنید؟ این عملیات غیرقابل بازگشت است.")) return;

    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("سوال حذف شد");
          fetchFAQs();
          if (editingId === id) {
            setEditingId(null);
          }
        } else {
          toast.error(data.error || "خطا در حذف سوال");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "خطا در حذف سوال");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("مشکلی پیش آمده است");
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* هدر */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiHelpCircle className="text-blue-500" size={18} />
          </div>
          <div className="flex-1 sm:flex-auto">
            <h2 className="font-bold text-gray-900 text-base sm:text-lg">مدیریت سوالات متداول</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">سوالات پرتکرار و پاسخ‌های آنها</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FiPlus size={16} />
          <span>سوال جدید</span>
        </button>
      </div>

      {/* فرم افزودن جدید */}
      {isAdding && (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-blue-50/50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سوال *
              </label>
              <input
                type="text"
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                placeholder="سوال متداول را وارد کنید"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                پاسخ *
              </label>
              <textarea
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base"
                placeholder="پاسخ کامل را وارد کنید"
                dir="rtl"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFAQ.isActive}
                    onChange={(e) => setNewFAQ({ ...newFAQ, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700">فعال</span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewFAQ({ question: "", answer: "", isActive: true });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  انصراف
                </button>
                <button
                  onClick={handleAddFAQ}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FiSave size={16} />
                  <span>ذخیره سوال</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* لیست سوالات */}
      <div className="divide-y divide-gray-100">
        {faqs.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiHelpCircle className="text-gray-400" size={20} />
            </div>
            <h3 className="text-gray-900 font-medium text-sm sm:text-base mb-1.5 sm:mb-2">هنوز سوالی اضافه نشده است</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              اولین سوال متداول را با کلیک بر روی دکمه "سوال جدید" اضافه کنید
            </p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
              {editingId === faq.id ? (
                // حالت ویرایش - موبایل
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سوال
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const updatedFaqs = faqs.map(f => 
                          f.id === faq.id ? { ...f, question: e.target.value } : f
                        );
                        setFaqs(updatedFaqs);
                      }}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      پاسخ
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const updatedFaqs = faqs.map(f => 
                          f.id === faq.id ? { ...f, answer: e.target.value } : f
                        );
                        setFaqs(updatedFaqs);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base"
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={faq.isActive}
                          onChange={(e) => {
                            const updatedFaqs = faqs.map(f => 
                              f.id === faq.id ? { ...f, isActive: e.target.checked } : f
                            );
                            setFaqs(updatedFaqs);
                          }}
                          className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400"
                        />
                        <span className="text-sm text-gray-700">فعال</span>
                      </label>
                      <div className="flex items-center gap-1 sm:hidden">
                        <button
                          onClick={() => handleReorder(faq.id, 'up')}
                          className="p-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
                          disabled={faqs.findIndex(f => f.id === faq.id) === 0}
                        >
                          <FiChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => handleReorder(faq.id, 'down')}
                          className="p-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
                          disabled={faqs.findIndex(f => f.id === faq.id) === faqs.length - 1}
                        >
                          <FiChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-1 hidden sm:flex">
                      <button
                        onClick={() => handleReorder(faq.id, 'up')}
                        className="p-1.5 text-gray-500 hover:text-gray-700"
                        disabled={faqs.findIndex(f => f.id === faq.id) === 0}
                      >
                        <FiChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleReorder(faq.id, 'down')}
                        className="p-1.5 text-gray-500 hover:text-gray-700"
                        disabled={faqs.findIndex(f => f.id === faq.id) === faqs.length - 1}
                      >
                        <FiChevronDown size={16} />
                      </button>
                    </div>
                    
                    <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => handleUpdateFAQ(faq)}
                        className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center justify-center gap-1.5"
                      >
                        <FiSave size={14} />
                        <span>ذخیره</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // حالت نمایش - موبایل
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base flex-1 flex items-start gap-1.5">
                          <span className="text-blue-500 text-xs sm:text-sm mt-0.5">Q:</span>
                          <span className="text-right leading-relaxed">{faq.question}</span>
                        </h3>
                        
                        {/* دکمه‌های عملیات - موبایل */}
                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 sm:hidden">
                            <button
                              onClick={() => handleReorder(faq.id, 'up')}
                              className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              disabled={faqs.findIndex(f => f.id === faq.id) === 0}
                            >
                              <FiChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => handleReorder(faq.id, 'down')}
                              className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              disabled={faqs.findIndex(f => f.id === faq.id) === faqs.length - 1}
                            >
                              <FiChevronDown size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingId(faq.id)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ویرایش"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                        <p className="text-gray-700 text-sm leading-relaxed text-right">{faq.answer}</p>
                      </div>
                    </div>
                    
                    {/* دکمه‌های عملیات - دسکتاپ */}
                    <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(faq.id, 'up')}
                          className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={faqs.findIndex(f => f.id === faq.id) === 0}
                        >
                          <FiChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => handleReorder(faq.id, 'down')}
                          className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={faqs.findIndex(f => f.id === faq.id) === faqs.length - 1}
                        >
                          <FiChevronDown size={16} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => setEditingId(faq.id)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {faq.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                      <span className="text-gray-600">ترتیب: {faq.order + 1}</span>
                    </div>
                    <div className="text-xs text-gray-400 text-left sm:text-right">
                      {faq.updatedAt ? new Date(faq.updatedAt).toLocaleDateString('fa-IR') : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}