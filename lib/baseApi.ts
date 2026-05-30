import { ItemCategory } from '@/types'

const AUTH_URL    = 'https://api.thebase.in/1/oauth/authorize'
const TOKEN_URL   = 'https://api.thebase.in/1/oauth/token'
const API_BASE    = 'https://api.thebase.in/1'

export const IS_BASE_CONFIGURED = !!(
  process.env.BASE_CLIENT_ID && process.env.BASE_CLIENT_SECRET
)

function redirectUri() {
  return process.env.BASE_REDIRECT_URI ?? 'http://localhost:3000/api/shop/base-connect'
}

export function getBaseAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     process.env.BASE_CLIENT_ID!,
    redirect_uri:  redirectUri(),
    scope:         'read_items',
    state,
  })
  return `${AUTH_URL}?${params}`
}

export async function exchangeCode(code: string): Promise<{ access_token: string; refresh_token: string }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     process.env.BASE_CLIENT_ID!,
      client_secret: process.env.BASE_CLIENT_SECRET!,
      code,
      redirect_uri:  redirectUri(),
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`BASE token error: ${txt}`)
  }
  return res.json()
}

export async function refreshToken(refresh_token: string): Promise<{ access_token: string; refresh_token: string }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     process.env.BASE_CLIENT_ID!,
      client_secret: process.env.BASE_CLIENT_SECRET!,
      refresh_token,
    }),
  })
  if (!res.ok) throw new Error('BASE refresh failed')
  return res.json()
}

export interface BaseItem {
  item_id:      number
  title:        string
  detail:       string
  price:        number
  stock:        number
  visible:      number   // 1 = visible
  img1_origin:  string
  modified:     string
}

interface BaseItemsResponse {
  items:       BaseItem[]
  total_count: number
}

export async function fetchAllItems(accessToken: string): Promise<BaseItem[]> {
  const all: BaseItem[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const res = await fetch(
      `${API_BASE}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) break
    const data: BaseItemsResponse = await res.json()
    const items = data.items ?? []
    all.push(...items)
    if (all.length >= data.total_count || items.length < limit) break
    offset += limit
  }
  return all.filter((i) => i.visible === 1)
}

// ── カテゴリ推定 ────────────────────────────────────────────────
export function guessCategory(title: string, detail: string): ItemCategory {
  const t = (title + ' ' + (detail ?? '')).toLowerCase()
  if (/コート|ジャケット|アウター|ブルゾン|ma-1|ダウン|ベスト|カーディガン/.test(t)) return 'アウター'
  if (/パンツ|デニム|ジーンズ|スカート|ボトムス|ショーツ|チノ|スラックス|レギンス/.test(t)) return 'ボトムス'
  if (/シューズ|スニーカー|ブーツ|サンダル|ローファー|パンプス|靴|フットウェア/.test(t)) return 'シューズ'
  if (/バッグ|トート|リュック|ポーチ|クラッチ|財布|ウォレット|鞄|ハンドバッグ/.test(t)) return 'バッグ'
  if (/ネックレス|リング|指輪|ピアス|イヤリング|ブレスレット|時計|帽子|キャップ|ハット|スカーフ|マフラー|ベルト|アクセサリー/.test(t)) return 'アクセサリー'
  return 'トップス'
}

// カテゴリ別デフォルトカラー（画像解析なしのフォールバック）
const CATEGORY_COLORS: Record<ItemCategory, string> = {
  'トップス':    '#E8E0D8',
  'ボトムス':    '#7B8FA1',
  'シューズ':    '#8D7355',
  'アウター':    '#5C6B7A',
  'バッグ':      '#9C7B5A',
  'アクセサリー':'#B0B0B0',
}

export function defaultImageColor(category: ItemCategory): string {
  return CATEGORY_COLORS[category]
}
