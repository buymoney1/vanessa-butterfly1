import { Geist, Geist_Mono } from "next/font/google";
import { Vazirmatn } from "next/font/google"; // فونت فارسی گوگل
import "./globals.css";
import Navbar from "../../components/Navbar";
import Providers from "../../components/Providers";


// تنظیم فونت انگلیسی
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// تنظیم فونت فارسی Vazirmatn از گوگل فونت
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"], // پشتیبانی از عربی و لاتین
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["300", "400", "500", "700"], // وزن‌های مورد نیاز
});

export const metadata = {
  title: "ونسا",
  description: "فروشگاه آنلاین ",
  keywords: "فروشگاه آنلاین, خرید اینترنتی, محصولات مدرن, طراحی شیشه‌ای",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="fa" 
      dir="rtl" 
  className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} scroll-smooth`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        // استفاده از فونت Vazirmatn به عنوان فونت پیش‌فرض
        className="font-sans antialiased"
        style={{
          fontFamily: 'var(--font-vazirmatn), system-ui, sans-serif'
        }}
      >
        <Providers>
          <div className="fixed top-0 w-full z-50">
             <Navbar />
          </div>
          
          <main className="min-h-screen w-full pt-">
            {children}
          </main>
          
          <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <p>© {new Date().getFullYear()} VanessaButterfly. تمامی حقوق محفوظ است.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}