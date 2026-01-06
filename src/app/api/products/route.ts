import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { saveFileToGridFS } from "../../../../lib/gridfs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // پارامترهای فیلتر
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const inStock = searchParams.get('inStock');
    const search = searchParams.get('search');

    // ساخت شرط‌های فیلتر
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') {
      where.inStock = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // ساخت مرتب‌سازی
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // دریافت محصولات
    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    // دریافت دسته‌بندی‌های منحصربه‌فرد
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return NextResponse.json({
      success: true,
      products,
      categories: categories
        .map(c => c.category)
        .filter(Boolean)
        .filter(cat => cat.trim() !== ''),
      filters: {
        appliedCategory: category,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        sortBy,
        inStock: inStock === 'true',
        search
      }
    });
    
  } catch (error) {
    console.error("خطا در دریافت محصولات:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "خطا در دریافت محصولات",
        details: error instanceof Error ? error.message : "خطای ناشناخته"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // دریافت داده‌های متنی
    const code = (formData.get("code") as string)?.trim() || null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const category = formData.get("category") as string;
    const inStock = formData.get("inStock") === "true";
    
    // تبدیل قیمت
    const price = parseFloat(priceStr);
    
    // اعتبارسنجی
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { 
          success: false,
          error: "پر کردن فیلدهای الزامی ضروری است",
          details: { 
            title: !title, 
            description: !description, 
            price: !price || isNaN(price), 
            category: !category 
          }
        },
        { status: 400 }
      );
    }
    
    // بررسی تکراری نبودن کد محصول
    if (code) {
      const existingProduct = await prisma.product.findFirst({
        where: { code },
      });
      
      if (existingProduct) {
        return NextResponse.json(
          { 
            success: false,
            error: "این کد محصول قبلاً استفاده شده است"
          },
          { status: 400 }
        );
      }
    }

    // آپلود تصاویر
    const imageIds: string[] = [];
    const files: File[] = [];
    
    // پیدا کردن تمام فایل‌ها
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith("image")) {
        files.push(value);
      }
    }
    
    // آپلود همه تصاویر
    for (const file of files) {
      try {
        const imageId = await saveFileToGridFS(file);
        imageIds.push(imageId);
      } catch (error) {
        console.error("خطا در آپلود تصویر:", error);
      }
    }
    
    // اگر تصویری آپلود نشده
    if (imageIds.length === 0) {
      imageIds.push('placeholder');
    }

    // ایجاد محصول جدید
    const product = await prisma.product.create({
      data: {
        code,
        title,
        description,
        price,
        category,
        inStock,
        images: imageIds,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      message: "محصول با موفقیت ایجاد شد"
    });
    
  } catch (error) {
    console.error("خطا در ایجاد محصول:", error);
    
    // مدیریت خطاهای Prisma
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { 
            success: false,
            error: "داده تکراری",
            message: "کد محصول یا عنوان باید یکتا باشد"
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "خطا در ایجاد محصول",
        message: error instanceof Error ? error.message : "خطای ناشناخته"
      },
      { status: 500 }
    );
  }
}