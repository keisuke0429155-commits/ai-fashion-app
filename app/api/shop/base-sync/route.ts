import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchAllItems, guessCategory, defaultImageColor, refreshToken as refreshBaseToken } from '@/lib/baseApi'
import { getShopByOwner, upsertBaseProducts, saveBaseToken, markBaseSynced } from '@/lib/shopData'
import { ShopProduct } from '@/types'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid  = (session.user as { id: string }).id
  const shop = await getShopByOwner(uid)

  if (!shop) return NextResponse.json({ error: 'ショップが未登録です' }, { status: 400 })
  if (!shop.baseAccessToken) return NextResponse.json({ error: 'BASEが未連携です' }, { status: 400 })

  let accessToken = shop.baseAccessToken

  // アクセストークンで商品を取得（失敗時はリフレッシュ）
  let items = await fetchAllItems(accessToken).catch(() => null)
  if (!items && shop.baseRefreshToken) {
    try {
      const tokens = await refreshBaseToken(shop.baseRefreshToken)
      accessToken  = tokens.access_token
      await saveBaseToken(uid, tokens.access_token, tokens.refresh_token)
      items = await fetchAllItems(accessToken)
    } catch {
      return NextResponse.json({ error: 'BASEのトークンが無効です。再連携してください。' }, { status: 401 })
    }
  }
  if (!items) return NextResponse.json({ error: 'BASE商品の取得に失敗しました' }, { status: 502 })

  // BASE アイテム → ShopProduct に変換
  const incoming: Omit<ShopProduct, 'id' | 'createdAt'>[] = items.map((item) => {
    const category = guessCategory(item.title, item.detail)
    return {
      shopId:          shop.id,
      shopName:        shop.name,
      shopUrl:         shop.url,
      shopAccentColor: shop.accentColor,
      category,
      name:            item.title,
      price:           item.price,
      color:           '',
      imageColor:      defaultImageColor(category),
      description:     item.detail ? item.detail.replace(/<[^>]+>/g, '').slice(0, 40) : '',
      productUrl:      `https://thebase.in/items/${item.item_id}`,
      active:          true,
      source:          'base' as const,
      sourceItemId:    String(item.item_id),
    }
  })

  const result = await upsertBaseProducts(shop.id, incoming)
  await markBaseSynced(uid)

  return NextResponse.json({
    ok: true,
    synced: items.length,
    ...result,
  })
}
