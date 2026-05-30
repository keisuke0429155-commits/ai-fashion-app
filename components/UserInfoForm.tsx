'use client'

import { UserProfile, Gender, BodyType, Occasion, FashionStyle, ColorPalette, FitPreference } from '@/types'

interface Props {
  profile: UserProfile
  onChange: (profile: UserProfile) => void
}

const styleGroups: { label: string; en: string; items: { id: FashionStyle; ja: string; en: string; desc: string }[] }[] = [
  {
    label: 'ベーシック', en: 'Basic',
    items: [
      { id: 'casual',   ja: 'カジュアル',      en: 'Casual',    desc: '日常的でリラックスした着こなし' },
      { id: 'minimal',  ja: 'ミニマル',        en: 'Minimal',   desc: 'シンプルで洗練されたスタイル' },
      { id: 'classic',  ja: 'クラシック',      en: 'Classic',   desc: 'タイムレスで品のある定番スタイル' },
      { id: 'normcore', ja: 'ノームコア',      en: 'Normcore',  desc: '意図的に普通を追求したスタイル' },
      { id: 'natural',  ja: 'ナチュラル',      en: 'Natural',   desc: '自然素材とアースカラーの着こなし' },
      { id: 'clean',    ja: 'クリーン',        en: 'Clean',     desc: '清潔感あふれるシンプルな着こなし' },
    ],
  },
  {
    label: 'トレンド', en: 'Trend',
    items: [
      { id: 'korean',      ja: '韓国系',         en: 'K-Fashion',   desc: 'トレンド感ある韓国発スタイル' },
      { id: 'y2k',         ja: 'Y2K',            en: 'Y2K',         desc: '2000年代のポップでレトロな着こなし' },
      { id: 'old-money',   ja: 'オールドマネー', en: 'Old Money',   desc: '上品なクラシックと静かなエレガンス' },
      { id: 'balletcore',  ja: 'バレエコア',     en: 'Balletcore',  desc: 'バレリーナにインスパイアされた優雅スタイル' },
      { id: 'cottagecore', ja: 'コテージコア',   en: 'Cottagecore', desc: '田舎風ロマンティック＆自然派スタイル' },
      { id: 'dark',        ja: 'ダーク系',        en: 'Dark Mode',   desc: 'ダークカラーとエッジで作るモードスタイル' },
    ],
  },
  {
    label: 'フェミニン / エレガント', en: 'Feminine',
    items: [
      { id: 'feminine',  ja: 'フェミニン',      en: 'Feminine',  desc: '女性らしいエレガントなスタイル' },
      { id: 'romantic',  ja: 'ロマンティック',  en: 'Romantic',  desc: 'レースやフリルで作る甘くやわらかなスタイル' },
      { id: 'bohemian',  ja: 'ボヘミアン',      en: 'Bohemian',  desc: 'フリーで芸術的なエスニックミックス' },
      { id: 'luxury',    ja: 'ラグジュアリー',  en: 'Luxury',    desc: '上質な素材とハイブランドの着こなし' },
      { id: 'mode',      ja: 'モード',          en: 'Mode',      desc: '先鋭的でアヴァンギャルドなファッション' },
    ],
  },
  {
    label: 'アクティブ / アウトドア', en: 'Active',
    items: [
      { id: 'sporty',   ja: 'スポーティ',      en: 'Sporty',    desc: 'アクティブでスポーツミックス' },
      { id: 'gorpcore', ja: 'ゴープコア',      en: 'Gorpcore',  desc: 'アウトドアギアをタウンに落とし込む' },
      { id: 'techwear', ja: 'テックウェア',    en: 'Techwear',  desc: '機能素材とフューチャリスティックな形' },
      { id: 'military', ja: 'ミリタリー',      en: 'Military',  desc: 'カーゴ・MA-1など軍モチーフのタフスタイル' },
      { id: 'surf',     ja: 'サーフ',          en: 'Surf',      desc: '海・夏をルーツにしたリラックスカジュアル' },
    ],
  },
  {
    label: 'エッジ / カルチャー', en: 'Edge',
    items: [
      { id: 'street',   ja: 'ストリート',      en: 'Street',    desc: 'アーバンでエッジの利いた着こなし' },
      { id: 'vintage',  ja: 'ヴィンテージ',    en: 'Vintage',   desc: 'レトロなエレメントを取り入れた着こなし' },
      { id: 'preppy',   ja: 'プレッピー',      en: 'Preppy',    desc: 'アイビーリーグ発の知的でクリーンなスタイル' },
      { id: 'punk',     ja: 'パンク',          en: 'Punk',      desc: 'ロックにインスパイアされた反骨スタイル' },
      { id: 'skate',    ja: 'スケート',        en: 'Skate',     desc: 'スケートボードカルチャー発のルーズスタイル' },
      { id: 'amekaji',  ja: 'アメカジ',        en: 'Ame-Kaji',  desc: 'デニム・チェック・ワークブーツの王道アメリカン' },
    ],
  },
  {
    label: 'ワーク / ユニーク', en: 'Work',
    items: [
      { id: 'office',   ja: 'オフィス',        en: 'Office',    desc: 'きちんと感のあるビジネスカジュアル' },
      { id: 'workwear', ja: 'ワークウェア',    en: 'Workwear',  desc: '作業服をルーツにしたタフなスタイル' },
      { id: 'harajuku', ja: '原宿系',          en: 'Harajuku',  desc: '個性とポップが爆発する日本発ストリート' },
    ],
  },
]

// フラットな配列（既存ロジックとの互換のため）
const styles = styleGroups.flatMap((g) => g.items)

const colorOptions: { id: ColorPalette; ja: string; swatch: string; textDark: boolean }[] = [
  { id: 'monotone', ja: 'モノトーン',   swatch: 'linear-gradient(135deg,#fff 50%,#000 50%)', textDark: true  },
  { id: 'white',    ja: 'ホワイト系',   swatch: '#F8F8F8',  textDark: true  },
  { id: 'black',    ja: 'ブラック系',   swatch: '#111111',  textDark: false },
  { id: 'gray',     ja: 'グレー系',     swatch: '#9E9E9E',  textDark: false },
  { id: 'navy',     ja: 'ネイビー系',   swatch: '#1A237E',  textDark: false },
  { id: 'blue',     ja: 'ブルー系',     swatch: '#1565C0',  textDark: false },
  { id: 'green',    ja: 'グリーン系',   swatch: '#2E7D32',  textDark: false },
  { id: 'olive',    ja: 'オリーブ系',   swatch: '#6B7C50',  textDark: false },
  { id: 'brown',    ja: 'ブラウン系',   swatch: '#795548',  textDark: false },
  { id: 'beige',    ja: 'ベージュ系',   swatch: '#C8A882',  textDark: true  },
  { id: 'red',      ja: 'レッド系',     swatch: '#C62828',  textDark: false },
  { id: 'pink',     ja: 'ピンク系',     swatch: '#E91E8C',  textDark: false },
  { id: 'burgundy', ja: 'バーガンディ', swatch: '#6D1A36',  textDark: false },
  { id: 'pastel',   ja: 'パステル',     swatch: 'linear-gradient(135deg,#FFD1DC 33%,#B5EAD7 66%,#C7CEEA 100%)', textDark: true },
  { id: 'vivid',    ja: 'ビビッド',     swatch: 'linear-gradient(135deg,#FF4081 25%,#FFEB3B 50%,#00BCD4 75%)', textDark: false },
]

const fitOptions: { id: FitPreference; ja: string; en: string; desc: string; icon: string }[] = [
  { id: 'tight',    ja: 'タイト',       en: 'Tight',    desc: '体のラインに沿ったフィット感',       icon: '▮'  },
  { id: 'regular',  ja: 'レギュラー',   en: 'Regular',  desc: '標準的なシルエット',                 icon: '▰'  },
  { id: 'relaxed',  ja: 'リラックス',   en: 'Relaxed',  desc: 'ゆったりとした楽な着心地',           icon: '▱'  },
  { id: 'oversized',ja: 'オーバーサイズ',en:'Oversized', desc: '大きめシルエットでこなれ感',         icon: '□'  },
  { id: 'wide',     ja: 'ワイド',       en: 'Wide',     desc: 'ボトムを中心とした広がりのあるシルエット', icon: '▽' },
]

const occasionGroups: { label: string; en: string; items: { id: Occasion; ja: string; en: string }[] }[] = [
  {
    label: 'デイリー', en: 'Daily',
    items: [
      { id: 'casual',   ja: 'カジュアル',     en: 'Casual'   },
      { id: 'shopping', ja: 'ショッピング',   en: 'Shopping' },
      { id: 'cafe',     ja: 'カフェ・ランチ', en: 'Café'     },
    ],
  },
  {
    label: 'ソーシャル', en: 'Social',
    items: [
      { id: 'date',     ja: 'デート',           en: 'Date'     },
      { id: 'party',    ja: '飲み会・パーティー', en: 'Party'    },
      { id: 'festival', ja: 'フェス・ライブ',    en: 'Festival' },
    ],
  },
  {
    label: 'アクティブ', en: 'Active',
    items: [
      { id: 'outdoor',  ja: 'アウトドア',    en: 'Outdoor' },
      { id: 'sport',    ja: 'スポーツ・ジム', en: 'Sport'   },
      { id: 'travel',   ja: '旅行・観光',    en: 'Travel'  },
    ],
  },
  {
    label: 'フォーマル', en: 'Formal',
    items: [
      { id: 'office',  ja: 'オフィス',  en: 'Office'  },
      { id: 'formal',  ja: 'フォーマル', en: 'Formal' },
      { id: 'wedding', ja: '結婚式',    en: 'Wedding' },
    ],
  },
]

export default function UserInfoForm({ profile, onChange }: Props) {
  const set = (key: keyof UserProfile, value: unknown) => onChange({ ...profile, [key]: value })

  const toggleStyle = (id: FashionStyle) => {
    const cur = profile.styles
    if (cur.includes(id)) set('styles', cur.filter((s) => s !== id))
    else if (cur.length < 3) set('styles', [...cur, id])
  }

  const toggleOccasion = (id: Occasion) => {
    const cur = profile.occasion
    set('occasion', cur.includes(id) ? cur.filter((o) => o !== id) : [...cur, id])
  }

  const toggleColor = (id: ColorPalette) => {
    const cur = profile.colors
    set('colors', cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id])
  }

  return (
    <div className="space-y-12">

      {/* ── 01 Basic Info ── */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-black text-gray-200 tabular-nums">01</span>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Basic Info</h3>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="space-y-5">
          {/* Gender */}
          <div>
            <label className="section-label block mb-3">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {([['male','MEN'],['female','WOMEN'],['unisex','UNISEX']] as [Gender,string][]).map(([v,l]) => (
                <button key={v} onClick={() => set('gender', v)}
                  className={`py-3 text-xs tracking-widest chip ${profile.gender===v ? 'chip-active' : 'chip-inactive'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Age / Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-3">Age</label>
              <input type="number" value={profile.age} min={10} max={80} placeholder="25"
                onChange={(e) => set('age', e.target.value)}
                className="input-base" />
            </div>
            <div>
              <label className="section-label block mb-3">Height (cm)</label>
              <input type="number" value={profile.height} min={140} max={220} placeholder="170"
                onChange={(e) => set('height', e.target.value)}
                className="input-base" />
            </div>
          </div>

          {/* Body type */}
          <div>
            <label className="section-label block mb-3">Body Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([['slim','スリム'],['standard','標準'],['athletic','マッチョ'],['plus','ぽっちゃり']] as [BodyType,string][]).map(([v,l]) => (
                <button key={v} onClick={() => set('bodyType', v)}
                  className={`py-3 text-[11px] chip ${profile.bodyType===v ? 'chip-active' : 'chip-inactive'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 Budget ── */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-black text-gray-200 tabular-nums">02</span>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Budget per Item</h3>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {([['low','〜¥5,000','プチプライス'],['mid','¥5,000〜15,000','ミドルレンジ'],['high','¥15,000〜','ハイエンド']] as ['low'|'mid'|'high',string,string][]).map(([v,price,label]) => (
            <button key={v} onClick={() => set('budget', v)}
              className={`py-4 px-3 text-left border transition-all duration-150 ${profile.budget===v ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-500'}`}>
              <div className={`text-[10px] font-bold tracking-wider ${profile.budget===v ? 'text-gray-300' : 'text-gray-400'}`}>{label}</div>
              <div className="text-xs font-bold mt-0.5">{price}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 03 Occasion ── */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-black text-gray-200 tabular-nums">03</span>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Occasion</h3>
          <span className="text-[10px] text-gray-400 ml-1">複数可</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="space-y-4">
          {occasionGroups.map((group) => (
            <div key={group.en}>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-2">
                {group.label} <span className="text-gray-200">/ {group.en}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map(({ id, ja, en }) => (
                  <button
                    key={id}
                    onClick={() => toggleOccasion(id)}
                    className={`chip ${profile.occasion.includes(id) ? 'chip-active' : 'chip-inactive'}`}
                  >
                    <span>{ja}</span>
                    <span className={`ml-1.5 ${profile.occasion.includes(id) ? 'text-gray-400' : 'text-gray-300'}`}>{en}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 04 Style ── */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-black text-gray-200 tabular-nums">04</span>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Style Preference</h3>
          <span className="text-[10px] text-gray-400 ml-1">最大3つ</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="space-y-5">
          {styleGroups.map(({ label, en, items }) => (
            <div key={label}>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-2">
                {label} <span className="text-gray-200">/ {en}</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {items.map(({ id, ja, en, desc }) => {
                  const selected = profile.styles.includes(id)
                  const disabled = !selected && profile.styles.length >= 3
                  return (
                    <button
                      key={id}
                      onClick={() => toggleStyle(id)}
                      disabled={disabled}
                      title={desc}
                      className={`py-3 px-3 text-left border transition-all duration-150 relative
                        ${selected ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-500'}
                        ${disabled ? 'opacity-25 cursor-not-allowed' : ''}`}
                    >
                      {selected && (
                        <div className="absolute top-1.5 right-1.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      )}
                      <div className="text-[11px] font-bold leading-tight">{ja}</div>
                      <div className={`text-[9px] mt-0.5 tracking-wider ${selected ? 'text-gray-400' : 'text-gray-400'}`}>{en}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {profile.styles.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-gray-400">選択済み:</span>
            {profile.styles.map((s) => {
              const found = styles.find((st) => st.id === s)
              return (
                <span key={s} className="text-[10px] bg-black text-white px-2 py-0.5 font-medium">
                  {found?.ja}
                </span>
              )
            })}
            <span className="text-[10px] text-gray-400">({profile.styles.length}/3)</span>
          </div>
        )}
      </section>

      {/* ── 05 Color ── */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-black text-gray-200 tabular-nums">05</span>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Color Palette</h3>
          <span className="text-[10px] text-gray-400 ml-1">複数可</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {colorOptions.map(({ id, ja, swatch, textDark }) => {
            const selected = profile.colors.includes(id)
            return (
              <button
                key={id}
                onClick={() => toggleColor(id)}
                className={`relative overflow-hidden border-2 transition-all duration-150 aspect-[4/3] flex flex-col items-center justify-end pb-2
                  ${selected ? 'border-black shadow-[2px_2px_0_0_#000]' : 'border-transparent hover:border-gray-300'}`}
              >
                {/* swatch background */}
                <div
                  className="absolute inset-0"
                  style={{ background: swatch }}
                />
                {/* checkmark */}
                {selected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-black rounded-full flex items-center justify-center z-10">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
                {/* label */}
                <span
                  className="relative z-10 text-[10px] font-bold px-1 py-0.5 leading-tight text-center"
                  style={{
                    color: textDark ? '#111' : '#fff',
                    textShadow: textDark ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {ja}
                </span>
              </button>
            )
          })}
        </div>

        {profile.colors.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[10px] text-gray-400">選択中:</span>
            {profile.colors.map((c) => {
              const opt = colorOptions.find((o) => o.id === c)
              return (
                <span key={c} className="text-[10px] border border-gray-300 text-gray-600 px-2 py-0.5">
                  {opt?.ja}
                </span>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 06 Fit ── */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-black text-gray-200 tabular-nums">06</span>
          <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Silhouette / Fit</h3>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {fitOptions.map(({ id, ja, en, desc }) => {
            const selected = profile.fit === id
            return (
              <button
                key={id}
                onClick={() => set('fit', id)}
                title={desc}
                className={`py-4 px-2 flex flex-col items-center gap-2 border transition-all duration-150
                  ${selected ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-500'}`}
              >
                {/* Silhouette SVG */}
                <SilhouetteIcon fit={id} active={selected} />
                <div className="text-[10px] font-bold leading-tight text-center">{ja}</div>
                <div className={`text-[9px] tracking-wider ${selected ? 'text-gray-400' : 'text-gray-400'}`}>{en}</div>
              </button>
            )
          })}
        </div>

        <p className="text-[10px] text-gray-400 mt-3">
          {fitOptions.find((f) => f.id === profile.fit)?.desc}
        </p>
      </section>

    </div>
  )
}

function SilhouetteIcon({ fit, active }: { fit: FitPreference; active: boolean }) {
  const color = active ? '#fff' : '#9E9E9E'
  const shapes: Record<FitPreference, JSX.Element> = {
    tight: (
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M10 2 C10 2 9 6 9 18 C9 28 10 34 10 34 L18 34 C18 34 19 28 19 18 C19 6 18 2 18 2 Z" fill={color}/>
        <path d="M5 2 L10 2 L9 8 L7 6 Z M23 2 L18 2 L19 8 L21 6 Z" fill={color} opacity="0.6"/>
      </svg>
    ),
    regular: (
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M9 2 C9 2 7 6 7 18 C7 28 9 34 9 34 L19 34 C19 34 21 28 21 18 C21 6 19 2 19 2 Z" fill={color}/>
        <path d="M4 2 L9 2 L7 8 L5 6 Z M24 2 L19 2 L21 8 L23 6 Z" fill={color} opacity="0.6"/>
      </svg>
    ),
    relaxed: (
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M8 2 C8 2 5 6 5 18 C5 28 8 34 8 34 L20 34 C20 34 23 28 23 18 C23 6 20 2 20 2 Z" fill={color}/>
        <path d="M3 2 L8 2 L5 8 L3 6 Z M25 2 L20 2 L23 8 L25 6 Z" fill={color} opacity="0.6"/>
      </svg>
    ),
    oversized: (
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M7 2 C7 2 3 6 3 16 C3 24 6 34 6 34 L22 34 C22 34 25 24 25 16 C25 6 21 2 21 2 Z" fill={color}/>
        <path d="M1 2 L7 2 L3 8 L1 7 Z M27 2 L21 2 L25 8 L27 7 Z" fill={color} opacity="0.6"/>
      </svg>
    ),
    wide: (
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M10 2 L8 2 L5 34 L13 34 Z" fill={color}/>
        <path d="M18 2 L20 2 L23 34 L15 34 Z" fill={color}/>
        <rect x="8" y="2" width="12" height="5" fill={color} opacity="0.6"/>
      </svg>
    ),
  }
  return shapes[fit]
}
