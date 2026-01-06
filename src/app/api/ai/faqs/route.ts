import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../../middleware/auth';
import { AIService } from '../../../../../lib/ai-service';



export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const aiService = await AIService.getInstance();
    const result = await aiService.getTrainedFAQs(page, limit);

    return NextResponse.json({
      success: true,
      data: result,
      // فقط ادمین می‌تواند اطلاعات creator را ببیند
      showCreator: user?.role === 'ADMIN'
    });

  } catch (error) {
    console.error('خطا در دریافت FAQs:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات' },
      { status: 500 }
    );
  }
}