import type { Metadata } from 'next'
import './globals.css'
import MockBanner from '@/components/MockBanner'
import AuthProvider from '@/components/AuthProvider'
import HeaderUserNav from '@/components/HeaderUserNav'
import MobileNav from '@/components/MobileNav'

const IS_MOCK = !process.env.ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY === 'your_api_key_here'

export const metadata: Metadata = {
  title: 'AI STYLIST — 1週間コーデ自動提案',
  description: 'AIがあなたのスタイルに合わせた1週間のファッションコーデを提案。各アイテムはZOZOTOWNで購入できます。',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const tickerItems = [
  'NEW ARRIVAL', 'AI STYLING', 'WEEKLY COORDINATE', 'POWERED BY CLAUDE',
  'FREE STYLING ADVICE', '7 DAYS PLAN', 'SHOP ON ZOZOTOWN',
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-black">
      <AuthProvider>

        {/* ── Ticker ── */}
        <div className="bg-black text-white h-8 overflow-hidden flex items-center">
          <div className="marquee-track">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i} className="text-[10px] tracking-[0.3em] uppercase px-8 whitespace-nowrap">
                {t} <span className="opacity-30 mx-2">—</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Mock banner ── */}
        {IS_MOCK && <MockBanner />}

        {/* ── Header ── */}
        <header className="border-b border-black sticky top-0 z-50 bg-white">
          <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex gap-0.5">
                <div className="w-3 h-5 bg-black" />
                <div className="w-1 h-5 bg-black" />
              </div>
              <span className="text-[13px] font-black tracking-[0.22em] uppercase">AI Stylist</span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Men',    href: '/?gender=male' },
                { label: 'Women',  href: '/?gender=female' },
                { label: 'Unisex', href: '/?gender=unisex' },
                { label: 'New In', href: '/store' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
                >
                  {label}
                </a>
              ))}
              <a
                href="/skeletal"
                className="text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
              >
                骨格診断
              </a>
              <a
                href="/store"
                className="text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors border border-gray-200 hover:border-black px-2.5 py-1"
              >
                Store
              </a>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              {/* User nav (desktop) */}
              <HeaderUserNav />
              {/* Hamburger + drawer (mobile) */}
              <MobileNav />
            </div>
          </div>
        </header>

          <main>{children}</main>

        {/* ── Footer ── */}
        <footer className="border-t border-black mt-24 bg-black text-white">
          <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  <div className="w-3 h-5 bg-white" />
                  <div className="w-1 h-5 bg-white" />
                </div>
                <span className="text-[13px] font-black tracking-[0.22em] uppercase">AI Stylist</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                AIがあなたのスタイルを分析し、<br />1週間分のコーデを自動提案。
              </p>
            </div>
            {[
              { title: 'Service', links: [
                { label: 'スタイル診断', href: '/skeletal' },
                { label: 'コーデ提案',  href: '/' },
                { label: 'ブランド一覧', href: '/store' },
              ]},
              { title: 'Style', links: [
                { label: 'メンズ',      href: '/?gender=male' },
                { label: 'レディース',  href: '/?gender=female' },
                { label: 'ユニセックス', href: '/?gender=unisex' },
              ]},
              { title: 'Info', links: [
                { label: '使い方',      href: '/#how-to' },
                { label: 'プライバシー', href: '/privacy' },
                { label: 'お問い合わせ', href: 'mailto:keisuke0429155@gmail.com' },
              ]},
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[10px] tracking-[0.25em] uppercase font-bold mb-4">{title}</p>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-xs text-gray-400 hover:text-white transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 py-5">
            <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[10px] tracking-widest uppercase text-gray-500">© 2026 AI Stylist</span>
              <span className="text-[10px] text-gray-500">Powered by Claude AI (Anthropic)</span>
            </div>
          </div>
        </footer>

      </AuthProvider>
      </body>
    </html>
  )
}
