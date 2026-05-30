'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'

const IS_GOOGLE_ENABLED = !!(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
)

interface Props {
  onClose: () => void
}

type Tab = 'login' | 'register'

export default function LoginModal({ onClose }: Props) {
  const [tab, setTab]           = useState<Tab>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const overlayRef              = useRef<HTMLDivElement>(null)

  // close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn('credentials', {
      email, password, redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('メールアドレスまたはパスワードが違います')
    } else {
      onClose()
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }

      // auto-login after register
      const result = await signIn('credentials', { email, password, redirect: false })
      setLoading(false)
      if (result?.error) {
        setError('登録は完了しましたが、ログインに失敗しました。ログインタブからお試しください。')
      } else {
        onClose()
      }
    } catch {
      setError('ネットワークエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-md anim-scale-in">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5">
              <div className="w-2.5 h-4 bg-black" />
              <div className="w-1 h-4 bg-black" />
            </div>
            <span className="text-[12px] font-black tracking-[0.2em] uppercase">AI Stylist</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className={`flex-1 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all border-b-2 ${
                tab === t ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'login' ? 'ログイン' : '新規登録'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="p-6 space-y-4">

          {/* Google OAuth */}
          {IS_GOOGLE_ENABLED && (
            <>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Googleでログイン
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 tracking-widest uppercase">または</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          {tab === 'register' && (
            <div>
              <label className="section-label block mb-1.5">お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                required
                className="input-base w-full"
              />
            </div>
          )}

          <div>
            <label className="section-label block mb-1.5">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'register' ? '6文字以上' : '••••••••'}
              required
              minLength={6}
              className="input-base w-full"
            />
          </div>

          {error && (
            <div className="border border-red-300 bg-red-50 px-3 py-2.5">
              <p className="text-[11px] text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? '処理中...'
              : tab === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>

          <p className="text-center text-[10px] text-gray-400">
            {tab === 'login'
              ? <>アカウントをお持ちでない方は<button type="button" onClick={() => { setTab('register'); setError(null) }} className="text-black font-bold underline">新規登録</button></>
              : <>すでにアカウントをお持ちの方は<button type="button" onClick={() => { setTab('login'); setError(null) }} className="text-black font-bold underline">ログイン</button></>
            }
          </p>

        </form>
      </div>
    </div>
  )
}
