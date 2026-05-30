'use client'

import { useEffect, useState } from 'react'
import { ShopProduct, ItemCategory } from '@/types'
import ClothingIcon from '@/components/ClothingIcon'

interface Props {
  categories: ItemCategory[]  // categories present in today's outfit
}

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

export default function ShopProductsPanel({ categories }: Props) {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loaded,   setLoaded]   = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    fetch('/api/shop/products?all=true')
      .then((r) => r.json())
      .then((data: ShopProduct[]) => {
        const matched = data.filter((p) => categories.includes(p.category))
        setProducts(matched)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [categories.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded || products.length === 0) return null

  // group by shop
  const byShop = products.reduce<Record<string, ShopProduct[]>>((acc, p) => {
    if (!acc[p.shopId]) acc[p.shopId] = []
    acc[p.shopId].push(p)
    return acc
  }, {})

  const shopCount   = Object.keys(byShop).length
  const productCount = products.length

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {Object.values(byShop).slice(0, 3).map((prods) => (
              <div key={prods[0].shopId}
                className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black"
                style={{ backgroundColor: prods[0].shopAccentColor, color: isLight(prods[0].shopAccentColor) ? '#000' : '#fff' }}>
                {prods[0].shopName[0]}
              </div>
            ))}
          </div>
          <div>
            <span className="text-[11px] font-bold">提携ショップのアイテム</span>
            <span className="text-[10px] text-gray-400 ml-2">{shopCount}店舗・{productCount}点</span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-6 anim-fade-up">
          {Object.entries(byShop).map(([, prods]) => {
            const { shopName, shopUrl, shopAccentColor } = prods[0]
            const light = isLight(shopAccentColor)
            return (
              <div key={prods[0].shopId}>
                {/* Shop header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4" style={{ backgroundColor: shopAccentColor }} />
                    <a href={shopUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-black hover:underline transition-all"
                      style={{ color: shopAccentColor }}>
                      {shopName}
                    </a>
                    <span className="text-[9px] text-gray-400 border border-gray-200 px-1.5 py-0.5">提携</span>
                  </div>
                  <a href={shopUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
                    ショップを見る
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>

                {/* Product cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {prods.map((p) => (
                    <a key={p.id} href={p.productUrl} target="_blank" rel="noopener noreferrer"
                      className="group border border-gray-100 hover:border-gray-300 transition-all overflow-hidden">
                      {/* Image area */}
                      <div className="aspect-square flex items-center justify-center relative"
                        style={{ backgroundColor: p.imageColor }}>
                        <ClothingIcon category={p.category} color={isLight(p.imageColor) ? '#333' : '#eee'} size={40} />
                        {/* Shop tag */}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-bold"
                          style={{ backgroundColor: shopAccentColor, color: light ? '#000' : '#fff' }}>
                          {shopName}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-2">
                        <p className="text-[10px] font-bold leading-tight truncate group-hover:underline">{p.name}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{p.category}{p.color ? ` · ${p.color}` : ''}</p>
                        <p className="text-[11px] font-black mt-1">
                          {p.price > 0 ? `¥${p.price.toLocaleString()}` : 'お問合せ'}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
