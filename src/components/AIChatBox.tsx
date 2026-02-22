'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Maximize2, 
  Minimize2,
  Settings,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Zap,
  Expand,
  ExternalLink,
  Home,
  Trash2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  confidence?: number;
  source?: 'exact' | 'similar' | 'keyword' | 'generated' | 'fallback';
  cached?: boolean;
}

interface Suggestion {
  text: string;
  icon?: string;
  category?: string;
}

interface ModernAIChatWidgetProps {
  isFullScreen?: boolean;
  onCloseFullScreen?: () => void;
}

export default function ModernAIChatWidget({ 
  isFullScreen = false, 
  onCloseFullScreen 
}: ModernAIChatWidgetProps) {
  // State برای کنترل باز/بسته بودن پاپ‌آپ
  const [isOpen, setIsOpen] = useState(isFullScreen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isFullscreenMode, setIsFullscreenMode] = useState(isFullScreen);
  
  // State برای چت
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'سلام! 👋 من دستیار هوش مصنوعی شما هستم. چطور می‌توانم کمکتان کنم؟',
      sender: 'bot',
      timestamp: new Date(),
      confidence: 1,
      source: 'exact'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [userFeedback, setUserFeedback] = useState<{[key: string]: 'like' | 'dislike'}>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // دسته‌بندی‌های پیشنهادات
  const suggestions: Suggestion[] = [
    // عمومی
    { text: 'چطور ثبت نام کنم؟', icon: '📝', category: 'general' },
    { text: 'راهنمایی برای خرید', icon: '🛒', category: 'general' },
    { text: 'قوانین سایت', icon: '📜', category: 'general' },
    { text: 'تماس با پشتیبانی', icon: '📞', category: 'general' },
    
    // محصولات
    { text: 'جدیدترین محصولات', icon: '🆕', category: 'products' },
    { text: 'محصولات پرطرفدار', icon: '🔥', category: 'products' },
    { text: 'تخفیف‌های ویژه', icon: '🎁', category: 'products' },
    { text: 'مقایسه محصولات', icon: '⚖️', category: 'products' },
    
    // قیمت و پرداخت
    { text: 'قیمت محصولات', icon: '💰', category: 'payment' },
    { text: 'روش‌های پرداخت', icon: '💳', category: 'payment' },
    { text: 'کارت هدیه', icon: '🎫', category: 'payment' },
    { text: 'تضمین بازگشت وجه', icon: '🔄', category: 'payment' },
    
    // ارسال و تحویل
    { text: 'زمان تحویل', icon: '⏰', category: 'shipping' },
    { text: 'هزینه بسته بندی و کارتن', icon: '🚚', category: 'shipping' },
    { text: 'پیگیری سفارش', icon: '📍', category: 'shipping' },
    { text: 'شهرهای تحت پوشش', icon: '🗺️', category: 'shipping' },
    
    // خدمات
    { text: 'گارانتی محصولات', icon: '🛡️', category: 'services' },
    { text: 'بازگشت کالا', icon: '📦', category: 'services' },
    { text: 'نصب و راه‌اندازی', icon: '🔧', category: 'services' },
    { text: 'آموزش استفاده', icon: '🎓', category: 'services' },
  ];

  // دسته‌بندی‌ها
  const categories = [
    { id: 'all', name: 'همه', icon: '🌟' },
    { id: 'general', name: 'عمومی', icon: 'ℹ️' },
    { id: 'products', name: 'محصولات', icon: '🛍️' },
    { id: 'payment', name: 'پرداخت', icon: '💵' },
    { id: 'shipping', name: 'ارسال', icon: '🚛' },
    { id: 'services', name: 'خدمات', icon: '🔧' },
  ];

  // فیلتر پیشنهادات بر اساس دسته‌بندی
  const filteredSuggestions = activeCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === activeCategory);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Set fullscreen mode based on prop
  useEffect(() => {
    setIsFullscreenMode(isFullScreen);
    setIsOpen(isFullScreen);
  }, [isFullScreen]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem('ai_chat_history');
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const messagesWithDates = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        }
      } catch (error) {
        console.error('خطا در بارگذاری تاریخچه چت:', error);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Handle sending message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: 'bot',
        timestamp: new Date(),
        confidence: data.confidence,
        source: data.source,
        cached: data.cached
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.',
        sender: 'bot',
        timestamp: new Date(),
        confidence: 0,
        source: 'fallback'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    setInput(text);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    setTimeout(() => {
      setShowSuggestions(false);
    }, 300);
  };

  // Handle feedback
  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setUserFeedback(prev => ({ ...prev, [messageId]: type }));
    
    fetch('/api/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, feedback: type })
    }).catch(console.error);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const clearChat = () => {
    if (confirm('آیا از پاک کردن تاریخچه چت مطمئنید؟')) {
      setMessages([
        {
          id: '1',
          text: 'سلام! 👋 من دستیار هوش مصنوعی شما هستم. چطور می‌توانم کمکتان کنم؟',
          sender: 'bot',
          timestamp: new Date(),
          confidence: 1,
          source: 'exact'
        }
      ]);
      localStorage.removeItem('ai_chat_history');
      setShowSuggestions(true);
    }
  };

  // Get source badge color
  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'exact': return 'bg-green-100 text-green-800';
      case 'similar': return 'bg-blue-100 text-blue-800';
      case 'generated': return 'bg-yellow-100 text-yellow-800';
      case 'keyword': return 'bg-purple-100 text-purple-800';
      case 'fallback': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get source text
  const getSourceText = (source?: string) => {
    switch (source) {
      case 'exact': return 'پاسخ دقیق';
      case 'similar': return 'پاسخ مرتبط';
      case 'generated': return 'پاسخ هوشمند';
      case 'keyword': return 'بر اساس کلمات کلیدی';
      case 'fallback': return 'پاسخ عمومی';
      default: return 'پاسخ';
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (isFullscreenMode && onCloseFullScreen) {
      onCloseFullScreen();
    } else {
      window.open('/ai-chat', '_blank');
    }
  };

  // Calculate container dimensions
  const containerClass = isFullscreenMode 
    ? 'fixed inset-0 z-50 w-full h-full bg-white'
    : 'fixed bottom-24 right-6 z-50 w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up';

  const messagesContainerClass = isFullscreenMode
    ? 'h-[calc(100vh-155px)]'
    : 'flex-1';

  // If minimized and not fullscreen
  if (isMinimized && isOpen && !isFullscreenMode) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 animate-pulse"
          aria-label="باز کردن چت هوش مصنوعی"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
        </button>

        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/20 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-semibold">دستیار هوشمند</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
                title="بزرگ کردن"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
                title="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-50">
            <p className="text-xs text-gray-600 text-center">
              چت کوچک شده است. برای ادامه گفتگو کلیک کنید.
            </p>
            <button
              onClick={() => setIsMinimized(false)}
              className="w-full mt-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition"
            >
              ادامه گفتگو
            </button>
          </div>
        </div>
      </>
    );
  }

  // Floating button (only show if not in fullscreen mode and chat is closed)
  if (!isOpen && !isFullscreenMode) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-2xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-110 animate-pulse"
        aria-label="باز کردن چت هوش مصنوعی"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></span>
      </button>
    );
  }

  return (
    <>
      {/* پاپ‌آپ چت */}
      {(isOpen || isFullscreenMode) && (
        <div 
          ref={chatContainerRef}
          className={containerClass}
        >
          {/* هدر */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">دستیار هوشمند</h2>
                <p className="text-xs text-white/80">پاسخگوی سوالات شما</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* دکمه صفحه کامل/بازگشت */}
              {!isFullscreenMode ? (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="صفحه کامل"
                >
                  <Expand className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onCloseFullScreen}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="بازگشت"
                >
                  <Home className="w-4 h-4" />
                </button>
              )}
              
              {/* دکمه کوچک کردن (فقط در حالت پاپ‌آپ) */}
              {!isFullscreenMode && (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="کوچک کردن"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              
              {/* دکمه پاک کردن چت */}
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                title="پاک کردن چت"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              {/* دکمه بستن (فقط در حالت پاپ‌آپ) */}
              {!isFullscreenMode && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="بستن"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>



          {/* بخش پیام‌ها */}
          <div className={`overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white ${messagesContainerClass}`}>
            {/* دکمه باز کردن پیشنهادات اگر بسته است و در حالت پاپ‌آپ */}
 
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 shadow-sm rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${message.sender === 'user' 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100'
                      }`}>
                        {message.sender === 'bot' ? (
                          <Bot className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold">
                            {message.sender === 'bot' ? 'دستیار هوشمند' : 'شما'}
                          </span>
                          <div className="flex items-center gap-2">
                            {message.source && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getSourceColor(message.source)}`}>
                                {getSourceText(message.source)}
                              </span>
                            )}
                     
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-xs leading-relaxed">
                          {message.text}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1 text-xs opacity-75">
                            <span>{message.timestamp.toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                            {message.confidence !== undefined && message.sender === 'bot' && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="font-medium">
                                  اطمینان: {(message.confidence * 100).toFixed(0)}%
                                </span>
                              </>
                            )}
                          </div>
                          {message.sender === 'bot' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleFeedback(message.id, 'like')}
                                className={`p-1 rounded ${userFeedback[message.id] === 'like' 
                                  ? 'text-green-600 bg-green-100' 
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                }`}
                                title="پاسخ مفید بود"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'dislike')}
                                className={`p-1 rounded ${userFeedback[message.id] === 'dislike' 
                                  ? 'text-red-600 bg-red-100' 
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                                title="پاسخ مفید نبود"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                        <Bot className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span className="text-xs text-gray-600">در حال پردازش سوال شما...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* بخش ورودی */}
          <div className="border-t border-gray-200 p-3 bg-white">
    
    
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="سوال خود را اینجا بنویسید..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gray-50"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute left-3 bottom-3 p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                title="ارسال پیام"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

    


          </div>
        </div>
      )}

      {/* استایل‌های انیمیشن */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        
        /* اسکرول بار زیبا */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
      `}</style>
    </>
  );
}