// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// ایجاد پوشه uploads
const createUploadsDir = () => {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// ذخیره فایل
const saveFile = async (file: File): Promise<string> => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const originalName = file.name.replace(/\s+/g, '-');
  const filename = `${timestamp}-${random}-${originalName}`;
  
  const uploadsDir = createUploadsDir();
  const path = join(uploadsDir, filename);
  
  await writeFile(path, buffer);
  
  return `/uploads/${filename}`;
};

// GET - دریافت یک محصول
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("خطا در دریافت محصول:", error);
    return NextResponse.json(
      { error: "خطا در دریافت محصول" },
      { status: 500 }
    );
  }
}

// PUT - آپدیت محصول
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    // بررسی وجود محصول
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    
    // دریافت داده‌ها
    const code = (formData.get("code") as string)?.trim() || null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const inStock = formData.get("inStock") === "true";
    
    // اعتبارسنجی
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { 
          error: "پر کردن فیلدهای الزامی ضروری است",
          details: { title: !title, description: !description, price: !price, category: !category }
        },
        { status: 400 }
      );
    }
    
    // دریافت تصاویر موجود
    const existingImages: string[] = [];
    const existingImagesData = formData.getAll("existingImages");
    existingImagesData.forEach(img => {
      if (typeof img === "string") {
        existingImages.push(img);
      }
    });
    
    // آپلود تصاویر جدید
    const newImageUrls: string[] = [];
    const files: File[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith("image")) {
        files.push(value);
      }
    }
    
    for (const file of files) {
      try {
        const imageUrl = await saveFile(file);
        newImageUrls.push(imageUrl);
      } catch (error) {
        console.error("خطا در آپلود تصویر:", error);
      }
    }
    
    // ترکیب تصاویر
    const allImages = [...existingImages, ...newImageUrls];
    let finalImages = allImages.length > 0 ? allImages : existingProduct.images;
    if (finalImages.length === 0) {
      finalImages = ["/placeholder.jpg"];
    }

    // آپدیت محصول
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        code,
        title,
        description,
        price,
        category,
        inStock,
        images: finalImages,
      },
    });

    return NextResponse.json(updatedProduct);
    
  } catch (error) {
    console.error("خطا در آپدیت محصول:", error);
    
    // مدیریت خطاهای Prisma
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { 
            error: "داده تکراری",
            code: prismaError.code,
            meta: prismaError.meta,
            message: "کد محصول یا عنوان باید یکتا باشد"
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "خطا در آپدیت محصول",
        message: error instanceof Error ? error.message : "خطای ناشناخته"
      },
      { status: 500 }
    );
  }
}

// DELETE - حذف محصول
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    // بررسی وجود محصول
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    // 1. اول همه آیتم‌های سبد خرید مرتبط را حذف کنید
    const deletedCartItems = await prisma.cartItem.deleteMany({
      where: {
        productId: id
      }
    });

    // 2. سپس محصول را حذف کنید
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true,
      message: "محصول با موفقیت حذف شد",
      deletedCartItemsCount: deletedCartItems.count,
      hasCartItems: deletedCartItems.count > 0
    });

  } catch (error) {
    console.error("خطا در حذف محصول:", error);
    
    return NextResponse.json(
      { 
        error: "خطا در حذف محصول",
        details: error instanceof Error ? error.message : "خطای ناشناخته"
      },
      { status: 500 }
    );
  }
}