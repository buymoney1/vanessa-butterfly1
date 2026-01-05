import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/prisma";


export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // اعتبارسنجی
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "کاربر با این ایمیل از قبل وجود دارد" },
        { status: 400 }
      );
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ایجاد کاربر
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // نقش پیش‌فرض
      },
    });

    // بازگرداندن کاربر بدون رمز عبور
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("خطای ثبت‌نام:", error);
    return NextResponse.json(
      { error: "مشکلی در سرور رخ داده است" },
      { status: 500 }
    );
  }
}