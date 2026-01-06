// app/api/faqs/[id]/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';


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
    const { order } = body;

    if (order === undefined || order < 0) {
      return NextResponse.json(
        { success: false, error: 'ترتیب نامعتبر است' },
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

    // بررسی اینکه آیا جایگاهی که می‌خواهیم برویم قبلاً اشغال شده
    const conflictingFAQ = await prisma.fAQ.findFirst({
      where: {
        order: Number(order),
        id: { not: id }
      }
    });

    if (conflictingFAQ) {
      // جابه‌جایی orderها
      await prisma.fAQ.update({
        where: { id: conflictingFAQ.id },
        data: { order: existingFAQ.order }
      });
    }

    // به‌روزرسانی order سوال جاری
    await prisma.fAQ.update({
      where: { id },
      data: { order: Number(order) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'ترتیب به‌روزرسانی شد' 
    });
  } catch (error: any) {
    console.error('Error reordering FAQ:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'سوال پیدا نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'خطا در تغییر ترتیب' },
      { status: 500 }
    );
  }
}