'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function NaverSessionPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      router.replace('/login?error=naver_session')
      return
    }

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(async ({ data, error }) => {
        if (error || !data.user) {
          window.location.href = '/login?error=naver_session'
          return
        }

        // 신규 가입자 여부 확인 (welcomed_at 컬럼으로 판별 - 알림 삭제와 무관)
        const { data: profile } = await supabase
          .from('profiles')
          .select('welcomed_at')
          .eq('id', data.user.id)
          .single()

        if (!profile?.welcomed_at) {
          // 신규 가입자: welcomed_at 기록 + welcome 알림 생성 후 환영 페이지로
          await Promise.all([
            supabase.from('profiles').update({ welcomed_at: new Date().toISOString() }).eq('id', data.user.id),
            supabase.from('notifications').insert({
              user_id: data.user.id,
              type: 'welcome',
              actor_id: data.user.id,
              actor_name: '',
              post_title: '',
              post_id: null,
              link_url: '/profile',
              is_read: false,
            }),
          ])
          window.location.href = '/auth/welcome'
        } else {
          const next = new URLSearchParams(window.location.search).get('next') || '/'
          window.location.href = next
        }
      })
  }, [router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-4 animate-spin border-brand-yellow/30 border-t-brand-yellow" />
    </div>
  )
}
