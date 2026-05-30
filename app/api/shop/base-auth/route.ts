import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBaseAuthUrl, IS_BASE_CONFIGURED } from '@/lib/baseApi'
import { randomBytes } from 'crypto'

export async function GET() {
  if (!IS_BASE_CONFIGURED) {
    return NextResponse.json({ error: 'BASE_CLIENT_ID / BASE_CLIENT_SECRET が未設定です' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const state = randomBytes(16).toString('hex')
  const url   = getBaseAuthUrl(state)

  const response = NextResponse.redirect(url)
  // state を HttpOnly Cookie に保存（5分間有効）
  response.cookies.set('base_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })
  return response
}
