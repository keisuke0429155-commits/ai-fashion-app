import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json(null, { status: 401 })

  const { data } = await db
    .from('users')
    .select('profile')
    .eq('email', session.user.email)
    .single()

  return NextResponse.json(data?.profile ?? null)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await req.json()

  const { error } = await db
    .from('users')
    .update({ profile })
    .eq('email', session.user.email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
