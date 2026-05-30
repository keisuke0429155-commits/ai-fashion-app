'use client'

import { useState } from 'react'
import { DayOutfit, ItemCategory } from '@/types'
import { WeatherDay } from '@/lib/weather'
import ProductCard from './ProductCard'
import ShopProductsPanel from './ShopProductsPanel'
import { STORES } from '@/lib/stores'

interface Props {
  outfit: DayOutfit
  index: number
  isActive: boolean
  onToggle: () => void
  weatherDay?: WeatherDay
}

const dayColors = [
  '#f5f5f5', '#fafafa', '#f5f5f5', '#fafafa', '#f5f5f5', '#fafafa', '#f5f5f5',
]

export default function DayOutfitSection({ outfit, index, isActive, onToggle, weatherDay }: Props) {
  const total = outfit.items.reduce((s, i) => s + i.price, 0)

  return (
    <div className={`border-b border-gray-100 transition-all duration-200 ${isActive ? 'bg-white' : 'hover:bg-gray-50/50'}`}>
      {/* ── Header button ── */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 md:px-8 py-5 flex items-center gap-5 md:gap-8"
      >
        {/* Day number + name */}
        <div className="shrink-0 w-16 md:w-20">
          <div
            className="text-[38px] md:text-[44px] font-black leading-none tabular-nums"
            style={{ color: isActive ? '#000' : '#e0e0e0' }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div className={`text-[10px] tracking-[0.2em] uppercase font-bold mt-0.5 ${isActive ? 'text-black' : 'text-gray-400'}`}>
            {outfit.dayEn}
          </div>
          <div className="text-xs text-gray-400">{outfit.day}</div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-200 shrink-0" />

        {/* Theme & mood */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm md:text-base font-bold ${isActive ? '' : 'text-gray-600'}`}>
              {outfit.theme}
            </span>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full tracking-wide">
              {outfit.mood}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 clamp-1 hidden md:block">{outfit.stylingTip}</p>
        </div>

        {/* Weather badge */}
        {weatherDay && (
          <div className="shrink-0 flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1 border border-gray-100">
            <span className="text-base sm:text-lg leading-none">{weatherDay.icon}</span>
            <span className="text-[9px] font-bold text-gray-500">{weatherDay.tempMax}°/{weatherDay.tempMin}°</span>
            <span className="text-[8px] text-gray-400 hidden sm:block">{weatherDay.conditionJa}</span>
          </div>
        )}

        {/* Stats */}
        <div className="shrink-0 text-right">
          <div className="text-[9px] sm:text-xs text-gray-400 tracking-wider uppercase">Total</div>
          <div className="text-sm sm:text-base font-black">¥{total.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400">{outfit.items.length} items</div>
        </div>

        {/* Toggle icon */}
        <div
          className={`shrink-0 w-8 h-8 border flex items-center justify-center transition-all duration-300
            ${isActive ? 'bg-black text-white border-black rotate-45' : 'border-gray-300 text-gray-400 hover:border-black hover:text-black'}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
      </button>

      {/* ── Expanded content ── */}
      {isActive && (
        <div className="px-5 md:px-8 pb-8 anim-fade-up">
          {/* Styling tip mobile */}
          <p className="text-xs text-gray-500 italic mb-5 md:hidden">{outfit.stylingTip}</p>

          {/* Weather detail */}
          {weatherDay && (
            <div className="mb-5 flex items-center gap-3 p-3 bg-gray-50 border border-gray-100">
              <span className="text-2xl leading-none shrink-0">{weatherDay.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-black">
                  {weatherDay.conditionJa} · {weatherDay.tempMin}°〜{weatherDay.tempMax}°C
                  {weatherDay.precipProb > 20 && <span className="ml-2 text-blue-500">☂ {weatherDay.precipProb}%</span>}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5 truncate">{weatherDay.outfitAdvice}</div>
              </div>
            </div>
          )}

          {/* Color palette preview */}
          <div className="flex items-center gap-2 mb-6">
            <span className="section-label">カラーパレット</span>
            <div className="flex gap-1.5 ml-2">
              {outfit.items.map((item, i) => (
                <div
                  key={i}
                  title={`${item.category}: ${item.color}`}
                  className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-gray-200"
                  style={{ backgroundColor: item.imageColor }}
                />
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {outfit.items.map((item, i) => (
              <ProductCard key={i} item={item} index={i} />
            ))}
          </div>

          {/* Total row */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="section-label">このコーデの合計</span>
                <span className="text-xl font-black ml-4">¥{total.toLocaleString()}</span>
              </div>
              {/* Store buttons */}
              <div className="flex flex-wrap gap-2">
                {STORES.map((store) => (
                  <a
                    key={store.id}
                    href={store.buildUrl(outfit.theme)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider border transition-all duration-150 hover:opacity-80"
                    style={{ backgroundColor: store.bg, color: store.text, borderColor: store.bg }}
                  >
                    {store.shortName}
                    <svg className="w-2.5 h-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Affiliated shop products */}
          <ShopProductsPanel
            categories={outfit.items.map((i) => i.category) as ItemCategory[]}
          />

        </div>
      )}
    </div>
  )
}
