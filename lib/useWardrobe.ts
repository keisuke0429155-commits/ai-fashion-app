'use client'

import { useEffect, useState } from 'react'
import { WardrobeItem } from '@/types'

const KEY = 'ai_stylist_wardrobe_v1'

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setReady(true)
  }, [])

  const persist = (next: WardrobeItem[]) => {
    setItems(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const addItem = (draft: Omit<WardrobeItem, 'id' | 'addedAt'>) => {
    const item: WardrobeItem = {
      ...draft,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      addedAt: new Date().toISOString(),
    }
    persist([...items, item])
    return item
  }

  const removeItem = (id: string) => persist(items.filter((i) => i.id !== id))

  const updateItem = (id: string, patch: Partial<WardrobeItem>) => {
    persist(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  return { items, ready, addItem, removeItem, updateItem }
}
