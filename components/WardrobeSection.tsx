'use client'

import { useState, useRef, useCallback } from 'react'
import { WardrobeItem, ItemCategory } from '@/types'
import ClothingIcon from './ClothingIcon'

interface Props {
  items: WardrobeItem[]
  useWardrobe: boolean
  onToggleUse: (v: boolean) => void
  onAdd: (item: Omit<WardrobeItem, 'id' | 'addedAt'>) => void
  onRemove: (id: string) => void
}

const CATEGORIES: ItemCategory[] = ['トップス', 'ボトムス', 'シューズ', 'アウター', 'バッグ', 'アクセサリー']

const COLOR_SWATCHES: { name: string; hex: string }[] = [
  { name: 'ホワイト',     hex: '#F8F8F8' },
  { name: 'ライトグレー', hex: '#D0D0D0' },
  { name: 'グレー',       hex: '#9E9E9E' },
  { name: 'チャコール',   hex: '#424242' },
  { name: 'ブラック',     hex: '#111111' },
  { name: 'ベージュ',     hex: '#D2B48C' },
  { name: 'キャメル',     hex: '#C19A6B' },
  { name: 'ブラウン',     hex: '#795548' },
  { name: 'ネイビー',     hex: '#1A237E' },
  { name: 'ブルー',       hex: '#1565C0' },
  { name: 'スカイ',       hex: '#4FC3F7' },
  { name: 'グリーン',     hex: '#2E7D32' },
  { name: 'オリーブ',     hex: '#6B7C50' },
  { name: 'カーキ',       hex: '#A9A97A' },
  { name: 'レッド',       hex: '#C62828' },
  { name: 'ピンク',       hex: '#F06292' },
  { name: 'バーガンディ', hex: '#6D1A36' },
  { name: 'パープル',     hex: '#6A1B9A' },
  { name: 'イエロー',     hex: '#FDD835' },
  { name: 'オレンジ',     hex: '#EF6C00' },
]

const blank = (): Omit<WardrobeItem, 'id' | 'addedAt'> => ({
  category: 'トップス',
  name: '',
  brand: '',
  color: 'ブラック',
  imageColor: '#111111',
  note: '',
  imageDataUrl: undefined,
})

async function compressImage(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1024
      let w = img.width, h = img.height
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else       { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
      resolve({ data: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

async function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const SIZE = 240
      let sw = img.width, sh = img.height
      const ratio = Math.min(SIZE / sw, SIZE / sh)
      sw = Math.round(sw * ratio); sh = Math.round(sh * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = sw; canvas.height = sh
      canvas.getContext('2d')!.drawImage(img, 0, 0, sw, sh)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject
    img.src = url
  })
}

type FormMode = 'idle' | 'manual' | 'photo'
type AnalyzeState = 'idle' | 'loading' | 'done' | 'error'

export default function WardrobeSection({ items, useWardrobe, onToggleUse, onAdd, onRemove }: Props) {
  const [open, setOpen]         = useState(true)
  const [formMode, setFormMode] = useState<FormMode>('idle')
  const [draft, setDraft]       = useState(blank())
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>('idle')
  const [analyzeError, setAnalyzeError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof typeof draft>(k: K, v: typeof draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))

  const handleAdd = () => {
    if (!draft.name.trim()) return
    onAdd(draft)
    setDraft(blank())
    setFormMode('idle')
    setAnalyzeState('idle')
  }

  const handleRemove = (id: string) => {
    setDeleting(id)
    setTimeout(() => { onRemove(id); setDeleting(null) }, 300)
  }

  const closeForm = () => {
    setFormMode('idle')
    setDraft(blank())
    setAnalyzeState('idle')
    setAnalyzeError('')
  }

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setFormMode('photo')
    setAnalyzeState('loading')
    setAnalyzeError('')
    try {
      const [compressed, thumb] = await Promise.all([
        compressImage(file),
        createThumbnail(file),
      ])
      const res = await fetch('/api/wardrobe/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: compressed.data, mediaType: compressed.mediaType }),
      })
      if (!res.ok) throw new Error('analyze failed')
      const result = await res.json()
      setDraft({
        category:     result.category   ?? 'トップス',
        name:         result.name       ?? '',
        brand:        result.brand      ?? '',
        color:        result.color      ?? '',
        imageColor:   result.imageColor ?? '#AAAAAA',
        note:         result.note       ?? '',
        imageDataUrl: thumb,
      })
      setAnalyzeState('done')
    } catch {
      setAnalyzeState('error')
      setAnalyzeError('画像の解析に失敗しました。手動で入力してください。')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const showForm = formMode !== 'idle'

  return (
    <section className="border border-gray-200">
      {/* ── Header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
              <path d="M3 6h18M3 12h18M3 18h18"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="text-xs font-black tracking-wider uppercase">My Closet</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {items.length > 0 ? `${items.length}点登録済み` : 'アイテムを登録してコーデに活用'}
            </div>
          </div>
          {items.length > 0 && (
            <span className="ml-1 text-[10px] bg-black text-white px-1.5 py-0.5 font-bold">{items.length}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* ── Body ── */}
      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">

          {/* "コーデに使う" toggle */}
          {items.length > 0 && (
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 border border-gray-200">
              <div>
                <p className="text-xs font-bold">マイクロゼットを使ってコーデを組む</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  登録したアイテムを起点にAIがコーデを提案します
                </p>
              </div>
              <button
                onClick={() => onToggleUse(!useWardrobe)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${useWardrobe ? 'bg-black' : 'bg-gray-300'}`}
                role="switch"
                aria-checked={useWardrobe}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${useWardrobe ? 'translate-x-5' : ''}`}
                />
              </button>
            </div>
          )}

          {/* Items grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`relative border border-gray-100 hover:border-gray-300 transition-all duration-200 ${deleting === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                >
                  {/* Item visual */}
                  <div
                    className="aspect-square overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: item.imageColor + '22' }}
                  >
                    {item.imageDataUrl ? (
                      <img
                        src={item.imageDataUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ClothingIcon category={item.category} color={item.imageColor} size={44} />
                    )}
                  </div>
                  {/* Info */}
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[8px] tracking-wider uppercase text-gray-400 font-bold">{item.category}</span>
                    </div>
                    <p className="text-[10px] font-bold clamp-1">{item.name}</p>
                    {item.brand && <p className="text-[9px] text-gray-400 clamp-1">{item.brand}</p>}
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-gray-200 shrink-0"
                        style={{ backgroundColor: item.imageColor }}
                      />
                      <span className="text-[9px] text-gray-500">{item.color}</span>
                    </div>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/80 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-400 transition-colors"
                    aria-label="削除"
                  >
                    <svg className="w-2.5 h-2.5 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add buttons / form */}
          {!showForm ? (
            <div className="grid grid-cols-2 gap-2">
              {/* Manual add */}
              <button
                onClick={() => setFormMode('manual')}
                className="flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 hover:border-black transition-colors text-xs text-gray-500 hover:text-black"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                手動で追加
              </button>
              {/* Photo add */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 hover:border-black transition-colors text-xs text-gray-500 hover:text-black"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                画像で登録
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* ── Add form ── */
            <div className="border border-black p-4 space-y-4 anim-fade-up">
              {/* Form header */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-black tracking-wider uppercase">アイテムを追加</p>
                <button onClick={closeForm} className="text-gray-400 hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Photo mode: upload zone or analyzing state */}
              {formMode === 'photo' && analyzeState !== 'done' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => analyzeState !== 'loading' && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded transition-colors flex flex-col items-center justify-center gap-3 py-8 cursor-pointer
                    ${dragOver ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-500'}
                    ${analyzeState === 'loading' ? 'cursor-wait pointer-events-none' : ''}`}
                >
                  {analyzeState === 'loading' ? (
                    <>
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-500">AIが画像を解析中...</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <div className="text-center">
                        <p className="text-xs font-bold">画像をドロップ または クリックして選択</p>
                        <p className="text-[10px] text-gray-400 mt-1">JPG / PNG / WEBP</p>
                      </div>
                      {analyzeState === 'error' && (
                        <p className="text-[10px] text-red-500 text-center px-4">{analyzeError}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Image thumbnail preview (after analysis) */}
              {draft.imageDataUrl && analyzeState === 'done' && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                  <img
                    src={draft.imageDataUrl}
                    alt="preview"
                    className="w-16 h-16 object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-gray-700">AIによる自動解析完了</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">以下の情報を確認・編集してください</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1.5 text-[9px] text-gray-500 underline hover:text-black"
                    >
                      別の画像を選択
                    </button>
                  </div>
                </div>
              )}

              {/* Show form fields when manual mode OR analysis complete */}
              {(formMode === 'manual' || analyzeState === 'done' || analyzeState === 'error') && (
                <>
                  {/* Category */}
                  <div>
                    <label className="section-label block mb-2">カテゴリ</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => set('category', cat)}
                          className={`py-2 text-[10px] font-bold border transition-all
                            ${draft.category === cat ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-500'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="section-label block mb-2">アイテム名 <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="例：白のオックスフォードシャツ"
                      className="input-base"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="section-label block mb-2">ブランド（任意）</label>
                    <input
                      type="text"
                      value={draft.brand}
                      onChange={(e) => set('brand', e.target.value)}
                      placeholder="例：UNIQLO"
                      className="input-base"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="section-label block mb-2">カラー</label>
                    <div className="grid grid-cols-10 gap-1 mb-2">
                      {COLOR_SWATCHES.map(({ name, hex }) => (
                        <button
                          key={hex}
                          title={name}
                          onClick={() => { set('color', name); set('imageColor', hex) }}
                          className={`aspect-square rounded-sm border-2 transition-all ${
                            draft.imageColor === hex ? 'border-black scale-110' : 'border-transparent hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      value={draft.color}
                      onChange={(e) => set('color', e.target.value)}
                      placeholder="例：ホワイト"
                      className="input-base text-[11px]"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="section-label block mb-2">メモ（任意）</label>
                    <input
                      type="text"
                      value={draft.note}
                      onChange={(e) => set('note', e.target.value)}
                      placeholder="例：お気に入りの一枚、春夏用"
                      className="input-base"
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdd}
                      disabled={!draft.name.trim()}
                      className="flex-1 py-3 btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      追加する
                    </button>
                    <button
                      onClick={closeForm}
                      className="px-4 py-3 btn-outline"
                    >
                      キャンセル
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
