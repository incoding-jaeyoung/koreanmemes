import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// IP당 최대 3회 / 60초 윈도우
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

// POST /api/auth/resend - 인증 이메일 재발송
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '잠시 후 다시 시도해 주세요. (1분에 최대 3회)' },
        { status: 429 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes('@')) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const redirectTo = `${origin}/auth/confirm`;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: trimmedEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      // 사용자 친화적 에러 메시지
      let message = error.message;
      if (error.message?.toLowerCase().includes('rate limit')) {
        message = '잠시 후 다시 시도해 주세요. (요청 제한)';
      } else if (error.message?.toLowerCase().includes('already confirmed')) {
        message = '이미 인증된 이메일입니다. 로그인해 주세요.';
      } else if (error.message?.toLowerCase().includes('email not found') || error.message?.toLowerCase().includes('user not found')) {
        message = '등록되지 않은 이메일입니다. 회원가입을 진행해 주세요.';
      }
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: '인증 이메일을 다시 보냈습니다.' });
  } catch (err: any) {
    console.error('Resend email error:', err);
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
