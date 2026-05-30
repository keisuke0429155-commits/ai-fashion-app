import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exchangeCode } from '@/lib/baseApi'
import { saveBaseToken } from '@/lib/shopData'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const base = new URL('/store', request.url)

  if (error || !code) {
    base.searchParams.set('base_error', error ?? 'authorization_cancelled')
    return NextResponse.redirect(base)
  }

  // state を検証
  const storedState = request.cookies.get('base_oauth_state')?.value
  if (!storedState || storedState !== state) {
    base.searchParams.set('base_error', 'invalid_state')
    return NextResponse.redirect(base)
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    base.searchParams.set('base_error', 'session_expired')
    return NextResponse.redirect(base)
  }

  try {
    const { access_token, refresh_token } = await exchangeCode(code)
    const uid = (session.user as { id: string }).id
    await saveBaseToken(uid, access_token, refresh_token)

    const response = NextResponse.redirect(new URL('/store?base_connected=1', request.url))
    // state Cookie を削除
    response.cookies.set('base_oauth_state', '', { maxAge: 0, path: '/' })
    return response
  } catch (e) {
    console.error('[base-connect]', e)
    base.searchParams.set('base_error', 'token_exchange_failed')
    return NextResponse.redirect(base)
  }
}
