'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import LoginModal from './LoginModal'

export default function HeaderUserNav() {
  const { data: session, status } = useSession()
  const [showModal, setShowModal]   = useState(false)
  const [showMenu, setShowMenu]     = useState(false)
  const menuRef                     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (status === 'loading') {
    return <div className="w-7 h-7 bg-gray-100 rounded-full animate-pulse" />
  }

  if (!session) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="text-[11px] font-bold tracking-widest uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
        >
          LOGIN
        </button>
        {showModal && <LoginModal onClose={() => setShowModal(false)} />}
      </>
    )
  }

  const initial = (session.user?.name ?? session.user?.email ?? '?')[0].toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="flex items-center gap-2 group"
      >
        {/* Avatar */}
        <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[11px] font-black">
          {initial}
        </div>
        <span className="hidden md:block text-[11px] font-medium text-gray-700 group-hover:text-black transition-colors max-w-[100px] truncate">
          {session.user?.name ?? session.user?.email}
        </span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50 anim-fade-up">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[11px] font-bold truncate">{session.user?.name}</p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">{session.user?.email}</p>
          </div>
          <button
            onClick={() => { setShowMenu(false); signOut({ callbackUrl: '/' }) }}
            className="w-full text-left px-4 py-3 text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            ログアウト
          </button>
        </div>
      )}
    </div>
  )
}
