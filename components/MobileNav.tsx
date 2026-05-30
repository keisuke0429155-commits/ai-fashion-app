'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  // close on route change (body scroll lock)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLoginClick = () => {
    setOpen(false)
    window.dispatchEvent(new CustomEvent('show-login'))
  }

  const links = [
    { href: '/',          label: 'Home',    sub: '週コーデ生成' },
    { href: '/skeletal',  label: '骨格診断', sub: 'Body Frame Analysis' },
    { href: '/store',     label: 'Store',   sub: '出店・商品登録' },
  ]

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-1.5 md:hidden p-2 -mr-1 touch-manipulation"
        aria-label="メニューを開く"
      >
        <span className="block w-5 h-px bg-black" />
        <span className="block w-5 h-px bg-black" />
        <span className="block w-3 h-px bg-black" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[80] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white z-[90] flex flex-col md:hidden transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-2.5 h-4 bg-black" />
              <div className="w-1 h-4 bg-black" />
            </div>
            <span className="text-[12px] font-black tracking-[0.2em] uppercase">AI Stylist</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {links.map(({ href, label, sub }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              <div>
                <p className="text-sm font-bold">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 tracking-wider">{sub}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>
          ))}
        </nav>

        {/* User section */}
        <div className="p-5 border-t border-gray-100 safe-area-pb">
          {session ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[12px] font-black shrink-0">
                  {(session.user?.name ?? session.user?.email ?? '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{session.user?.name ?? 'User'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{session.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); signOut() }}
                className="w-full py-3 btn-outline text-xs"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className="w-full py-3.5 btn-primary"
            >
              ログイン / 新規登録
            </button>
          )}
        </div>
      </div>
    </>
  )
}
