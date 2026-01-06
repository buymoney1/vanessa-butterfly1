// lib/ai-service-simple.ts - نسخه ساده با API جایگزین
export class SimpleAIService {
    private static instance: SimpleAIService;
    
    private constructor() {}
  
    static getInstance(): SimpleAIService {
      if (!SimpleAIService.instance) {
        SimpleAIService.instance = new SimpleAIService();
      }
      return SimpleAIService.instance;
    }
  
    async generateAnswer(
      question: string, 
      context?: string
    ): Promise<{ answer: string; model: string; confidence: number }> {
      
      try {
        // استفاده از API رایگان خارجی
        const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN || 'your_token_here'}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: context ? `${context}\n\nسوال: ${question}` : question,
            parameters: {
              max_length: 100,
              temperature: 0.7
            }
          })
        });
  
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
  
        const data = await response.json();
        
        let answer = data[0]?.generated_text || "پاسخی دریافت نشد";
        
        // حذف سوال از پاسخ
        if (answer.startsWith(question)) {
          answer = answer.substring(question.length).trim();
        }
  
        return {
          answer: answer,
          model: 'GPT-2 via API',
          confidence: 0.8
        };
  
      } catch (error) {
        console.error('خطا در API:', error);
        
        // بازگشت به پاسخ‌های از پیش تعریف شده
        return this.getFallbackAnswer(question);
      }
    }
  
    private getFallbackAnswer(question: string): { answer: string; model: string; confidence: number } {
      const lowerQuestion = question.toLowerCase();
      
      const responses: { keywords: string[], answer: string }[] = [
        {
          keywords: ['سلام', 'درود', 'hello', 'hi'],
          answer: 'سلام! چطور می‌توانم کمک‌تان کنم؟'
        },
        {
          keywords: ['چطور', 'چگونه', 'راهنما', 'کمک'],
          answer: 'می‌توانید سوال خود را با جزئیات بیشتری بیان کنید تا بتوانم بهتر کمک‌تان کنم.'
        },
        {
          keywords: ['قیمت', 'هزینه', 'خرید'],
          answer: 'برای اطلاع از قیمت‌ها لطفاً به بخش قیمت‌گذاری مراجعه کنید یا با پشتیبانی تماس بگیرید.'
        },
        {
          keywords: ['ساعت کار', 'زمان', 'تماس'],
          answer: 'ساعت کاری ما شنبه تا پنجشنبه از ۸ صبح تا ۵ عصر است.'
        }
      ];
  
      for (const response of responses) {
        for (const keyword of response.keywords) {
          if (lowerQuestion.includes(keyword)) {
            return {
              answer: response.answer,
              model: 'fallback',
              confidence: 0.6
            };
          }
        }
      }
  
      return {
        answer: 'متأسفم، در حال حاضر نمی‌توانم به سوال شما پاسخ دهم. لطفاً با پشتیبانی تماس بگیرید.',
        model: 'fallback',
        confidence: 0.3
      };
    }
  }