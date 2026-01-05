// app/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { FiPackage, FiCheck, FiHome, FiGrid } from "react-icons/fi";
import AddToCartButton from "../../../../components/AddToCartButton";
import ProductGallery from "../../../../components/ProductGallery";
import { prisma } from "../../../../lib/prisma";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  // محصولات مشابه
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // ساخت URL کامل محصول
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const productUrl = `${baseUrl}/products/${product.id}`;
  const whatsappMessage = `سلام، در مورد این محصول سوال دارم:\n\n📦 محصول: ${product.title}\n💰 قیمت: ${product.price.toLocaleString()} تومان\n🔗 لینک: ${productUrl}\n\nلطفاً راهنمایی کنید:`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 pt-24 md:pt-28 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* مسیر ناوبری - موبایل بهینه */}
        <div className="mb-4 max-w-7xl mx-auto">
          <nav className="flex items-center gap-1 text-xs md:text-sm text-gray-500 overflow-x-auto whitespace-nowrap py-2 px-1">
            <a href="/" className="hover:text-black transition-colors flex items-center gap-1">
              <FiHome size={12} className="md:hidden" />
              <span className="hidden md:inline">خانه</span>
              <span className="inline md:hidden">🏠</span>
            </a>
            <span className="text-gray-300 mx-1">/</span>
            <a href={`/category/${product.category}`} className="hover:text-black transition-colors flex items-center gap-1 truncate max-w-[120px] md:max-w-none">
              <FiGrid size={12} className="md:hidden" />
              <span className="truncate">{product.category}</span>
            </a>
            <span className="text-gray-300 mx-1">/</span>
            <span className="text-black font-medium truncate max-w-[150px] md:max-w-none">
              {product.title}
            </span>
          </nav>
        </div>

        {/* محتوای اصلی */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 max-w-7xl mx-auto items-start">
          
          {/* بخش چپ: گالری تصاویر */}
          <div className="relative w-full">
            <div className="lg:sticky lg:top-24 z-10 bg-white rounded-2xl md:rounded-[2rem] p-2 border border-gray-100 shadow-sm">
              <ProductGallery images={product.images} />
            </div>
          </div>

          {/* بخش راست: اطلاعات محصول */}
          <div className="space-y-6">
            
            {/* هدر و دسته‌بندی */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
                  {product.category}
                </span>
                {product.code && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-full">
                    کد: {product.code}
                  </span>
                )}
                {product.inStock ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <FiCheck size={10} />
                    موجود
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                    ناموجود
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
                {product.title}
              </h1>

              {/* توضیحات محصول */}
              <div className="prose prose-gray max-w-none">
                <p className="text-justify text-gray-600 leading-relaxed text-base md:text-lg">
                  {product.description}
                </p>
              </div>
            </div>

            {/* قیمت و دکمه خرید */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
              
              {/* بخش قیمت */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1 font-medium">قیمت نهایی</p>
                    <div className="flex items-baseline gap-1">
                      <div className="text-3xl md:text-4xl font-bold text-gray-900">
                        {product.price.toLocaleString()}
                      </div>
                      <span className="text-lg font-normal text-gray-500">تومان</span>
                    </div>
                  </div>
                  
                  {/* برچسب قیمت ویژه */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                      قیمت ویژه
                    </span>
                    {product.inStock && (
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
                        ✓ موجود
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* بخش خرید */}
              <div className="space-y-6">
                
                {/* دکمه افزودن به سبد */}
                <div>
                  <AddToCartButton 
                    productId={product.id} 
                    disabled={!product.inStock}
                    className="w-full"
                  />
                </div>
                
                {/* اطلاعات محصول */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">کد محصول</span>
                      <span className="font-mono font-bold text-gray-900 text-sm">
                        {product.code || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">دسته‌بندی</span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">موجودی</span>
                      <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                        {product.inStock ? '✅ موجود' : '✖️ ناموجود'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* دکمه مشاوره واتساپ */}
                <div className="pt-4 border-t border-gray-100">
                  <a 
                    href={`https://wa.me/989178506698?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 w-full"
                  >
                    {/* آیکون واتساپ */}
                    <div className="relative">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                      </svg>
                    </div>
                    
                    {/* متن */}
                    <div className="flex-1 text-right text-sm font-medium">
                      مشاوره در واتساپ
                    </div>
                    
                    {/* فلش */}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  
    
    
                </div>
              </div>
            </div>

            {/* ویژگی‌های کلیدی */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">چرا از ما خرید کنید؟</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck size={10} />
                  </div>
                  <span className="text-sm">ارسال سریع و ایمن به سراسر کشور</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiCheck size={10} />
                  </div>
                  <span className="text-sm">پشتیبانی تخصصی پیش و پس از فروش</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* محصولات مشابه */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">محصولات مرتبط</h2>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <a 
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group block bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
                >
                  {/* تصویر */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-50 mb-3">
                    <img
                      src={relatedProduct.images[0] || "/placeholder.jpg"}
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* محتوا */}
                  <div className="px-1 pb-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-bold text-base">
                        {relatedProduct.price.toLocaleString()} 
                        <span className="text-xs font-normal text-gray-500"> تومان</span>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}