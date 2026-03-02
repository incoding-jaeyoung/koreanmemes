import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface NaverProfile {
  resultcode: string
  message: string
  response: {
    id: string
    email?: string
    name?: string
    nickname?: string
    profile_image?: string
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateRaw = searchParams.get('state')
  const errorParam = searchParams.get('error')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (errorParam) {
    return NextResponse.redirect(`${siteUrl}/login?error=naver_denied`)
  }

  if (!code || !stateRaw) {
    return NextResponse.redirect(`${siteUrl}/login?error=naver_invalid`)
  }

  // state에서 next 추출
  let next = '/'
  try {
    const decoded = JSON.parse(Buffer.from(stateRaw, 'base64url').toString())
    next = decoded.next || '/'
  } catch {
    // state 파싱 실패 시 기본값 사용
  }

  const clientId = process.env.NAVER_CLIENT_ID!
  const clientSecret = process.env.NAVER_CLIENT_SECRET!
  const callbackUrl = `${siteUrl}/api/auth/naver/callback`

  // 1. 액세스 토큰 교환
  const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state: stateRaw,
      redirect_uri: callbackUrl,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${siteUrl}/login?error=naver_token`)
  }

  const tokenData = await tokenRes.json()
  const accessToken: string = tokenData.access_token

  if (!accessToken) {
    return NextResponse.redirect(`${siteUrl}/login?error=naver_token`)
  }

  // 2. 네이버 프로필 조회
  const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!profileRes.ok) {
    return NextResponse.redirect(`${siteUrl}/login?error=naver_profile`)
  }

  const profileData: NaverProfile = await profileRes.json()

  if (profileData.resultcode !== '00') {
    return NextResponse.redirect(`${siteUrl}/login?error=naver_profile`)
  }

  const { id: naverId, email, name, nickname, profile_image } = profileData.response

  // 이메일이 없는 경우 네이버 ID로 가상 이메일 생성
  const userEmail = email || `naver_${naverId}@naver.local`
  const displayName = nickname || name || `네이버 유저`

  console.log('[NAVER] 프로필 조회 결과:', { naverId, userEmail, displayName })

  // 3. Supabase Admin으로 사용자 upsert
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 기존 사용자 확인 (이메일로만 조회)
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = existingUsers?.users.find((u) => u.email === userEmail)

  console.log('[NAVER] 기존 유저 검색:', existingUser ? `찾음 - ${existingUser.email}` : '없음 - 신규 생성')

  let userId: string

  if (existingUser) {
    userId = existingUser.id
    // 기존 유저도 최신 네이버 프로필로 metadata 업데이트
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingUser.user_metadata,
        naver_id: naverId,
        full_name: displayName,
        ...(profile_image ? { avatar_url: profile_image } : {}),
        provider: 'naver',
      },
    })
  } else {
    // 신규 사용자 생성
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      user_metadata: {
        naver_id: naverId,
        full_name: displayName,
        avatar_url: profile_image,
        provider: 'naver',
      },
    })

    if (createError || !newUser?.user) {
      return NextResponse.redirect(`${siteUrl}/login?error=naver_create`)
    }

    userId = newUser.user.id
  }

  // profiles 테이블: username이 트리거 초기값(이메일/이메일prefix)이면 네이버 닉네임으로 교체
  // username이 이미 사용자가 직접 설정한 값이면 건드리지 않음
  const { data: currentProfile } = await supabaseAdmin
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', userId)
    .single()

  const emailPrefix = userEmail.split('@')[0]
  const profileUpdates: Record<string, string> = {}
  const isAutoUsername = !currentProfile?.username
    || currentProfile.username === userEmail
    || currentProfile.username === emailPrefix
  if (isAutoUsername) {
    profileUpdates.username = displayName
  }
  if (profile_image && !currentProfile?.avatar_url) {
    profileUpdates.avatar_url = profile_image
  }
  if (Object.keys(profileUpdates).length > 0) {
    await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', userId)
  }

  // 4. Magic link 생성으로 자동 로그인
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: userEmail,
    options: { redirectTo: `${siteUrl}/auth/naver-session?next=${encodeURIComponent(next)}` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.log('[NAVER] 링크 생성 실패:', linkError)
    return NextResponse.redirect(`${siteUrl}/login?error=naver_link`)
  }

  console.log('[NAVER] 로그인 처리 완료 - 대상 이메일:', userEmail)
  return NextResponse.redirect(linkData.properties.action_link)
}
