'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { ShopInfo, ShopProduct, ItemCategory } from '@/types'
import ClothingIcon from '@/components/ClothingIcon'

const CATEGORIES: ItemCategory[] = ['トップス', 'ボトムス', 'シューズ', 'アウター', 'バッグ', 'アクセサリー']

const ACCENT_COLORS = [
  '#000000', '#1A1A2E', '#1565C0', '#2E7D32', '#795548',
  '#C62828', '#AD1457', '#6A1B9A', '#E65100', '#37474F',
]

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}
function isLight(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

function blank() {
  return { category: 'トップス' as ItemCategory, name: '', price: '', color: '', imageColor: '#888888', description: '', productUrl: '' }
}

export default function StorePageWrapper() {
  return (
    <Suspense>
      <StorePage />
    </Suspense>
  )
}

function StorePage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()

  const [shop, setShop]           = useState<ShopInfo | null>(null)
  const [products, setProducts]   = useState<ShopProduct[]>([])
  const [shopLoading, setShopL]   = useState(true)
  const [saving, setSaving]       = useState(false)
  const [shopError, setShopError] = useState<string | null>(null)
  const [shopSuccess, setShopSuc] = useState(false)

  // BASE sync state
  const [syncing,      setSyncing]   = useState(false)
  const [syncResult,   setSyncResult] = useState<{ synced: number; added: number; updated: number; deactivated: number } | null>(null)
  const [syncError,    setSyncError]  = useState<string | null>(null)
  const [baseMsg,      setBaseMsg]    = useState<string | null>(null)

  // shop form
  const [sName,  setSName]  = useState('')
  const [sUrl,   setSUrl]   = useState('')
  const [sDesc,  setSDesc]  = useState('')
  const [sColor, setSColor] = useState('#000000')

  // product form
  const [showForm,  setShowForm]  = useState(false)
  const [prodDraft, setProdDraft] = useState(blank())
  const [prodErr,   setProdErr]   = useState<string | null>(null)
  const [prodSaving,setProdSave]  = useState(false)

  const loadProducts = useCallback(() => {
    fetch('/api/shop/products')
      .then((r) => r.json())
      .then(setProducts)
  }, [])

  // load shop
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/shop')
      .then((r) => r.json())
      .then((data: ShopInfo | null) => {
        setShop(data)
        if (data) { setSName(data.name); setSUrl(data.url); setSDesc(data.description); setSColor(data.accentColor) }
      })
      .finally(() => setShopL(false))
  }, [status])

  // BASE OAuth callback messages
  useEffect(() => {
    if (searchParams.get('base_connected')) {
      setBaseMsg('BASEと連携しました！「商品を同期」ボタンで商品を取り込んでください。')
      window.history.replaceState({}, '', '/store')
    }
    const err = searchParams.get('base_error')
    if (err) {
      const msgs: Record<string, string> = {
        invalid_state:          '不正なリクエストです。もう一度お試しください。',
        token_exchange_failed:  'BASEとの認証に失敗しました。',
        authorization_cancelled:'BASEの認証がキャンセルされました。',
        session_expired:        'セッションが切れました。ログインし直してください。',
      }
      setSyncError(msgs[err] ?? `BASE連携エラー: ${err}`)
      window.history.replaceState({}, '', '/store')
    }
  }, [searchParams])

  // load products
  useEffect(() => {
    if (!shop) return
    loadProducts()
  }, [shop, loadProducts])

  const syncBase = async () => {
    setSyncing(true); setSyncResult(null); setSyncError(null)
    try {
      const res  = await fetch('/api/shop/base-sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setSyncError(data.error); return }
      setSyncResult(data)
      loadProducts()
      // refresh shop to update baseLastSyncAt
      fetch('/api/shop').then((r) => r.json()).then(setShop)
    } catch {
      setSyncError('同期中にエラーが発生しました')
    } finally {
      setSyncing(false)
    }
  }

  const saveShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setShopError(null); setShopSuc(false)
    const res  = await fetch('/api/shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sName, url: sUrl, description: sDesc, accentColor: sColor }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setShopError(data.error); return }
    setShop(data); setShopSuc(true)
    setTimeout(() => setShopSuc(false), 3000)
  }

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setProdErr(null); setProdSave(true)
    const res  = await fetch('/api/shop/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prodDraft, price: Number(prodDraft.price) || 0 }),
    })
    const data = await res.json()
    setProdSave(false)
    if (!res.ok) { setProdErr(data.error); return }
    setProducts((prev) => [...prev, data])
    setProdDraft(blank()); setShowForm(false)
  }

  const deleteProduct = async (id: string) => {
    await fetch(`/api/shop/products/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const toggleActive = async (product: ShopProduct) => {
    const res  = await fetch(`/api/shop/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !product.active }),
    })
    if (res.ok) {
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, active: !p.active } : p))
    }
  }

  // ── Auth states ────────────────────────────────────────
  if (status === 'loading' || shopLoading) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
      </div>
    )
  }
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 text-center">
        <p className="text-sm text-gray-500 mb-4">ショップ管理にはログインが必要です</p>
        <a href="/" className="btn-primary px-6 py-3 text-[11px]">トップページへ</a>
      </div>
    )
  }

  const activeCount = products.filter((p) => p.active).length

  return (
    <div className="anim-fade-in">

      {/* ── Hero ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">
          <p className="section-label mb-2">Store Management</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            ショップ<br />ダッシュボード
          </h1>
          <p className="mt-3 text-xs text-gray-400 max-w-md leading-relaxed">
            商品を登録すると、ユーザーのコーデ結果にあなたのショップのアイテムが表示されます。
          </p>
          {shop && (
            <div className="flex items-center gap-3 mt-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">
                {activeCount}点の商品を公開中
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 space-y-10">

        {/* ── 01 ショップ情報 ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] font-black text-gray-200 tabular-nums">01</span>
            <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Shop Info</h2>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={saveShop} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="section-label block mb-1.5">ショップ名 *</label>
                <input value={sName} onChange={(e) => setSName(e.target.value)} required
                  placeholder="例: STYLE TOKYO" className="input-base w-full" />
              </div>
              <div>
                <label className="section-label block mb-1.5">ショップURL *</label>
                <input value={sUrl} onChange={(e) => setSUrl(e.target.value)} required type="url"
                  placeholder="https://your-shop.com" className="input-base w-full" />
              </div>
            </div>
            <div>
              <label className="section-label block mb-1.5">ショップ説明</label>
              <textarea value={sDesc} onChange={(e) => setSDesc(e.target.value)} rows={2}
                placeholder="ショップのコンセプトを簡単に（任意）"
                className="input-base w-full resize-none" />
            </div>
            <div>
              <label className="section-label block mb-2">ブランドカラー</label>
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setSColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${sColor === c ? 'border-black scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={sColor} onChange={(e) => setSColor(e.target.value)}
                  className="w-7 h-7 rounded-full border border-gray-200 cursor-pointer" title="カスタムカラー" />
                <div className="ml-2 px-3 py-1 text-[11px] font-bold rounded-sm" style={{ backgroundColor: sColor, color: isLight(sColor) ? '#000' : '#fff' }}>
                  {sName || 'SHOP NAME'}
                </div>
              </div>
            </div>

            {shopError && <p className="text-[11px] text-red-500">{shopError}</p>}
            {shopSuccess && <p className="text-[11px] text-emerald-600">保存しました</p>}

            <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-[11px] disabled:opacity-50">
              {saving ? '保存中...' : shop ? 'ショップ情報を更新' : 'ショップを登録'}
            </button>
          </form>
        </section>

        {/* ── 02 BASE連携 ── */}
        {shop && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] font-black text-gray-200 tabular-nums">02</span>
              <h2 className="text-xs tracking-[0.2em] uppercase font-bold">BASE 連携</h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* BASE status card */}
            <div className="border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {/* BASE logo mark */}
                  <div className="w-10 h-10 bg-[#D0021B] flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[13px] tracking-tight">BASE</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold">thebase.in</p>
                    {shop.baseAccessToken ? (
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        ✓ 連携済み
                        {shop.baseLastSyncAt && (
                          <span className="text-gray-400 ml-2">
                            最終同期: {new Date(shop.baseLastSyncAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-0.5">未連携 — BASEショップと接続してください</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Connect / Reconnect */}
                  <a
                    href="/api/shop/base-auth"
                    className="text-[11px] font-bold px-4 py-2 border border-[#D0021B] text-[#D0021B] hover:bg-[#D0021B] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    {shop.baseAccessToken ? '再連携' : 'BASEと連携'}
                  </a>

                  {/* Sync */}
                  {shop.baseAccessToken && (
                    <button
                      onClick={syncBase}
                      disabled={syncing}
                      className="text-[11px] font-bold px-4 py-2 bg-black text-white hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <svg className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                      {syncing ? '同期中...' : '商品を同期'}
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              {baseMsg && (
                <div className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {baseMsg}
                </div>
              )}
              {syncError && (
                <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">{syncError}</div>
              )}
              {syncResult && (
                <div className="mt-3 border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-[11px] font-bold text-gray-700">同期完了 — {syncResult.synced}点取得</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    新規追加: {syncResult.added}点 / 更新: {syncResult.updated}点 / 非公開化: {syncResult.deactivated}点
                  </p>
                </div>
              )}

              {/* How it works */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">連携の仕組み</p>
                <div className="space-y-1.5">
                  {[
                    ['01', 'BASEアカウントで認可するとアクセストークンを取得'],
                    ['02', '「商品を同期」でBASEの公開商品を自動インポート'],
                    ['03', 'コーデ結果画面に提携ショップとしてアイテムが表示される'],
                    ['04', 'ユーザーがアイテムをクリックするとBASEの商品ページへ遷移'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-2 text-[10px] text-gray-500">
                      <span className="text-[9px] font-black text-gray-300 shrink-0 mt-0.5">{n}</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 03 商品管理 ── */}
        {shop && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] font-black text-gray-200 tabular-nums">03</span>
              <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Products</h2>
              <span className="text-[10px] text-gray-400">{products.length}点登録中</span>
              <div className="flex-1 h-px bg-gray-100" />
              <button onClick={() => { setShowForm((v) => !v); setProdErr(null) }}
                className={`text-[11px] font-bold px-3 py-1.5 border transition-all ${showForm ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
                {showForm ? '× キャンセル' : '+ 商品を追加'}
              </button>
            </div>

            {/* Add product form */}
            {showForm && (
              <form onSubmit={addProduct} className="border border-gray-200 p-5 mb-6 space-y-4 anim-fade-up">
                <p className="text-[11px] font-bold tracking-wider uppercase text-gray-500">新規商品追加</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button"
                      onClick={() => setProdDraft((d) => ({ ...d, category: cat }))}
                      className={`py-2 text-[11px] font-medium border transition-all flex items-center justify-center gap-1.5
                        ${prodDraft.category === cat ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-400'}`}>
                      <ClothingIcon category={cat} color={prodDraft.category === cat ? '#fff' : '#666'} size={14} />
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="section-label block mb-1.5">商品名 *</label>
                    <input value={prodDraft.name} onChange={(e) => setProdDraft((d) => ({ ...d, name: e.target.value }))}
                      required placeholder="例: オーバーサイズシャツ" className="input-base w-full" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">商品ページURL *</label>
                    <input value={prodDraft.productUrl} onChange={(e) => setProdDraft((d) => ({ ...d, productUrl: e.target.value }))}
                      required type="url" placeholder="https://your-shop.com/item/xxx" className="input-base w-full" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">価格（円）</label>
                    <input value={prodDraft.price} onChange={(e) => setProdDraft((d) => ({ ...d, price: e.target.value }))}
                      type="number" min="0" placeholder="9800" className="input-base w-full" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">カラー</label>
                    <input value={prodDraft.color} onChange={(e) => setProdDraft((d) => ({ ...d, color: e.target.value }))}
                      placeholder="例: ホワイト、オフホワイト" className="input-base w-full" />
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">イメージカラー（HEX）</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={prodDraft.imageColor}
                        onChange={(e) => setProdDraft((d) => ({ ...d, imageColor: e.target.value }))}
                        className="w-9 h-9 border border-gray-200 cursor-pointer rounded-sm" />
                      <span className="text-[11px] text-gray-500">{prodDraft.imageColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="section-label block mb-1.5">商品説明（任意）</label>
                    <input value={prodDraft.description} onChange={(e) => setProdDraft((d) => ({ ...d, description: e.target.value }))}
                      placeholder="素材・特徴など20字以内" className="input-base w-full" />
                  </div>
                </div>
                {prodErr && <p className="text-[11px] text-red-500">{prodErr}</p>}
                <button type="submit" disabled={prodSaving} className="btn-primary px-8 py-3 text-[11px] disabled:opacity-50">
                  {prodSaving ? '追加中...' : '商品を登録'}
                </button>
              </form>
            )}

            {/* Product list */}
            {products.length === 0 ? (
              <div className="border border-dashed border-gray-200 py-12 text-center">
                <p className="text-xs text-gray-400">まだ商品が登録されていません</p>
                <p className="text-[10px] text-gray-300 mt-1">「+ 商品を追加」から登録してください</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p) => (
                  <div key={p.id} className={`border transition-all ${p.active ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
                    <div className="flex gap-3 p-3">
                      {/* Color block */}
                      <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-sm"
                        style={{ backgroundColor: p.imageColor }}>
                        <ClothingIcon category={p.category} color={isLight(p.imageColor) ? '#333' : '#fff'} size={20} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-[11px] font-bold truncate">{p.name}</p>
                              {p.source === 'base' && (
                                <span className="shrink-0 text-[8px] font-black px-1 py-0.5 bg-[#D0021B] text-white">BASE</span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400">{p.category} · {p.color || '—'} · ¥{p.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => toggleActive(p)}
                              className={`text-[9px] font-bold px-1.5 py-0.5 border transition-all ${p.active ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-400'}`}>
                              {p.active ? '公開' : '非公開'}
                            </button>
                            <button onClick={() => deleteProduct(p.id)}
                              className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <a href={p.productUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[9px] text-blue-500 hover:underline truncate block mt-0.5">
                          {p.productUrl}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Preview ── */}
        {shop && activeCount > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] font-black text-gray-200 tabular-nums">04</span>
              <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Preview</h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="border border-gray-100 p-4">
              <p className="text-[10px] text-gray-400 mb-3">ユーザーのコーデ結果画面に以下のように表示されます</p>
              <div className="border-l-4 pl-3 py-1" style={{ borderColor: shop.accentColor }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black tracking-wider" style={{ color: shop.accentColor }}>{shop.name}</span>
                  <span className="text-[9px] text-gray-400">提携ショップ</span>
                </div>
                <p className="text-[10px] text-gray-500">{shop.description || 'ショップのコンセプト説明'}</p>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
