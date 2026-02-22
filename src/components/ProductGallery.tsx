"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronRight, FiChevronLeft, FiZoomIn, FiX, FiMaximize, FiMinimize } from "react-icons/fi";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(Array(images.length).fill(false));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // وقتی تصویر تغییر کرد، وضعیت لود را ریست کنیم
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[selectedImage] = false;
      return newState;
    });
  }, [selectedImage]);

  // جلوگیری از اسکرول صفحه در حالت fullscreen
  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [showFullscreen]);

  // مدیریت کلید Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullscreen) {
        setShowFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreen]);

  const handleNext = () => {
    const nextIndex = (selectedImage + 1) % images.length;
    setSelectedImage(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (selectedImage - 1 + images.length) % images.length;
    setSelectedImage(prevIndex);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageError = (index: number) => {
    console.error(`تصویر ${index} لود نشد:`, images[index]);
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

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

  // پیش‌لود تصاویر
  useEffect(() => {
    images.forEach((imageId, index) => {
      const url = getImageUrl(imageId);
      const img = new Image();
      img.src = url;
      img.onload = () => handleImageLoad(index);
      img.onerror = () => handleImageError(index);
    });
  }, [images]);

  return (
    <div className="space-y-6">
      {/* گالری اصلی */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10">
        <div 
          className="relative aspect-[4/5]"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {/* لودر */}
          {!imageLoaded[selectedImage] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
              <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

          {/* تصویر اصلی */}
          <img
            src={getImageUrl(images[selectedImage])}
            alt={`تصویر اصلی ${selectedImage + 1}`}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded[selectedImage] ? 'opacity-100' : 'opacity-0'
            } ${isZoomed ? 'scale-110 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
            onLoad={() => handleImageLoad(selectedImage)}
            onError={() => handleImageError(selectedImage)}
            onClick={() => setIsZoomed(!isZoomed)}
            loading="lazy"
          />
          
          {/* دکمه‌های کنترل */}
          <div className="absolute top-4 left-4 flex space-x-2">
            <button
              className="bg-black/70 text-white p-2.5 rounded-full hover:bg-black/90 transition-all backdrop-blur-sm shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              title={isZoomed ? "کوچک‌نمایی" : "بزرگ‌نمایی"}
            >
              {isZoomed ? <FiMinimize size={18} /> : <FiZoomIn size={18} />}
            </button>

            <button
              className="bg-black/70 text-white p-2.5 rounded-full hover:bg-black/90 transition-all backdrop-blur-sm shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullscreen(true);
              }}
              title="نمایش تمام صفحه"
            >
              <FiMaximize size={18} />
            </button>
          </div>

          {/* دکمه‌های قبلی و بعدی */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all backdrop-blur-sm shadow-lg"
                disabled={!imageLoaded[selectedImage]}
              >
                <FiChevronRight size={22} />
              </button>
              <button
                onClick={handleNext}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all backdrop-blur-sm shadow-lg"
                disabled={!imageLoaded[selectedImage]}
              >
                <FiChevronLeft size={22} />
              </button>
            </>
          )}

          {/* شماره تصویر */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm shadow-lg">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* گالری کوچک تصاویر */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((imageId, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-300 ${
                selectedImage === index
                  ? "ring-2 ring-blue-500 scale-105"
                  : "opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              {/* لودر تامبنیل */}
              {!imageLoaded[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
              
              <img
                src={getImageUrl(imageId)}
                alt={`تصویر ${index + 1}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded[index] ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* حالت تمام صفحه - با z-index بسیار بالا */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* هدر - با دکمه بستن و کنترل‌ها */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFullscreen(false)}
                className="bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                aria-label="بستن"
              >
                <FiX size={20} />
              </button>
              <span className="text-white text-sm font-medium">
                {selectedImage + 1} / {images.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                aria-label={isZoomed ? "کوچک‌نمایی" : "بزرگ‌نمایی"}
              >
                {isZoomed ? <FiMinimize size={18} /> : <FiZoomIn size={18} />}
              </button>
              <button
                onClick={() => setShowFullscreen(false)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm transition-colors"
              >
                بستن (ESC)
              </button>
            </div>
          </div>

          {/* بدنه اصلی - تصویر در وسط */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {/* لودر */}
            {!imageLoaded[selectedImage] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            {/* تصویر تمام صفحه */}
            <img
              src={getImageUrl(images[selectedImage])}
              alt={`تصویر تمام صفحه ${selectedImage + 1}`}
              className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                imageLoaded[selectedImage] ? 'opacity-100' : 'opacity-0'
              } ${isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
              onLoad={() => handleImageLoad(selectedImage)}
              onError={() => handleImageError(selectedImage)}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>

          {/* دکمه‌های ناوبری */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-colors"
                disabled={!imageLoaded[selectedImage]}
                aria-label="تصویر قبلی"
              >
                <FiChevronRight size={26} />
              </button>
              <button
                onClick={handleNext}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-colors"
                disabled={!imageLoaded[selectedImage]}
                aria-label="تصویر بعدی"
              >
                <FiChevronLeft size={26} />
              </button>
            </>
          )}

          {/* گالری کوچک پایین */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-center space-x-2 overflow-x-auto py-2">
                {images.map((imageId, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                      selectedImage === index
                        ? "ring-2 ring-white scale-110"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {!imageLoaded[index] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    <img
                      src={getImageUrl(imageId)}
                      alt={`تصویر ${index + 1}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded[index] ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                  </button>
                ))}
              </div>
              
              {/* نقاط ناوبری */}
              <div className="flex justify-center space-x-2 mt-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImage === index
                        ? "bg-white scale-125"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`تصویر ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}