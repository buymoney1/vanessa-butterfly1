import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../../../lib/auth";

// GET - دریافت سبد خرید
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("خطا در دریافت سبد خرید:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سبد خرید" },
      { status: 500 }
    );
  }
}

// POST - افزودن محصول به سبد خرید
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    // بررسی وجود محصول
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی موجودی
    if (!product.inStock) {
      return NextResponse.json(
        { error: "محصول ناموجود است" },
        { status: 400 }
      );
    }

    // اضافه کردن یا آپدیت سبد خرید
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingCartItem) {
      // آپدیت تعداد
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: { product: true },
      });
      
      return NextResponse.json(updatedCartItem);
    } else {
      // ایجاد آیتم جدید
      const newCartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
        },
        include: { product: true },
      });
      
      return NextResponse.json(newCartItem);
    }
  } catch (error) {
    console.error("خطا در افزودن به سبد خرید:", error);
    return NextResponse.json(
      { error: "خطا در افزودن به سبد خرید" },
      { status: 500 }
    );
  }
}

// PUT - آپدیت تعداد محصول در سبد خرید
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    // بررسی ورودی
    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "شناسه محصول و تعداد الزامی است" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "تعداد باید حداقل ۱ باشد" },
        { status: 400 }
      );
    }

    // بررسی وجود محصول در سبد خرید
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: "محصول در سبد خرید یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی موجودی محصول
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { inStock: true },
    });

    if (!product?.inStock && quantity > 0) {
      return NextResponse.json(
        { error: "محصول ناموجود است" },
        { status: 400 }
      );
    }

    // آپدیت تعداد
    const updatedCartItem = await prisma.cartItem.update({
      where: { 
        userId_productId: {
          userId: session.user.id,
          productId,
        }
      },
      data: { quantity },
      include: { product: true },
    });
    
    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error("خطا در آپدیت سبد خرید:", error);
    
    // مدیریت خطاهای خاص Prisma
    if (error instanceof Error) {
      if (error.message.includes("P2025")) {
        return NextResponse.json(
          { error: "محصول در سبد خرید یافت نشد" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "خطا در آپدیت سبد خرید" },
      { status: 500 }
    );
  }
}

// DELETE - حذف محصول از سبد خرید
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    // بررسی وجود محصول در سبد خرید
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: "محصول در سبد خرید یافت نشد" },
        { status: 404 }
      );
    }

    // حذف محصول
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "محصول با موفقیت حذف شد" 
    });
  } catch (error) {
    console.error("خطا در حذف از سبد خرید:", error);
    
    // مدیریت خطاهای Prisma
    if (error instanceof Error) {
      if (error.message.includes("P2025")) {
        return NextResponse.json(
          { error: "محصول در سبد خرید یافت نشد" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "خطا در حذف از سبد خرید" },
      { status: 500 }
    );
  }
}