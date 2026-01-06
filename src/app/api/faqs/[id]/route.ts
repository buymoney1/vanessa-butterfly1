// app/api/faqs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';



// GET یک FAQ خاص
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه سوال الزامی است' },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.findUnique({
      where: { id }
    });

    if (!faq) {
      return NextResponse.json(
        { success: false, error: 'سوال پیدا نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      faq 
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت سوال' },
      { status: 500 }
    );
  }
}

// ویرایش FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه سوال الزامی است' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { question, answer, order, isActive } = body;

    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id }
    });

    if (!existingFAQ) {
      return NextResponse.json(
        { success: false, error: 'سوال پیدا نشد' },
        { status: 404 }
      );
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question: question !== undefined ? question : existingFAQ.question,
        answer: answer !== undefined ? answer : existingFAQ.answer,
        order: order !== undefined ? Number(order) : existingFAQ.order,
        isActive: isActive !== undefined ? Boolean(isActive) : existingFAQ.isActive
      }
    });

    return NextResponse.json({ 
      success: true, 
      faq 
    });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'سوال پیدا نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'خطا در به‌روزرسانی سوال' },
      { status: 500 }
    );
  }
}

// حذف FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه سوال الزامی است' },
        { status: 400 }
      );
    }

    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id }
    });

    if (!existingFAQ) {
      return NextResponse.json(
        { success: false, error: 'سوال پیدا نشد' },
        { status: 404 }
      );
    }

    await prisma.fAQ.delete({
      where: { id }
    });

    // به‌روزرسانی order باقی مانده‌ها
    const remainingFaqs = await prisma.fAQ.findMany({
      orderBy: { order: 'asc' }
    });

    // مرتب‌سازی مجدد order
    for (let i = 0; i < remainingFaqs.length; i++) {
      await prisma.fAQ.update({
        where: { id: remainingFaqs[i].id },
        data: { order: i }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'سوال حذف شد' 
    });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'سوال پیدا نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'خطا در حذف سوال' },
      { status: 500 }
    );
  }
}