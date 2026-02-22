// تولید URL برای نمایش عکس‌های GridFS
export function getImageUrl(imageId: string): string {
    if (imageId === 'placeholder') {
      return '/placeholder.svg';
    }
    
    // استفاده از endpoint فایل‌ها
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/files/${imageId}`;
  }
  
  // بررسی معتبر بودن imageId
  export function isValidImageId(imageId: string): boolean {
    if (imageId === 'placeholder') return true;
    
    // بررسی ObjectId معتبر
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(imageId);
  }
  
  // دریافت srcset برای responsive images
  export function getImageSrcset(imageId: string, sizes: number[] = [300, 600, 1200]): string {
    if (imageId === 'placeholder') {
      return '/placeholder.svg';
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return sizes.map(size => 
      `${baseUrl}/api/files/${imageId}?size=${size} ${size}w`
    ).join(', ');
  }