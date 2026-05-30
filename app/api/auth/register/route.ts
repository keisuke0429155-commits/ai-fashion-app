import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/users'

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json()

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: '全項目を入力してください' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'パスワードは6文字以上にしてください' }, { status: 400 })
  }

  try {
    const user = await createUser(name.trim(), email.trim(), password)
    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '登録に失敗しました' },
      { status: 400 },
    )
  }
}
