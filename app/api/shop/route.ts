import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getShopByOwner, upsertShop } from '@/lib/shopData'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid  = (session.user as { id: string }).id
  const shop = await getShopByOwner(uid)
  return NextResponse.json(shop ?? null)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid = (session.user as { id: string }).id

  const { name, url, description, accentColor } = await request.json()
  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'ショップ名とURLは必須です' }, { status: 400 })
  }
  const shop = await upsertShop(uid, {
    name: name.trim(),
    url: url.trim(),
    description: description?.trim() ?? '',
    accentColor: accentColor ?? '#000000',
  })
  return NextResponse.json(shop)
}
