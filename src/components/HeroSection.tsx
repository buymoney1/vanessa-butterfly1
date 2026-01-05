'use client';

type HeroSectionProps = {
  searchQuery?: string;
};

export default function HeroSection({ searchQuery }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2000')] opacity-10 mix-blend-overlay"></div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          فروشگاه <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">ونسا</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          خرید آسان و مطمئن از هزاران محصول با کیفیت
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form action="/" method="GET" className="relative group">
            <input
              type="text"
              name="search"
              placeholder="جستجوی محصولات..."
              defaultValue={searchQuery || ''}
              className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <button type="submit" className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:opacity-90 transition-opacity">
              جستجو
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}