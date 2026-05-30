'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import LoginModal from '@/components/LoginModal'
import UserInfoForm from '@/components/UserInfoForm'
import WardrobeSection from '@/components/WardrobeSection'
import TrendSection from '@/components/TrendSection'
import WeatherWidget from '@/components/WeatherWidget'
import WeeklyOutfitResult from '@/components/WeeklyOutfitResult'
import LoadingScreen from '@/components/LoadingScreen'
import { UserProfile, WeeklyOutfitPlan, BodyFrameType } from '@/types'
import { useWardrobe } from '@/lib/useWardrobe'
import { WeatherData } from '@/lib/weather'

const defaultProfile: UserProfile = {
  gender: 'male',
  age: '25',
  bodyType: 'standard',
  height: '170',
  occasion: ['casual' as const],
  styles: ['minimal'],
  budget: 'mid',
  colors: ['monotone'],
  fit: 'regular',
  useWardrobe: false,
  selectedTrends: [],
  useWeather: false,
}

type Step = 'input' | 'loading' | 'result'

export default function Home() {
  const { data: session } = useSession()
  const [step, setStep]           = useState<Step>('input')
  const [profile, setProfile]     = useState<UserProfile>(defaultProfile)
  const [plan, setPlan]           = useState<WeeklyOutfitPlan | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [weatherData, setWeather] = useState<WeatherData | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [bodyFrameType, setBodyFrameType] = useState<BodyFrameType | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const profileFetchedRef         = useRef(false)
  const wardrobe                  = useWardrobe()

  // ── mount: localStorage からプロフィール・骨格タイプを復元 ──────────────
  useEffect(() => {
    // 保存済みプロフィール（空配列でデフォルトを上書きしないよう防御マージ）
    const savedProfile = localStorage.getItem('ai_stylist_profile')
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setProfile((p) => ({
          ...p,
          ...parsed,
          styles:  parsed.styles?.length  > 0 ? parsed.styles  : p.styles,
          occasion: parsed.occasion?.length > 0 ? parsed.occasion : p.occasion,
          colors:  parsed.colors?.length  > 0 ? parsed.colors  : p.colors,
        }))
      } catch {}
    }
    // 骨格タイプ
    const storedFrame = localStorage.getItem('ai_stylist_body_frame_type') as BodyFrameType | null
    if (storedFrame) {
      setBodyFrameType(storedFrame)
      setProfile((p) => ({ ...p, bodyFrameType: storedFrame }))
    }
    // URL パラメータから性別を設定
    const params = new URLSearchParams(window.location.search)
    const gender = params.get('gender')
    if (gender === 'male' || gender === 'female' || gender === 'unisex') {
      setProfile((p) => ({ ...p, gender }))
      setTimeout(() => {
        document.getElementById('style-form')?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    }
    // MobileNav からのログインイベント
    const handler = () => setShowLogin(true)
    window.addEventListener('show-login', handler)
    return () => window.removeEventListener('show-login', handler)
  }, [])

  // ── ログイン時: Supabase からプロフィールを読み込み ─────────────────────
  useEffect(() => {
    if (!session?.user?.email) return
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProfile((p) => ({
            ...p,
            ...data,
            styles:  data.styles?.length  > 0 ? data.styles  : p.styles,
            occasion: data.occasion?.length > 0 ? data.occasion : p.occasion,
            colors:  data.colors?.length  > 0 ? data.colors  : p.colors,
          }))
          localStorage.setItem('ai_stylist_profile', JSON.stringify(data))
        }
      })
      .catch(() => {})
      .finally(() => { profileFetchedRef.current = true })
  }, [session?.user?.email])

  // ── プロフィール変更: localStorage に即時保存 + Supabase に遅延保存 ─────
  useEffect(() => {
    // ephemeral なフィールドは除外して保存
    const { useWeather, selectedTrends, ...toSave } = profile
    localStorage.setItem('ai_stylist_profile', JSON.stringify(toSave))

    if (!session || !profileFetchedRef.current) return
    setSaveStatus('saving')
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSave),
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const isValid = profile.styles.length > 0 && profile.occasion.length > 0 && !!profile.age && !!profile.height

  const handleGenerate = async () => {
    if (!isValid) return
    setError(null)
    setStep('loading')
    try {
      const reqBody = {
        profile,
        wardrobeItems: profile.useWardrobe ? wardrobe.items : [],
        weatherData: profile.useWeather ? weatherData : null,
      }
      const res = await fetch('/api/generate-outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error((d as { error?: string }).error || 'エラーが発生しました')
      }

      // ストリーミングレスポンスを読み込む
      if (!res.body) throw new Error('レスポンスが空です')
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
      }
      text += decoder.decode()

      // JSON 部分を抽出してパース
      const start = text.indexOf('{')
      const end   = text.lastIndexOf('}')
      if (start === -1 || end === -1) throw new Error('レスポンスの形式が不正です')
      const plan: WeeklyOutfitPlan = JSON.parse(text.slice(start, end + 1))
      setPlan(plan)
      setStep('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
      setStep('input')
    }
  }

  if (step === 'loading') return <LoadingScreen />
  if (step === 'result' && plan) return (
    <WeeklyOutfitResult
      plan={plan}
      weatherData={profile.useWeather ? weatherData : null}
      onReset={() => { setPlan(null); setStep('input') }}
    />
  )

  const wardrobeCount = wardrobe.items.length

  return (
    <div className="anim-fade-in">

      {/* ── Hero ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-4">AI-Powered Fashion Styling</p>
              <h1 className="text-5xl md:text-[68px] font-black leading-[0.9] tracking-tight">
                WEEKLY<br />
                <span style={{ WebkitTextStroke: '2px #000', color: 'transparent' }}>STYLE</span><br />
                PLAN
              </h1>
              <p className="mt-6 text-sm text-gray-500 max-w-sm leading-relaxed">
                あなたの体型・好み・予算をもとに Claude AI が 1 週間分のコーディネートを自動生成。
                持っている服を登録してコーデに組み込むことも可能です。
              </p>
              <div className="flex items-center gap-6 mt-8">
                {[['7', 'Days Plan'], ['20+', 'Styles'], [wardrobeCount > 0 ? String(wardrobeCount) : '∞', 'My Closet']].map(([v, l]) => (
                  <div key={l}>
                    <div className="text-xl font-black">{v}</div>
                    <div className="text-[10px] text-gray-400 tracking-widest uppercase">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { num: '01', title: 'プロファイル入力', body: '性別・年齢・体型・スタイルを入力' },
                { num: '02', title: 'マイクロゼット', body: '持っている服を登録してコーデに活用' },
                { num: '03', title: 'AI解析', body: 'Claude AIがあなたに合うコーデを生成' },
                { num: '04', title: '即購入可能', body: '7ストアから直接購入できます' },
              ].map(({ num, title, body }) => (
                <div key={num} className="border border-gray-100 p-5 hover:border-black transition-colors">
                  <div className="text-[28px] font-black text-gray-100 leading-none mb-3">{num}</div>
                  <div className="text-xs font-bold mb-1">{title}</div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 px-4 py-3 safe-area-pb">
        <button
          onClick={handleGenerate}
          disabled={!isValid}
          className="w-full py-4 btn-primary text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isValid ? '✦  Generate My Style  ✦' : 'スタイル・シーンを選択してください'}
        </button>
        {profile.useWardrobe && wardrobe.items.length > 0 && (
          <p className="text-[10px] text-emerald-600 text-center mt-1.5 font-medium">
            クロゼットの {wardrobe.items.length} 点を組み込みます
          </p>
        )}
      </div>

      {/* ── Form + Sidebar ── */}
      <div id="style-form" className="max-w-7xl mx-auto px-5 md:px-8 py-12 pb-28 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-16">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-10">

            {/* Weather section */}
            <WeatherWidget
              weatherData={weatherData}
              useWeather={profile.useWeather}
              onToggleUse={(v) => setProfile((p) => ({ ...p, useWeather: v }))}
              onWeatherChange={setWeather}
            />

            {/* SNS Trends section */}
            <TrendSection
              selected={profile.selectedTrends}
              onChange={(ids) => setProfile((p) => ({ ...p, selectedTrends: ids }))}
            />

            {/* Wardrobe section */}
            {wardrobe.ready && (
              <WardrobeSection
                items={wardrobe.items}
                useWardrobe={profile.useWardrobe}
                onToggleUse={(v) => setProfile((p) => ({ ...p, useWardrobe: v }))}
                onAdd={wardrobe.addItem}
                onRemove={wardrobe.removeItem}
              />
            )}

            {/* Profile form */}
            <UserInfoForm profile={profile} onChange={setProfile} />
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-5">

              {/* User greeting */}
              {session && (
                <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 bg-gray-50">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[12px] font-black shrink-0">
                    {(session.user?.name ?? session.user?.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate">{session.user?.name ?? 'User'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{session.user?.email}</p>
                  </div>
                </div>
              )}

              {/* Summary card */}
              <div className="border-2 border-black p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="section-label">Your Profile</p>
                  {session && saveStatus !== 'idle' && (
                    <span className={`text-[10px] tracking-wider transition-all ${saveStatus === 'saved' ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {saveStatus === 'saving' ? '保存中…' : '✓ 保存済み'}
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  {[
                    ['Gender', profile.gender === 'male' ? 'Men' : profile.gender === 'female' ? 'Women' : 'Unisex'],
                    ['Age', profile.age ? `${profile.age}歳` : '—'],
                    ['Height', profile.height ? `${profile.height} cm` : '—'],
                    ['Body', { slim: 'スリム', standard: '標準', athletic: 'マッチョ', plus: 'ぽっちゃり' }[profile.bodyType]],
                    ['Budget', { low: '〜¥5,000', mid: '¥5K〜15K', high: '¥15K〜' }[profile.budget]],
                    ['Fit', profile.fit],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-semibold capitalize">{v}</span>
                    </div>
                  ))}
                </div>

                {profile.styles.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="section-label mb-2">Styles</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.styles.map((s) => (
                        <span key={s} className="text-[10px] bg-black text-white px-2 py-0.5 font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.colors.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="section-label mb-2">Colors</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.colors.map((c) => (
                        <span key={c} className="text-[10px] border border-gray-300 text-gray-600 px-2 py-0.5">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trend status */}
                {profile.selectedTrends.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                      </svg>
                      <span className="text-gray-500">SNS Trends</span>
                    </div>
                    <span className="font-semibold">{profile.selectedTrends.length}件 反映中</span>
                  </div>
                )}

                {/* Weather status */}
                {weatherData && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm leading-none">{weatherData.days[0]?.icon ?? '🌤️'}</span>
                        <span className="text-gray-500">Weather</span>
                      </div>
                      <span className={`font-semibold ${profile.useWeather ? 'text-blue-600' : 'text-gray-400'}`}>
                        {weatherData.city} {profile.useWeather ? '連動中' : '（未使用）'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Wardrobe status */}
                {wardrobeCount > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-500">My Closet</span>
                      </div>
                      <span className={`font-semibold ${profile.useWardrobe ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {wardrobeCount}点 {profile.useWardrobe ? '使用中' : '（未使用）'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Body frame type */}
              <div className="border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="section-label">Body Frame</p>
                  <a
                    href="/skeletal"
                    className="text-[10px] text-gray-400 hover:text-black underline transition-colors"
                  >
                    {bodyFrameType ? '再診断' : '診断する →'}
                  </a>
                </div>
                {bodyFrameType ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-black text-white px-2 py-0.5">
                      {{ straight: 'ストレート', wave: 'ウェーブ', natural: 'ナチュラル' }[bodyFrameType]}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {{ straight: '筋肉質・メリハリ', wave: '柔らか・曲線的', natural: 'フレーム感・個性的' }[bodyFrameType]}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">
                    骨格タイプを診断してコーデ精度を上げましょう
                  </p>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleGenerate}
                disabled={!isValid}
                className="w-full py-5 btn-primary text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isValid ? '✦  Generate My Style  ✦' : 'スタイル・シーンを選択'}
              </button>
              {!session && isValid && (
                <p className="text-[10px] text-gray-400 text-center -mt-1">
                  <button onClick={() => setShowLogin(true)} className="underline hover:text-black">ログイン</button>するとコーデを保存できます
                </p>
              )}
              {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

              {profile.useWardrobe && wardrobeCount > 0 && (
                <p className="text-[10px] text-emerald-600 text-center font-medium">
                  クロゼットの {wardrobeCount} 点を組み込んでコーデを生成します
                </p>
              )}

              {error && (
                <div className="border border-red-400 bg-red-50 p-4">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {[
                  'Claude AIがコーデを生成（約15秒）',
                  '月〜日の7日分を一括提案',
                  '持っている服もコーデに組み込み可',
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[11px] text-gray-400">
                    <span className="text-[9px] font-black text-gray-300 mt-0.5 shrink-0">0{i + 1}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
