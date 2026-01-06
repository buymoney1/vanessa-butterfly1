// app/api/faqs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // فقط ادمین‌ها می‌توانند همه FAQها را ببینند
    // در حالت عادی فقط FAQهای فعال را نشان می‌دهد
    const isAdmin = session?.user?.role === 'ADMIN';
    
    const faqs = await prisma.fAQ.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      faqs 
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت سوالات متداول' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { question, answer, order, isActive = true } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'سوال و پاسخ الزامی هستند' },
        { status: 400 }
      );
    }

    // پیدا کردن آخرین order
    const lastOrder = order !== undefined ? order : 
      await prisma.fAQ.count();

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        order: lastOrder,
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json({ 
      success: true, 
      faq 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد سوال متداول' },
      { status: 500 }
    );
  }
}