export interface Store {
  id: string
  name: string
  shortName: string
  bg: string
  text: string
  buildUrl: (query: string) => string
}

export const STORES: Store[] = [
  {
    id: 'zozo',
    name: 'ZOZOTOWN',
    shortName: 'ZOZO',
    bg: '#111111',
    text: '#ffffff',
    buildUrl: (q) => `https://zozo.jp/search/?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'rakuten',
    name: '楽天ファッション',
    shortName: '楽天',
    bg: '#BF0000',
    text: '#ffffff',
    buildUrl: (q) =>
      `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(q)}/-/`,
  },
  {
    id: 'amazon',
    name: 'Amazon Fashion',
    shortName: 'Amazon',
    bg: '#FF9900',
    text: '#111111',
    buildUrl: (q) =>
      `https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}&i=fashion`,
  },
  {
    id: 'magaseek',
    name: 'MAGASEEK',
    shortName: 'MAGASEEK',
    bg: '#1565C0',
    text: '#ffffff',
    buildUrl: (q) =>
      `https://www.magaseek.com/search/index/p_keywordss/${encodeURIComponent(q)}`,
  },
  {
    id: 'shoplist',
    name: 'SHOPLIST',
    shortName: 'SHOPLIST',
    bg: '#D81B60',
    text: '#ffffff',
    buildUrl: (q) => `https://shoplist.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'uniqlo',
    name: 'UNIQLO',
    shortName: 'UNIQLO',
    bg: '#E60012',
    text: '#ffffff',
    buildUrl: (q) =>
      `https://www.uniqlo.com/jp/ja/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'wear',
    name: 'wear（WEGO）',
    shortName: 'wear',
    bg: '#222222',
    text: '#ffffff',
    buildUrl: (q) =>
      `https://wear.jp/search/?q=${encodeURIComponent(q)}`,
  },
]
