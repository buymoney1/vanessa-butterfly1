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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* هدر */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FiHelpCircle className="text-blue-500" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">مدیریت سوالات متداول</h2>
            <p className="text-sm text-gray-500">سوالات پرتکرار و پاسخ‌های آنها</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FiPlus size={18} />
          سوال جدید
        </button>
      </div>

      {/* فرم افزودن جدید */}
      {isAdding && (
        <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سوال *
              </label>
              <input
                type="text"
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                placeholder="پاسخ کامل را وارد کنید"
                dir="rtl"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewFAQ({ question: "", answer: "", isActive: true });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={handleAddFAQ}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiSave size={16} />
                  ذخیره سوال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* لیست سوالات */}
      <div className="divide-y divide-gray-100">
        {faqs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiHelpCircle className="text-gray-400" size={24} />
            </div>
            <h3 className="text-gray-900 font-medium mb-2">هنوز سوالی اضافه نشده است</h3>
            <p className="text-gray-500 text-sm">
              اولین سوال متداول را با کلیک بر روی دکمه "سوال جدید" اضافه کنید
            </p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              {editingId === faq.id ? (
                // حالت ویرایش
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
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(faq.id, 'up')}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          disabled={faqs.findIndex(f => f.id === faq.id) === 0}
                        >
                          <FiChevronUp size={18} />
                        </button>
                        <button
                          onClick={() => handleReorder(faq.id, 'down')}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          disabled={faqs.findIndex(f => f.id === faq.id) === faqs.length - 1}
                        >
                          <FiChevronDown size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => handleUpdateFAQ(faq)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                      >
                        <FiSave size={14} />
                        ذخیره تغییرات
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // حالت نمایش
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-lg mb-2 flex items-center gap-2">
                        <span className="text-blue-500">Q:</span>
                        {faq.question}
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
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
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {faq.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                      <span>ترتیب: {faq.order + 1}</span>
                    </div>
                    <div className="text-xs text-gray-400">
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