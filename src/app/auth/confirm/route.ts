import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error) {
      if (type === 'signup' || type === 'email') {
        // 회원가입 이메일 인증 완료 → 환영 알림 생성 후 환영 페이지
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: existingWelcome } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'welcome')
            .single()
          if (!existingWelcome) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'welcome',
              actor_id: user.id,
              actor_name: '',
              post_title: '',
              post_id: null,
              link_url: '/profile',
              is_read: false,
            })
          }
        }
        return NextResponse.redirect(`${origin}/auth/welcome`)
      }
      if (type === 'recovery') {
        // 비밀번호 재설정 → 재설정 페이지
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }
      // 기타 (magiclink 등) → next 또는 홈
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Auth Confirm Error:', error.message)
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
