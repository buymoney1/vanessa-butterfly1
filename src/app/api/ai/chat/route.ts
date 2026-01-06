import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// لیست مدل‌های OpenRouter (از free به paid یا مدل‌های دیگر)
const OPENROUTER_MODELS = [
    'mistralai/mistral-7b-instruct:free', // مدل اصلی
    'huggingfaceh4/zephyr-7b-beta:free', // مدل جایگزین ۱
    'meta-llama/llama-3.2-3b-instruct:free', // مدل جایگزین ۲
    'google/gemma-7b-it:free', // مدل جایگزین ۳
    'gryphe/mythomax-l2-13b:free' // مدل جایگزین ۴
];

// تابع برای خواندن فایل مکالمات
async function readConversationFile() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'conversations.txt');
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error('❌ خطا در خواندن فایل مکالمات:', error);
        return null;
    }
}

// تابع اصلی برای ارسال درخواست با fallback روی مدل‌های مختلف
async function callOpenRouterWithFallback(prompt: string, apiKey: string) {
    let lastError = null;
    
    for (const model of OPENROUTER_MODELS) {
        try {
            console.log(`🔄 تلاش با مدل: ${model}`);
            
            const response = await fetch(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'AI Chat Assistant'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: 'شما یک پشتیبان هوشمند فارسی هستید که به سوالات مشتریان پاسخ می‌دهد. پاسخ‌های شما باید مفید، دقیق، دوستانه و مرتبط با سوال باشد.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 600,
                        temperature: 0.7,
                        top_p: 0.9
                    }),
                    // timeout برای جلوگیری از انتظار طولانی
                    signal: AbortSignal.timeout(30000)
                }
            );

            console.log(`📊 Status برای ${model}: ${response.status}`);
            
            if (response.status === 429) {
                console.log(`⏳ مدل ${model} rate limit شده، مدل بعدی...`);
                lastError = new Error(`Rate limit on model: ${model}`);
                continue;
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ خطا برای ${model}:`, errorText.substring(0, 200));
                lastError = new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
                continue;
            }

            const data = await response.json();
            const answer = data.choices?.[0]?.message?.content;
            
            if (answer) {
                console.log(`✅ موفق با مدل: ${model}`);
                return {
                    answer: answer,
                    model: model,
                    tokens_used: data.usage?.total_tokens
                };
            } else {
                lastError = new Error('پاسخ خالی دریافت شد');
            }

        } catch (error: any) {
            console.log(`⚠️ خطا در مدل ${model}:`, error.message);
            lastError = error;
            
            // اگر timeout بود، ادامه بده
            if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                continue;
            }
            
            // کمی تاخیر قبل از تلاش بعدی
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    throw lastError || new Error('همه مدل‌ها ناموفق بودند');
}

export async function POST(req: NextRequest) {
    try {
        const { question } = await req.json();
        
        if (!question?.trim()) {
            return NextResponse.json(
                { error: 'سوال الزامی است' },
                { status: 400 }
            );
        }

        console.log('🤔 سوال:', question);

        // ========== خواندن فایل مکالمات ==========
        console.log('📖 در حال خواندن فایل مکالمات...');
        const conversationData = await readConversationFile();
        
        if (conversationData) {
            console.log(`✅ فایل مکالمات خوانده شد (${conversationData.length} کاراکتر)`);
        } else {
            console.log('⚠️ فایل مکالمات یافت نشد یا خطا در خواندن');
        }

        // ========== OpenRouter با fallback ==========
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: 'API Key تنظیم نشده',
                message: 'لطفاً OPENROUTER_API_KEY را در فایل .env.local تنظیم کنید'
            }, { status: 500 });
        }

        console.log('🚀 ارسال به OpenRouter (با fallback روی مدل‌های مختلف)...');
        
        // ساخت prompt بر اساس مکالمات قبلی
        let prompt = '';
        
        if (conversationData) {
            prompt = `مکالمات قبلی بین مشتری و پشتیبان:
${conversationData}

سوال جدید مشتری: ${question}

لطفاً به عنوان پشتیبان هوشمند، با توجه به تاریخچه مکالمات بالا، پاسخ مناسب و مفیدی به مشتری بدهید:`;
        } else {
            prompt = `سوال مشتری: ${question}

لطفاً به عنوان پشتیبان هوشمند، پاسخ مناسب و مفیدی بدهید:`;
        }
        
        try {
            const result = await callOpenRouterWithFallback(prompt, apiKey);
            
            console.log('✅ پاسخ دریافت شد');
            return NextResponse.json({
                answer: result.answer,
                source: 'OpenRouter',
                model: result.model,
                tokens_used: result.tokens_used,
                conversation_loaded: !!conversationData,
                conversation_length: conversationData ? conversationData.length : 0
            });

        } catch (error: any) {
            console.error('❌ همه مدل‌های OpenRouter ناموفق بودند:', error.message);
            
            // تلاش با Groq API به عنوان پشتیبان
            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey) {
                console.log('🔄 تلاش با Groq API به عنوان پشتیبان...');
                try {
                    const groqResponse = await fetch(
                        'https://api.groq.com/openai/v1/chat/completions',
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${groqKey}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                model: 'llama3-8b-8192',
                                messages: [
                                    {
                                        role: 'system',
                                        content: 'You are a helpful Persian assistant. Respond in Persian.'
                                    },
                                    {
                                        role: 'user',
                                        content: prompt
                                    }
                                ],
                                max_tokens: 600,
                                temperature: 0.7
                            }),
                            signal: AbortSignal.timeout(15000)
                        }
                    );

                    if (groqResponse.ok) {
                        const data = await groqResponse.json();
                        const answer = data.choices?.[0]?.message?.content;
                        
                        if (answer) {
                            console.log('✅ Groq پاسخ داد');
                            return NextResponse.json({
                                answer: answer,
                                source: 'Groq (پشتیبان)',
                                model: 'llama3-8b',
                                conversation_loaded: !!conversationData,
                                note: 'استفاده از سرویس پشتیبان'
                            });
                        }
                    }
                } catch (groqError) {
                    console.log('❌ Groq هم کار نکرد:', groqError);
                }
            }
            
            // اگر هیچکدام کار نکرد
            return NextResponse.json({
                answer: `سوال شما: "${question}"\n\n` +
                       'متأسفانه در حال حاضر سرویس‌های AI به دلیل محدودیت ترافیک در دسترس نیستند.\n\n' +
                       'لطفاً:\n' +
                       '1. چند دقیقه دیگر مجدداً تلاش کنید\n' +
                       '2. یا یک API Key رایگان از Groq بگیرید: https://console.groq.com\n' +
                       '3. کلید Groq را در فایل .env.local قرار دهید: GROQ_API_KEY=کلید_شما',
                error: true,
                suggestion: 'برای دسترسی بهتر، یک API Key رایگان از Groq دریافت کنید'
            }, { status: 503 });
        }

    } catch (error: any) {
        console.error('💥 خطای سرور:', error);
        return NextResponse.json({
            error: 'خطای داخلی سرور',
            message: error.message
        }, { status: 500 });
    }
}

// ========== GET برای اطلاعات ==========
export async function GET() {
    try {
        // خواندن فایل برای نمایش اطلاعات
        const conversationData = await readConversationFile();
        
        return NextResponse.json({
            service: 'AI Chat با OpenRouter + Fallback',
            timestamp: new Date().toISOString(),
            status: 'فعال ✓',
            available_models: OPENROUTER_MODELS,
            api_keys: {
                openrouter: !!process.env.OPENROUTER_API_KEY,
                groq: !!process.env.GROQ_API_KEY
            },
            conversation_file: {
                exists: !!conversationData,
                length: conversationData ? conversationData.length : 0,
                preview: conversationData ? conversationData.substring(0, 200) + '...' : null
            },
            instructions: 'POST /api/ai/chat با body: {"question": "سوال شما"}'
        });
    } catch (error) {
        return NextResponse.json({
            service: 'AI Chat با OpenRouter + Fallback',
            timestamp: new Date().toISOString(),
            status: 'فعال ✓',
            api_keys: {
                openrouter: !!process.env.OPENROUTER_API_KEY,
                groq: !!process.env.GROQ_API_KEY
            },
            conversation_file: 'خطا در بررسی فایل',
            instructions: 'POST /api/ai/chat با body: {"question": "سوال شما"}'
        });
    }
}