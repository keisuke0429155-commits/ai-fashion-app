import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getShopByOwner, getProductsByShop, addProduct, getAllActiveProducts } from '@/lib/shopData'

// GET /api/shop/products          → 自分のショップの商品一覧
// GET /api/shop/products?all=true → 全店舗のアクティブ商品（ユーザー向け）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('all') === 'true') {
    return NextResponse.json(await getAllActiveProducts())
  }
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid  = (session.user as { id: string }).id
  const shop = await getShopByOwner(uid)
  if (!shop) return NextResponse.json([])
  return NextResponse.json(await getProductsByShop(shop.id))
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const uid  = (session.user as { id: string }).id
  const shop = await getShopByOwner(uid)
  if (!shop) return NextResponse.json({ error: '先にショップを登録してください' }, { status: 400 })

  const body = await request.json()
  const { category, name, price, color, imageColor, description, productUrl } = body
  if (!category || !name?.trim() || !productUrl?.trim()) {
    return NextResponse.json({ error: 'カテゴリ・商品名・商品URLは必須です' }, { status: 400 })
  }
  const product = await addProduct({
    shopId: shop.id,
    shopName: shop.name,
    shopUrl: shop.url,
    shopAccentColor: shop.accentColor,
    category,
    name: name.trim(),
    price: Number(price) || 0,
    color: color?.trim() ?? '',
    imageColor: imageColor ?? '#CCCCCC',
    description: description?.trim() ?? '',
    productUrl: productUrl.trim(),
    active: true,
    source: 'manual',
  })
  return NextResponse.json(product)
}
