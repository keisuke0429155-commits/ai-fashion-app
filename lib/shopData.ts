import { ShopInfo, ShopProduct, ItemCategory } from '@/types'
import { db } from './supabase'

// ── Row mappers ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toShop(row: any): ShopInfo {
  return {
    id:               row.id,
    ownerId:          row.owner_id,
    name:             row.name,
    url:              row.url,
    description:      row.description,
    accentColor:      row.accent_color,
    baseAccessToken:  row.base_access_token  ?? undefined,
    baseRefreshToken: row.base_refresh_token ?? undefined,
    baseLastSyncAt:   row.base_last_sync_at  ?? undefined,
    createdAt:        row.created_at,
  }
}

function shopToRow(data: Partial<Omit<ShopInfo, 'id' | 'ownerId' | 'createdAt'>>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (data.name             !== undefined) row.name               = data.name
  if (data.url              !== undefined) row.url                = data.url
  if (data.description      !== undefined) row.description        = data.description
  if (data.accentColor      !== undefined) row.accent_color       = data.accentColor
  if (data.baseAccessToken  !== undefined) row.base_access_token  = data.baseAccessToken
  if (data.baseRefreshToken !== undefined) row.base_refresh_token = data.baseRefreshToken
  if (data.baseLastSyncAt   !== undefined) row.base_last_sync_at  = data.baseLastSyncAt
  return row
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(row: any): ShopProduct {
  return {
    id:              row.id,
    shopId:          row.shop_id,
    shopName:        row.shop_name,
    shopUrl:         row.shop_url,
    shopAccentColor: row.shop_accent_color,
    category:        row.category as ItemCategory,
    name:            row.name,
    price:           row.price,
    color:           row.color,
    imageColor:      row.image_color,
    description:     row.description,
    productUrl:      row.product_url,
    active:          row.active,
    source:          row.source as 'manual' | 'base',
    sourceItemId:    row.source_item_id ?? undefined,
    createdAt:       row.created_at,
  }
}

function productToRow(data: Partial<ShopProduct>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (data.shopId          !== undefined) row.shop_id          = data.shopId
  if (data.shopName        !== undefined) row.shop_name        = data.shopName
  if (data.shopUrl         !== undefined) row.shop_url         = data.shopUrl
  if (data.shopAccentColor !== undefined) row.shop_accent_color = data.shopAccentColor
  if (data.category        !== undefined) row.category         = data.category
  if (data.name            !== undefined) row.name             = data.name
  if (data.price           !== undefined) row.price            = data.price
  if (data.color           !== undefined) row.color            = data.color
  if (data.imageColor      !== undefined) row.image_color      = data.imageColor
  if (data.description     !== undefined) row.description      = data.description
  if (data.productUrl      !== undefined) row.product_url      = data.productUrl
  if (data.active          !== undefined) row.active           = data.active
  if (data.source          !== undefined) row.source           = data.source
  if (data.sourceItemId    !== undefined) row.source_item_id   = data.sourceItemId
  return row
}

// ── Shops ──────────────────────────────────────────────────────────────────

export async function getShopByOwner(ownerId: string): Promise<ShopInfo | null> {
  const { data } = await db.from('shops').select('*').eq('owner_id', ownerId).maybeSingle()
  return data ? toShop(data) : null
}

export async function getShopById(id: string): Promise<ShopInfo | null> {
  const { data } = await db.from('shops').select('*').eq('id', id).maybeSingle()
  return data ? toShop(data) : null
}

export async function getAllShops(): Promise<ShopInfo[]> {
  const { data } = await db.from('shops').select('*')
  return (data ?? []).map(toShop)
}

export async function upsertShop(
  ownerId: string,
  data: Partial<Omit<ShopInfo, 'id' | 'ownerId' | 'createdAt'>>
): Promise<ShopInfo> {
  const { data: existing } = await db
    .from('shops').select('*').eq('owner_id', ownerId).maybeSingle()

  if (existing) {
    const { data: updated, error } = await db
      .from('shops').update(shopToRow(data)).eq('owner_id', ownerId).select().single()
    if (error) throw new Error(error.message)
    return toShop(updated)
  }

  const id = `shop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const { data: inserted, error } = await db
    .from('shops')
    .insert({
      id, owner_id: ownerId,
      name: '', url: '', description: '', accent_color: '#000000',
      ...shopToRow(data),
    })
    .select().single()
  if (error) throw new Error(error.message)
  return toShop(inserted)
}

export async function saveBaseToken(
  ownerId: string, accessToken: string, refreshToken: string
): Promise<ShopInfo> {
  return upsertShop(ownerId, { baseAccessToken: accessToken, baseRefreshToken: refreshToken })
}

export async function markBaseSynced(ownerId: string): Promise<ShopInfo> {
  return upsertShop(ownerId, { baseLastSyncAt: new Date().toISOString() })
}

// ── Products ───────────────────────────────────────────────────────────────

export async function getProductsByShop(shopId: string): Promise<ShopProduct[]> {
  const { data } = await db.from('shop_products').select('*').eq('shop_id', shopId)
  return (data ?? []).map(toProduct)
}

export async function getAllActiveProducts(): Promise<ShopProduct[]> {
  const { data } = await db.from('shop_products').select('*').eq('active', true)
  return (data ?? []).map(toProduct)
}

export async function addProduct(
  data: Omit<ShopProduct, 'id' | 'createdAt'>
): Promise<ShopProduct> {
  const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const { data: inserted, error } = await db
    .from('shop_products')
    .insert({ id, ...productToRow(data as Partial<ShopProduct>) })
    .select().single()
  if (error) throw new Error(error.message)
  return toProduct(inserted)
}

export async function updateProduct(
  id: string, shopId: string, data: Partial<ShopProduct>
): Promise<ShopProduct | null> {
  const { data: updated, error } = await db
    .from('shop_products')
    .update(productToRow(data))
    .eq('id', id).eq('shop_id', shopId)
    .select().maybeSingle()
  if (error) throw new Error(error.message)
  return updated ? toProduct(updated) : null
}

export async function deleteProduct(id: string, shopId: string): Promise<boolean> {
  const { error, count } = await db
    .from('shop_products')
    .delete({ count: 'exact' })
    .eq('id', id).eq('shop_id', shopId)
  return !error && (count ?? 0) > 0
}

// BASE 由来の商品を一括 upsert（sourceItemId で照合）
export async function upsertBaseProducts(
  shopId: string,
  incoming: Omit<ShopProduct, 'id' | 'createdAt'>[]
): Promise<{ added: number; updated: number; deactivated: number }> {
  const { data: existingRows } = await db
    .from('shop_products').select('*').eq('shop_id', shopId).eq('source', 'base')

  const existing   = (existingRows ?? []).map(toProduct)
  const incomingMap = new Map(incoming.map((p) => [p.sourceItemId, p]))
  const existingMap = new Map(existing.map((p) => [p.sourceItemId, p]))

  let added = 0, updated = 0, deactivated = 0

  // Deactivate removed products (batch)
  const toDeactivate = existing.filter((p) => p.sourceItemId && !incomingMap.has(p.sourceItemId))
  if (toDeactivate.length > 0) {
    await db.from('shop_products')
      .update({ active: false })
      .in('id', toDeactivate.map((p) => p.id))
    deactivated = toDeactivate.length
  }

  // Update existing products
  const toUpdate = existing.filter((p) => p.sourceItemId && incomingMap.has(p.sourceItemId))
  for (const p of toUpdate) {
    const src = incomingMap.get(p.sourceItemId!)!
    await db.from('shop_products').update(productToRow(src as Partial<ShopProduct>)).eq('id', p.id)
    updated++
  }

  // Insert new products (batch)
  const newItems = incoming.filter((p) => !existingMap.has(p.sourceItemId))
  if (newItems.length > 0) {
    const now = new Date().toISOString()
    const rows = newItems.map((data, i) => ({
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${i}`,
      created_at: now,
      ...productToRow(data as Partial<ShopProduct>),
    }))
    await db.from('shop_products').insert(rows)
    added = newItems.length
  }

  return { added, updated, deactivated }
}
