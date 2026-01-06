import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../middleware/auth';
import { AIService } from '../../../../../lib/ai-service';


export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    const { question, answer } = await req.json();

    if (!question || !answer || question.trim().length < 3 || answer.trim().length < 3) {
      return NextResponse.json(
        { error: 'سوال و جواب باید حداقل ۳ کاراکتر داشته باشند' },
        { status: 400 }
      );
    }

    const aiService = await AIService.getInstance();
    const success = await aiService.trainAI(question, answer, user.id);

    if (!success) {
      throw new Error('خطا در آموزش');
    }

    return NextResponse.json({
      success: true,
      message: 'سوال و جواب با موفقیت آموزش داده شد'
    });

  } catch (error: any) {
    console.error('خطا در آموزش:', error);
    
    if (error.message === 'دسترسی غیرمجاز') {
      return NextResponse.json(
        { error: 'فقط ادمین می‌تواند آموزش دهد' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در عملیات آموزش' },
      { status: 500 }
    );
  }
}