import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from 'mongodb';
import { getFileInfo, getFileStream } from "../../../../../lib/gridfs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id === 'placeholder') {
      // برگرداندن placeholder
      return NextResponse.redirect(new URL('/placeholder.jpg', request.url));
    }

    // بررسی معتبر بودن ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.redirect(new URL('/placeholder.jpg', request.url));
    }

    // دریافت اطلاعات فایل
    const fileInfo = await getFileInfo(id);
    if (!fileInfo) {
      return NextResponse.redirect(new URL('/placeholder.jpg', request.url));
    }

    // دریافت contentType از metadata
    const contentType = fileInfo.metadata?.contentType || 'image/jpeg';

    // دریافت stream فایل
    const downloadStream = await getFileStream(id);
    if (!downloadStream) {
      return NextResponse.redirect(new URL('/placeholder.jpg', request.url));
    }

    // خواندن stream به buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // برگرداندن فایل
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${fileInfo.filename}"`,
      },
    });
    
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.redirect(new URL('/placeholder.jpg', request.url));
  }
}