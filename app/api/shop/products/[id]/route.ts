import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getShopByOwner, deleteProduct, updateProduct } from '@/lib/shopData'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid  = (session.user as { id: string }).id
  const shop = await getShopByOwner(uid)
  if (!shop) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const ok = await deleteProduct(params.id, shop.id)
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid  = (session.user as { id: string }).id
  const shop = await getShopByOwner(uid)
  if (!shop) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data    = await request.json()
  const updated = await updateProduct(params.id, shop.id, data)
  return updated ? NextResponse.json(updated) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}
