'use client'

import { useEffect, useRef, useState } from 'react'
import { OutfitItem } from '@/types'
import ClothingIcon from './ClothingIcon'
import { STORES } from '@/lib/stores'

interface Props {
  item: OutfitItem
  index: number
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 200, g: 200, b: 200 }
}

function isLight(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}

export default function ProductCard({ item, index }: Props) {
  const [liked, setLiked] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const bgColor = item.imageColor || '#e0e0e0'
  const { r, g, b } = hexToRgb(bgColor)
  const iconColor = isLight(bgColor)
    ? `rgb(${Math.max(r - 80, 0)},${Math.max(g - 80, 0)},${Math.max(b - 80, 0)})`
    : 'rgb(255,255,255)'

  // 検索クエリ（日本語の商品名+ブランドをフォールバックとして使用）
  const searchQuery = item.searchQuery || `${item.brand} ${item.name}`

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    if (!shopOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [shopOpen])

  return (
    <div
      className="group bg-white border border-gray-100 hover:border-black hover:shadow-[3px_3px_0_0_#000] transition-all duration-250 anim-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* ── Image area ── */}
      <div
        className="relative aspect-[3/4] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: `rgba(${r},${g},${b},0.18)` }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse at 60% 30%, rgba(${r},${g},${b},0.6) 0%, transparent 70%)` }}
        />
        <div className="relative z-10 opacity-90 group-hover:scale-105 transition-transform duration-300">
          <ClothingIcon category={item.category} color={iconColor} size={72} />
        </div>
        <div
          className="absolute bottom-3 right-3 w-5 h-5 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: bgColor }}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="text-[9px] tracking-[0.2em] uppercase bg-white/90 backdrop-blur-sm text-black px-2 py-0.5 font-bold border border-black/10">
            {item.category}
          </span>
          {item.isOwned && (
            <span className="text-[9px] tracking-[0.1em] uppercase bg-emerald-500 text-white px-2 py-0.5 font-bold">
              MY CLOSET
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked) }}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          aria-label="お気に入り"
        >
          <svg
            className={`w-3.5 h-3.5 transition-colors ${liked ? 'fill-black stroke-black' : 'fill-none stroke-black'}`}
            viewBox="0 0 24 24" strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* ── Info area ── */}
      <div className="p-3 space-y-1.5">
        <p className="text-[10px] text-gray-400 tracking-widest uppercase font-medium clamp-1">{item.brand || '—'}</p>
        <p className="text-xs font-semibold leading-snug clamp-2">{item.name}</p>
        <p className="text-[10px] text-gray-400 clamp-1">{item.description}</p>

        <div className="pt-1.5 flex items-center justify-between gap-2">
          {item.isOwned ? (
            /* ── 所有アイテム表示 ── */
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-black text-gray-400">あなたの服</span>
              <span className="text-[9px] tracking-widest uppercase font-bold text-emerald-600 border border-emerald-400 px-2 py-1 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                My Closet
              </span>
            </div>
          ) : (
            /* ── 購入アイテム表示 ── */
            <>
              <span className="text-sm font-black tracking-tight">¥{item.price.toLocaleString()}</span>
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShopOpen((v) => !v)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-[10px] tracking-widest uppercase font-bold hover:bg-zinc-700 transition-colors"
                >
                  購入先
                  <svg
                    className={`w-2.5 h-2.5 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
                  >
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {shopOpen && (
                  <div className="absolute bottom-full right-0 mb-1.5 w-44 bg-white border border-black shadow-[3px_3px_0_0_#000] z-50 anim-fade-up">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-[9px] tracking-widest uppercase text-gray-400 font-bold">購入先を選ぶ</p>
                    </div>
                    {STORES.map((store) => (
                      <a
                        key={store.id}
                        href={store.buildUrl(searchQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShopOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors group/store"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: store.bg }} />
                        <span className="text-[11px] font-medium flex-1 truncate">{store.name}</span>
                        <svg className="w-3 h-3 text-gray-300 group-hover/store:text-black transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
