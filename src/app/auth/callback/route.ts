import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth Callback Error:', error.message, error.status);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const type = searchParams.get('type')
    if (type === 'recovery') {
      // 비밀번호 재설정의 경우 전용 페이지로 이동 (현재 비밀번호 없이 새 비밀번호만 입력)
      return NextResponse.redirect(`${origin}/auth/reset-password`)
    }

    if (type === 'signup') {
      // 이메일 인증 완료 후 환영 알림 생성 + welcomed_at 기록
      const { data: { user: signupUser } } = await supabase.auth.getUser()
      if (signupUser) {
        await Promise.all([
          supabase
            .from('notifications')
            .insert({
              user_id: signupUser.id,
              type: 'welcome',
              actor_id: signupUser.id,
              actor_name: '',
              post_title: '',
              post_id: null,
              link_url: '/profile',
              is_read: false,
            })
            .then(() => {}),
          supabase
            .from('profiles')
            .update({ welcomed_at: new Date().toISOString() })
            .eq('id', signupUser.id),
        ])
      }
      return NextResponse.redirect(`${origin}/auth/welcome`)
    }

    // 소셜 로그인(OAuth)의 경우, 신규 가입자인지 확인 (welcomed_at 컬럼으로 판별)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('welcomed_at')
        .eq('id', user.id)
        .single()
      const isNewUser = !profile?.welcomed_at
      if (isNewUser) {
        // IP 주소 수집
        const signupIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                         request.headers.get('x-real-ip') ||
                         null

        // IP 기반 geolocation 정보 수집
        let country = null
        let region = null

        if (signupIp) {
          try {
            // ip-api.com 무료 API 사용 (비상업용 무제한)
            const geoResponse = await fetch(`http://ip-api.com/json/${signupIp}?fields=status,country,countryCode,region,regionName,city`)
            if (geoResponse.ok) {
              const geoData = await geoResponse.json()
              if (geoData.status === 'success') {
                country = geoData.countryCode || null
                region = geoData.city || geoData.regionName || null
                console.log('[AUTH CALLBACK] Geo info:', {
                  signupIp,
                  country,
                  region,
                  userId: user.id
                })
              }
            }
          } catch (error) {
            console.error('[AUTH CALLBACK] Geo API error:', error)
          }
        }

        // OAuth 신규 가입 시 user_metadata에서 닉네임 가져와서 username 설정
        const metaName = user.user_metadata?.custom_claims?.global_name
          || user.user_metadata?.nickname || user.user_metadata?.name
          || user.user_metadata?.full_name || user.user_metadata?.user_name
        const userEmail = user.email || ''
        const emailPrefix = userEmail.split('@')[0]
        const { data: currentProfile } = await supabase
          .from('profiles').select('username').eq('id', user.id).single()
        const isAutoUsername = !currentProfile?.username
          || currentProfile.username === userEmail
          || currentProfile.username === emailPrefix

        // profiles 테이블에 위치 정보 + username + welcomed_at 업데이트
        await supabase
          .from('profiles')
          .update({
            country,
            region,
            signup_ip: signupIp,
            welcomed_at: new Date().toISOString(),
            ...(metaName && isAutoUsername ? { username: metaName } : {}),
          })
          .eq('id', user.id)

        // 신규 가입자 환영 알림 생성
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'welcome',
            actor_id: user.id,
            actor_name: '',
            post_title: '',
            post_id: null,
            link_url: '/profile',
            is_read: false,
          })
          .then(() => {}) // unique index 충돌 시 무시

        return NextResponse.redirect(`${origin}/auth/welcome`)
      }
    }

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.error('Auth Callback Error: No code provided');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
