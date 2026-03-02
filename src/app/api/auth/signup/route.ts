import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/auth/signup - 회원가입 (이메일 중복 체크 포함)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, preferred_language } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 회원가입 시도
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          preferred_language: preferred_language || 'ko',
        },
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback?type=signup`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Supabase는 이미 가입된 이메일에 대해 에러를 반환하지 않지만,
    // identities 배열이 비어있으면 이미 존재하는 사용자임
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      return NextResponse.json(
        { error: 'User already registered', alreadyExists: true },
        { status: 400 }
      );
    }

    // Vercel의 geolocation 정보 수집
    const geo = (request as any).geo;
    const country = geo?.country || null;
    const region = geo?.city || geo?.region || null;

    // IP 주소 수집 (선택적)
    const signupIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     null;

    // profiles 테이블에 위치 정보 업데이트
    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          country,
          region,
          signup_ip: signupIp
        })
        .eq('id', data.user.id);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('POST /api/auth/signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
