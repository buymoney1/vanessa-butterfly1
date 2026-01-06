'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModernAIChatWidget from '@/components/AIChatBox';


export default function AIChatPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // شبیه‌سازی بارگذاری
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleCloseFullScreen = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری دستیار هوشمند...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <ModernAIChatWidget 
        isFullScreen={true} 
        onCloseFullScreen={handleCloseFullScreen}
      />
    </div>
  );
}