'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Edit, Trash2, 
  Plus, CheckCircle, XCircle,
  Loader2 
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  creator?: {
    name: string;
    email: string;
  };
}

export default function AITrainingPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  
  // فرم داده‌ها
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // دریافت FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/faqs?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setFaqs(data.data.faqs);
      }
    } catch (error) {
      console.error('خطا در دریافت FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // فیلتر FAQs
  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  // حذف FAQ
  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این سوال مطمئنید؟')) return;

    try {
      const response = await fetch(`/api/ai/faqs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        fetchFAQs();
        alert('با موفقیت حذف شد');
      } else {
        alert(data.error || 'خطا در حذف');
      }
    } catch (error) {
      console.error('خطا در حذف:', error);
      alert('خطا در حذف');
    }
  };

  // ذخیره FAQ
  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      alert('لطفاً سوال و جواب را وارد کنید');
      return;
    }

    try {
      const url = editingFaq 
        ? `/api/ai/faqs/${editingFaq.id}`
        : '/api/ai/train';

      const response = await fetch(url, {
        method: editingFaq ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          answer,
          order,
          isActive 
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        fetchFAQs();
        resetForm();
        alert(editingFaq ? 'ویرایش شد' : 'اضافه شد');
      } else {
        alert(data.error || 'خطا در ذخیره');
      }
    } catch (error) {
      console.error('خطا در ذخیره:', error);
      alert('خطا در ذخیره');
    }
  };

  // شروع ویرایش
  const startEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setOrder(faq.order);
    setIsActive(faq.isActive);
    setShowForm(true);
  };

  // ریست فرم
  const resetForm = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setOrder(0);
    setIsActive(true);
    setShowForm(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          آموزش هوش مصنوعی
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <Plus className="w-5 h-5" />
          سوال جدید
        </button>
      </div>

      {/* فرم ایجاد/ویرایش */}
      {showForm && (
        <div className="mb-8 p-6 bg-white border rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingFaq ? 'ویرایش سوال' : 'سوال جدید'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">سوال</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="سوال را وارد کنید..."
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">پاسخ</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 border rounded-lg h-40"
                placeholder="پاسخ را وارد کنید..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">ترتیب نمایش</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="isActive" className="font-medium">
                  فعال
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {editingFaq ? 'ویرایش' : 'ذخیره'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* جستجو */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در سوالات..."
            className="w-full p-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* جدول FAQs */}
      <div className="bg-white border rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            هیچ سوالی یافت نشد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-right font-semibold">سوال</th>
                  <th className="p-4 text-right font-semibold">پاسخ</th>
                  <th className="p-4 text-right font-semibold">وضعیت</th>
                  <th className="p-4 text-right font-semibold">ترتیب</th>
                  <th className="p-4 text-right font-semibold">تاریخ</th>
                  <th className="p-4 text-right font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFAQs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="p-4 max-w-xs">
                      <div className="font-medium">{faq.question}</div>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="text-gray-600 line-clamp-2">
                        {faq.answer}
                      </div>
                    </td>
                    <td className="p-4">
                      {faq.isActive ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          فعال
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-5 h-5" />
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-full">
                        {faq.order}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(faq.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(faq)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="ویرایش"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>تعداد سوالات: {faqs.length}</p>
        <p className="mt-2">
          💡 نکته: این سیستم کاملاً رایگان است و از Hugging Face با مدل‌های رایگان استفاده می‌کند.
        </p>
      </div>
    </div>
  );
}