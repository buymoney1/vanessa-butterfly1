// components/FAQSection.tsx
"use client";

import { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/faqs");
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.faqs) {
          // فقط FAQهای فعال را بگیر
          const activeFaqs = data.faqs.filter((faq: any) => faq.isActive);
          setFaqs(activeFaqs);
        }
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            سوالات متداول
          </h2>
          <p className="text-gray-600">
            پاسخ پرسش‌های پرتکرار کاربران را اینجا پیدا کنید
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-right hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm">
                    {faq.question}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  {expandedId === faq.id ? (
                    <FiChevronUp className="text-blue-500" size={20} />
                  ) : (
                    <FiChevronDown className="text-gray-400" size={20} />
                  )}
                </div>
              </button>
              
              {expandedId === faq.id && (
                <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}