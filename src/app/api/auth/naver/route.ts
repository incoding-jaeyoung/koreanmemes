import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') || '/'

  const clientId = process.env.NAVER_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Naver client ID not configured' }, { status: 500 })
  }

  const state = Buffer.from(JSON.stringify({ next, nonce: Math.random().toString(36) })).toString('base64url')
  const origin = new URL(request.url).origin
  const callbackUrl = `${origin}/api/auth/naver/callback`

  const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
  naverAuthUrl.searchParams.set('response_type', 'code')
  naverAuthUrl.searchParams.set('client_id', clientId)
  naverAuthUrl.searchParams.set('redirect_uri', callbackUrl)
  naverAuthUrl.searchParams.set('state', state)

  return NextResponse.redirect(naverAuthUrl.toString())
}
