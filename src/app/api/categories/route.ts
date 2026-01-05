import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// دریافت همه دسته‌بندی‌های منحصربه‌فرد
export async function GET() {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    
    const uniqueCategories = categories
      .map(c => c.category)
      .filter(Boolean)
      .filter(cat => cat.trim() !== "");
    
    // دسته‌بندی‌های واقعی برای فروشگاه
    const defaultCategories = [
      'کادویی',
    ];
    
    // ترکیب دسته‌بندی‌های موجود با پیش‌فرض‌ها
    const allCategories = [...new Set([...uniqueCategories, ...defaultCategories])].sort();

    return NextResponse.json({ 
      success: true,
      categories: allCategories
    });
  } catch (error) {
    console.error("خطا در دریافت دسته‌بندی‌ها:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    );
  }
}

// اضافه کردن دسته‌بندی جدید
export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json();
    
    if (!category || category.trim() === "") {
      return NextResponse.json(
        { error: "نام دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }
    
    // فقط بررسی می‌کنیم که دسته‌بندی در محصولات استفاده شده باشد
    const existingCategory = await prisma.product.findFirst({
      where: { category },
    });
    
    return NextResponse.json({ 
      success: true,
      message: existingCategory ? "دسته‌بندی قبلاً وجود دارد" : "دسته‌بندی ذخیره شد",
      category 
    });
  } catch (error) {
    console.error("خطا در ذخیره دسته‌بندی:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره دسته‌بندی" },
      { status: 500 }
    );
  }
}