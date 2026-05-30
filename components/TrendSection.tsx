'use client'

import { useState } from 'react'
import { TRENDS, PLATFORM_META, Platform } from '@/lib/mockTrends'

interface Props {
  selected: string[]
  onChange: (ids: string[]) => void
}

const TABS: { id: Platform | 'all'; label: string }[] = [
  { id: 'all',       label: 'すべて' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok',    label: 'TikTok' },
  { id: 'x',         label: 'X' },
]

function PlatformIcon({ platform, size = 12 }: { platform: Platform; size?: number }) {
  if (platform === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
  if (platform === 'tiktok') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.21 8.21 0 004.79 1.52V6.79a4.85 4.85 0 01-1.02-.1z"/>
    </svg>
  )
  // X
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 5.894 5.45-5.894zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

export default function TrendSection({ selected, onChange }: Props) {
  const [tab, setTab] = useState<Platform | 'all'>('all')
  const [open, setOpen] = useState(true)

  const filtered = tab === 'all' ? TRENDS : TRENDS.filter((t) => t.platform === tab)
  const risingCount = TRENDS.filter((t) => t.rising).length

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else if (selected.length < 5) {
      onChange([...selected, id])
    }
  }

  return (
    <section className="border border-gray-200">
      {/* ── Header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase">SNS Trends</span>
              {/* Live badge */}
              <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 border border-red-400 px-1.5 py-0.5 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {risingCount}件が急上昇中 · 最大5つ選択してコーデに反映
            </div>
          </div>
          {selected.length > 0 && (
            <span className="ml-1 text-[10px] bg-black text-white px-1.5 py-0.5 font-bold">{selected.length}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Platform tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 px-5 py-3 text-[11px] font-bold tracking-wider transition-all border-b-2 ${
                  tab === t.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.id !== 'all' && (
                  <span
                    className="inline-flex mr-1.5 align-middle"
                    style={{ color: PLATFORM_META[t.id as Platform].color }}
                  >
                    <PlatformIcon platform={t.id as Platform} size={11} />
                  </span>
                )}
                {t.label}
                {t.id !== 'all' && (
                  <span className="ml-1.5 text-[9px] text-gray-400">
                    {TRENDS.filter((tr) => tr.platform === t.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Selected notice */}
          {selected.length > 0 && (
            <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 bg-black text-white text-[11px]">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span className="font-bold">{selected.length}件のトレンドをコーデに反映します</span>
              <button
                onClick={() => onChange([])}
                className="ml-auto text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}

          {/* Trend cards */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((trend) => {
              const isSelected = selected.includes(trend.id)
              const isDisabled = !isSelected && selected.length >= 5
              const meta = PLATFORM_META[trend.platform]

              return (
                <button
                  key={trend.id}
                  onClick={() => toggle(trend.id)}
                  disabled={isDisabled}
                  className={`relative text-left border-2 transition-all duration-200 overflow-hidden
                    ${isSelected
                      ? 'border-black shadow-[3px_3px_0_0_#000]'
                      : isDisabled
                        ? 'border-gray-100 opacity-40 cursor-not-allowed'
                        : 'border-gray-100 hover:border-gray-400'
                    }`}
                >
                  {/* Platform color accent bar */}
                  <div className="h-1" style={{ backgroundColor: meta.color }} />

                  <div className="p-3.5">
                    {/* Top row: platform + badges */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5" style={{ color: meta.color }}>
                        <PlatformIcon platform={trend.platform} size={10} />
                        <span className="text-[9px] font-bold tracking-wider">{meta.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {trend.rising && (
                          <span className="text-[8px] font-black text-red-500 border border-red-300 px-1 py-0.5 tracking-wider flex items-center gap-0.5">
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path d="M12 19V5M5 12l7-7 7 7"/>
                            </svg>
                            急上昇
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hashtag */}
                    <p className="text-sm font-black leading-tight mb-1">{trend.tag}</p>

                    {/* Category + description */}
                    <p className="text-[9px] text-gray-400 font-medium tracking-wider uppercase mb-0.5">{trend.category}</p>
                    <p className="text-[10px] text-gray-500 leading-snug">{trend.description}</p>

                    {/* Count */}
                    <p className="text-[10px] font-bold text-gray-400 mt-2">{trend.count} posts</p>
                  </div>

                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer note */}
          <div className="px-5 pb-4">
            <p className="text-[10px] text-gray-400">
              ※ トレンドデータはデモ用の模擬データです。AIがコーデ提案に反映します。
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
