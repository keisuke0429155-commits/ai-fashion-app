'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BodyFrameType } from '@/types'

// ── Quiz data ──────────────────────────────────────────────────────────────

const QUESTIONS: {
  id: string
  question: string
  hint: string
  options: { label: string; sub: string; type: BodyFrameType }[]
}[] = [
  {
    id: 'q1',
    question: '鎖骨・首元の特徴',
    hint: '鎖骨に触れてみてください',
    options: [
      { label: '鎖骨が目立たない', sub: '首が太くしっかりしている', type: 'straight' },
      { label: '鎖骨が細く繊細', sub: '首が長め、なで肩気味', type: 'wave' },
      { label: '鎖骨・肩甲骨がくっきり', sub: '骨のフレームが目立つ', type: 'natural' },
    ],
  },
  {
    id: 'q2',
    question: '手首・手の特徴',
    hint: '手首を親指と中指で輪を作ってみてください',
    options: [
      { label: '手のひらが厚くしっかり', sub: '手首は少し太め、関節目立たない', type: 'straight' },
      { label: '手のひらが薄く華奢', sub: '手首が細くしなやか', type: 'wave' },
      { label: '手首の関節が大きい', sub: '指の関節・骨感がはっきり', type: 'natural' },
    ],
  },
  {
    id: 'q3',
    question: '脂肪のつきやすい部位',
    hint: '体重が増えたとき最初に気になる場所は？',
    options: [
      { label: '上半身中心', sub: 'バスト・お腹・背中に先につく', type: 'straight' },
      { label: '下半身中心', sub: '腰・ヒップ・太ももに先につく', type: 'wave' },
      { label: '均一につく', sub: '全体的に変化、または太りにくい', type: 'natural' },
    ],
  },
  {
    id: 'q4',
    question: '体の質感・印象',
    hint: '他の人に言われる体の印象は？',
    options: [
      { label: '筋肉質・ハリがある', sub: '立体的でメリハリのある体型', type: 'straight' },
      { label: '柔らかくふんわり', sub: '曲線的で柔らかな印象', type: 'wave' },
      { label: '骨感・フレーム感がある', sub: 'すらっとして骨格が目立つ', type: 'natural' },
    ],
  },
  {
    id: 'q5',
    question: '膝・脚の特徴',
    hint: 'つま先を前に向けて立ったときの膝の形は？',
    options: [
      { label: '膝が丸くコンパクト', sub: '膝周りが引き締まっている', type: 'straight' },
      { label: '膝が小さく細い', sub: '脚が長く見える', type: 'wave' },
      { label: '膝の関節が大きい', sub: 'すねの骨がはっきりしている', type: 'natural' },
    ],
  },
]

// ── Body frame type details ──────────────────────────────────────────────

const FRAME_DATA: Record<BodyFrameType, {
  nameJa: string
  nameEn: string
  tagline: string
  description: string
  accentColor: string
  bgColor: string
  characteristics: string[]
  bestItems: { icon: string; label: string }[]
  avoidItems: string[]
  bestStyles: string[]
  bestColors: string[]
  tip: string
}> = {
  straight: {
    nameJa: 'ストレート',
    nameEn: 'STRAIGHT',
    tagline: '筋肉質・メリハリ・立体感',
    description: 'ボディラインが立体的でメリハリがある骨格タイプ。筋肉がつきやすく、上半身に重心があります。シンプルで上質なアイテムが最も映え、素材感のよさが際立ちます。',
    accentColor: '#1A1A2E',
    bgColor: '#F0F0F5',
    characteristics: [
      '鎖骨が目立たず首がしっかりしている',
      '筋肉がつきやすく上半身が発達しやすい',
      'バストトップの位置が高め',
      '全体的にハリと弾力がある',
      '膝の形がコンパクト・丸い',
    ],
    bestItems: [
      { icon: '👔', label: 'テーラードジャケット' },
      { icon: '👕', label: 'VネックTシャツ' },
      { icon: '👖', label: 'ストレートデニム' },
      { icon: '🧥', label: 'トレンチコート' },
      { icon: '👟', label: 'シンプルスニーカー' },
    ],
    avoidItems: ['ギャザー・フリルが多いトップス', '厚手のニット・ダウン（上半身が重くなる）', 'ハイウエストのパフスリーブ'],
    bestStyles: ['ミニマル', 'クラシック', 'クリーン', 'オールドマネー'],
    bestColors: ['ホワイト', 'ブラック', 'ネイビー', 'グレー', 'ベージュ'],
    tip: '首元を開けてVネックやUネックを選ぶと、デコルテラインが美しく見えます。素材感のよいシンプルなアイテムが最大の武器になります。',
  },
  wave: {
    nameJa: 'ウェーブ',
    nameEn: 'WAVE',
    tagline: '柔らか・曲線的・フェミニン',
    description: '柔らかく曲線的なボディラインが魅力の骨格タイプ。骨格が細く繊細で、下半身に重心があります。華やかさや女性らしさを引き立てるアイテムが映えます。',
    accentColor: '#6B2D8B',
    bgColor: '#F8F0FF',
    characteristics: [
      '鎖骨が繊細でなで肩気味',
      '下半身（腰・ヒップ）に脂肪がつきやすい',
      'バストトップの位置が低め',
      '骨格が細く柔らかい印象',
      '膝が小さく細い',
    ],
    bestItems: [
      { icon: '👗', label: 'フレアスカート' },
      { icon: '🎀', label: 'フリル・レーストップス' },
      { icon: '👚', label: 'ショート丈ブラウス' },
      { icon: '💍', label: 'ウエストマークアイテム' },
      { icon: '👠', label: 'ヒールのある靴' },
    ],
    avoidItems: ['ビッグシルエットのトップス（上半身が埋もれる）', '厚手・硬い素材', 'ローライズパンツ'],
    bestStyles: ['フェミニン', 'ロマンティック', '韓国系', 'バレエコア'],
    bestColors: ['ピンク', 'ラベンダー', 'ホワイト', 'パステル', 'アイボリー'],
    tip: 'ウエストを細く見せるマーキングが効果的。重心を上に持ってくるために、トップスは短め・ボトムスは少し長めのコーデが◎。',
  },
  natural: {
    nameJa: 'ナチュラル',
    nameEn: 'NATURAL',
    tagline: 'フレーム感・個性的・骨格美',
    description: '骨格やフレームが目立ち、ハンガーのような骨格美が特徴のタイプ。ゆったりとしたシルエットや素材感のある服が映え、個性的なスタイリングも似合います。',
    accentColor: '#1B4332',
    bgColor: '#F0F7F4',
    characteristics: [
      '鎖骨・肩甲骨がくっきりしている',
      '骨格のフレームが大きくしっかりしている',
      '筋肉・脂肪がつきにくい体質のことが多い',
      '関節が大きく骨感がある',
      '膝の関節がはっきりしている',
    ],
    bestItems: [
      { icon: '🧥', label: 'ゆったりコート・ジャケット' },
      { icon: '👕', label: 'オーバーサイズトップス' },
      { icon: '👖', label: 'ワイドパンツ・カーゴパンツ' },
      { icon: '👟', label: 'ボリュームスニーカー' },
      { icon: '🎒', label: 'ビッグバッグ' },
    ],
    avoidItems: ['タイトフィットの服（骨感が強調される）', '細いシルエットのパンツ', '薄手・ペラペラな素材'],
    bestStyles: ['カジュアル', 'ナチュラル', 'ストリート', 'ヴィンテージ', 'アメカジ', 'ゴープコア'],
    bestColors: ['カーキ', 'オリーブ', 'ブラウン', 'ベージュ', 'グリーン', 'ネイビー'],
    tip: '素材感のある服やレイヤードで骨格の個性を活かして。ゆったりシルエットで骨感がほどよく隠れ、こなれ感が出ます。',
  },
}

// ── Main component ──────────────────────────────────────────────────────

type Step = 'quiz' | 'result'

export default function SkeletalPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, BodyFrameType>>({})
  const [step, setStep] = useState<Step>('quiz')
  const [result, setResult] = useState<BodyFrameType | null>(null)
  const [saved, setSaved] = useState(false)
  const [existingType, setExistingType] = useState<BodyFrameType | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ai_stylist_body_frame_type') as BodyFrameType | null
    if (stored) setExistingType(stored)
  }, [])

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined)

  const handleDiagnose = () => {
    const scores: Record<BodyFrameType, number> = { straight: 0, wave: 0, natural: 0 }
    for (const t of Object.values(answers)) scores[t]++
    const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as BodyFrameType
    setResult(winner)
    setStep('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApply = () => {
    if (!result) return
    localStorage.setItem('ai_stylist_body_frame_type', result)
    setSaved(true)
    setTimeout(() => router.push('/'), 800)
  }

  const handleReset = () => {
    setAnswers({})
    setStep('quiz')
    setResult(null)
    setSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (step === 'result' && result) {
    return <ResultView type={result} onApply={handleApply} onReset={handleReset} saved={saved} />
  }

  return (
    <div className="anim-fade-in">
      {/* Hero */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-5 py-14">
          <p className="section-label mb-4">Body Frame Analysis</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
            骨格診断<br />
            <span className="text-base font-normal text-gray-400 tracking-normal">Body Frame Type Test</span>
          </h1>
          <p className="mt-5 text-sm text-gray-500 leading-relaxed max-w-xl">
            5つの質問に答えて、あなたの骨格タイプ（ストレート・ウェーブ・ナチュラル）を診断。
            AIスタイリストがあなたの骨格に最適化されたコーデを提案します。
          </p>

          {existingType && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-500 border border-gray-200 px-3 py-2">
              <span className="text-gray-400">前回の診断：</span>
              <span className="font-bold">{FRAME_DATA[existingType].nameJa}</span>
              <button
                onClick={() => {
                  setResult(existingType)
                  setStep('result')
                }}
                className="ml-2 underline hover:text-black"
              >
                結果を確認
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quiz */}
      <div className="max-w-3xl mx-auto px-5 py-12 space-y-10">

        {QUESTIONS.map((q, qi) => (
          <div key={q.id} className="anim-fade-up">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-[28px] font-black text-gray-100 leading-none tabular-nums shrink-0">
                {String(qi + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-sm font-black">{q.question}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{q.hint}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ml-0 sm:ml-12">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt.type
                return (
                  <button
                    key={opt.type}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.type }))}
                    className={`text-left p-4 border-2 transition-all duration-150
                      ${selected
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400 bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-xs font-bold leading-tight ${selected ? 'text-white' : 'text-black'}`}>
                          {opt.label}
                        </p>
                        <p className={`text-[10px] mt-1 leading-relaxed ${selected ? 'text-gray-300' : 'text-gray-400'}`}>
                          {opt.sub}
                        </p>
                      </div>
                      {selected && (
                        <svg className="w-4 h-4 text-white shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Progress + CTA */}
        <div className="sticky bottom-6 pt-4">
          <div className="bg-white border border-gray-200 shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                {QUESTIONS.map((q) => (
                  <div
                    key={q.id}
                    className={`w-6 h-1.5 transition-colors duration-200 ${answers[q.id] ? 'bg-black' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">{Object.keys(answers).length} / {QUESTIONS.length}</span>
            </div>
            <button
              onClick={handleDiagnose}
              disabled={!allAnswered}
              className="w-full py-4 btn-primary text-[11px] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {allAnswered ? '✦  骨格タイプを診断する  ✦' : `残り ${QUESTIONS.length - Object.keys(answers).length} 問回答してください`}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Result view ─────────────────────────────────────────────────────────

function ResultView({
  type,
  onApply,
  onReset,
  saved,
}: {
  type: BodyFrameType
  onApply: () => void
  onReset: () => void
  saved: boolean
}) {
  const data = FRAME_DATA[type]

  return (
    <div className="anim-fade-in">
      {/* Result hero */}
      <div className="border-b border-gray-100" style={{ backgroundColor: data.bgColor }}>
        <div className="max-w-3xl mx-auto px-5 py-14">
          <p className="section-label mb-4">Diagnosis Result</p>
          <div className="flex items-start gap-6 flex-wrap">
            <div>
              <div
                className="inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.3em] uppercase text-white mb-3"
                style={{ backgroundColor: data.accentColor }}
              >
                {data.nameEn}
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight">
                {data.nameJa}
              </h1>
              <p className="text-sm text-gray-500 mt-3">{data.tagline}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-600 leading-relaxed max-w-xl">{data.description}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 space-y-12">

        {/* Characteristics */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] font-black text-gray-200 tabular-nums">01</span>
            <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Body Characteristics</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <ul className="space-y-2">
            {data.characteristics.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Best items */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] font-black text-gray-200 tabular-nums">02</span>
            <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Best Items</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.bestItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 border border-gray-100 px-3 py-3 hover:border-gray-300 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Avoid items */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] font-black text-gray-200 tabular-nums">03</span>
            <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Items to Avoid</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <ul className="space-y-2">
            {data.avoidItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                <span className="w-4 h-4 border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✕
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Best styles */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] font-black text-gray-200 tabular-nums">04</span>
            <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Recommended Styles</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="flex flex-wrap gap-2">
            {data.bestStyles.map((s) => (
              <span key={s} className="text-xs font-bold bg-black text-white px-3 py-1.5">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Best colors */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] font-black text-gray-200 tabular-nums">05</span>
            <h3 className="text-xs tracking-[0.2em] uppercase font-bold">Color Palette</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="flex flex-wrap gap-2">
            {data.bestColors.map((c) => (
              <span key={c} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5">
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* Styling tip */}
        <section className="border-l-4 border-black pl-5 py-2">
          <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-2">Styling Tip</p>
          <p className="text-sm text-gray-700 leading-relaxed">{data.tip}</p>
        </section>

        {/* CTA */}
        <div className="border-2 border-black p-6 space-y-4">
          <p className="text-xs font-black tracking-wider uppercase">このタイプでコーデを生成する</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            骨格タイプ「{data.nameJa}」をプロフィールに保存して、AIスタイリストがあなたの骨格に最適化されたコーデを提案します。
          </p>
          <div className="flex gap-3">
            <button
              onClick={onApply}
              disabled={saved}
              className="flex-1 py-4 btn-primary text-[11px] disabled:opacity-60"
            >
              {saved ? '✓  保存しました。トップへ移動中…' : '✦  プロフィールに保存してコーデ生成へ  ✦'}
            </button>
            <button
              onClick={onReset}
              className="px-5 py-4 btn-outline text-[11px]"
            >
              再診断
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
