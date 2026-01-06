// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export async function authenticate(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function requireAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await authenticate(req);
  
  if (!user || user.role !== 'ADMIN') {
    throw new Error('دسترسی غیرمجاز');
  }
  
  return user;
}