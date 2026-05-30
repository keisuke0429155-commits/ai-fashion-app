'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BodyFrameType } from '@/types'

type Gender = 'male' | 'female'
type Step = 'gender' | 'quiz' | 'result'

// ── 女性向け設問 ────────────────────────────────────────────────────────────

const FEMALE_QUESTIONS: {
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

// ── 男性向け設問 ────────────────────────────────────────────────────────────

const MALE_QUESTIONS: typeof FEMALE_QUESTIONS = [
  {
    id: 'q1',
    question: '肩・首元の特徴',
    hint: '肩幅と首の太さを確認してください',
    options: [
      { label: '肩幅がしっかりあり首は太め', sub: '鎖骨は目立たず厚みがある', type: 'straight' },
      { label: '肩幅が狭くなで肩気味', sub: '首が細くすっきりとした印象', type: 'wave' },
      { label: '鎖骨・肩甲骨がくっきり', sub: '骨のフレームが目立つ', type: 'natural' },
    ],
  },
  {
    id: 'q2',
    question: '手首・手の特徴',
    hint: '手首を反対の手でつかんでみてください',
    options: [
      { label: '手のひらが厚くがっしり', sub: '手首は少し太め、関節目立たない', type: 'straight' },
      { label: '手のひらが薄く細い', sub: '手首がしなやかで華奢', type: 'wave' },
      { label: '手首の関節が大きい', sub: '指の骨・関節のゴツゴツ感がある', type: 'natural' },
    ],
  },
  {
    id: 'q3',
    question: '体重が増えたときの変化',
    hint: '体重が増えたとき最初に気になる場所は？',
    options: [
      { label: 'お腹・背中など体幹', sub: '上半身・体幹に先についていく', type: 'straight' },
      { label: '腰回り・お尻・太もも', sub: '下半身に先についていく', type: 'wave' },
      { label: '全体的に変化が少ない', sub: '太りにくく体型変化が出にくい', type: 'natural' },
    ],
  },
  {
    id: 'q4',
    question: '体の質感・見た目の印象',
    hint: '他の人に言われることが多い体の印象は？',
    options: [
      { label: '筋肉質・ガッシリ', sub: '立体的でメリハリがある', type: 'straight' },
      { label: '細身・スリムで柔らかい', sub: '華奢で洗練された印象', type: 'wave' },
      { label: '骨感・フレーム感がある', sub: 'すらっとして骨格が目立つ', type: 'natural' },
    ],
  },
  {
    id: 'q5',
    question: '膝・脚の特徴',
    hint: 'つま先を前に向けて立ったときの膝は？',
    options: [
      { label: '膝が丸くコンパクト', sub: 'ふくらはぎが発達しやすい', type: 'straight' },
      { label: '膝が小さく細い', sub: '脚が長く細く見える', type: 'wave' },
      { label: '膝の骨が大きい', sub: 'すねの骨がはっきり見える', type: 'natural' },
    ],
  },
]

// ── 結果データ（女性） ──────────────────────────────────────────────────────

type FrameData = {
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
}

const FEMALE_FRAME_DATA: Record<BodyFrameType, FrameData> = {
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

// ── 結果データ（男性） ──────────────────────────────────────────────────────

const MALE_FRAME_DATA: Record<BodyFrameType, FrameData> = {
  straight: {
    nameJa: 'ストレート',
    nameEn: 'STRAIGHT',
    tagline: '筋肉質・メリハリ・クリーンシルエット',
    description: '筋肉がつきやすく体に厚みと立体感があるタイプ。上半身に重心があり、シンプルで上質なアイテムが映えます。無駄を削ぎ落としたクリーンなスタイリングが最大の武器です。',
    accentColor: '#1A1A2E',
    bgColor: '#F0F0F5',
    characteristics: [
      '肩幅がしっかりあり首から肩に厚みがある',
      '筋肉がつきやすく体幹・上半身が発達しやすい',
      '脂肪はお腹・背中など体幹に先につきやすい',
      '体全体にハリと弾力があり立体的',
      '膝が丸くコンパクトでふくらはぎが発達しやすい',
    ],
    bestItems: [
      { icon: '👔', label: 'テーラードジャケット' },
      { icon: '👕', label: 'Vネック / クルーネックT' },
      { icon: '👖', label: 'ストレートデニム' },
      { icon: '🧥', label: 'トレンチコート' },
      { icon: '👞', label: 'レザーシューズ / ローファー' },
    ],
    avoidItems: ['厚手のニットやダウン（上半身がさらに重く見える）', '過度なオーバーサイズ（シルエットが崩れる）', 'チェスト部分に装飾が多いアイテム'],
    bestStyles: ['クラシック', 'ミニマル', 'クリーン', 'アメカジ', 'オールドマネー'],
    bestColors: ['ホワイト', 'ネイビー', 'グレー', 'ブラック', 'ベージュ'],
    tip: 'VネックやUネックで首元をすっきり見せると◎。上半身にボリュームが出やすいため、ボトムスはスリムめにするとバランスが取れます。',
  },
  wave: {
    nameJa: 'ウェーブ',
    nameEn: 'WAVE',
    tagline: '細身・スリム・スタイリッシュ',
    description: '骨格が繊細で華奢な印象のタイプ。スリムシルエットが映え、洗練されたスマートカジュアルやモード系がよく似合います。着こなしのセンスが際立つスタイリッシュなタイプです。',
    accentColor: '#0D47A1',
    bgColor: '#EEF4FF',
    characteristics: [
      '肩幅が狭くなで肩気味',
      '体全体が細くスリムな印象',
      '下半身（腰回り・太もも）に脂肪がつきやすい',
      '骨格が細く全体的に華奢な印象',
      '膝が小さく細く脚が長く見えやすい',
    ],
    bestItems: [
      { icon: '👖', label: 'スリム / テーパードパンツ' },
      { icon: '👔', label: 'フィットシャツ・ブラウス' },
      { icon: '🧶', label: 'ニットセーター' },
      { icon: '🧥', label: 'チェスターコート' },
      { icon: '👞', label: 'ローファー / 細身スニーカー' },
    ],
    avoidItems: ['ビッグシルエットのアウター（体が埋もれる）', 'ダボっとしたワイドパンツ全体', '厚手・硬い素材のアウター'],
    bestStyles: ['スマートカジュアル', '韓国系', 'モード', 'シンプルカジュアル', 'フレンチカジュアル'],
    bestColors: ['ホワイト', 'ライトグレー', 'ベージュ', 'ペールブルー', 'ネイビー'],
    tip: '縦のラインを意識したスリムシルエットが◎。スタックジーンズや丈の長いコートで脚長効果を狙うと全体のバランスが整います。',
  },
  natural: {
    nameJa: 'ナチュラル',
    nameEn: 'NATURAL',
    tagline: 'フレーム感・個性的・骨格美',
    description: '骨格・フレームが目立つ存在感のあるタイプ。ゆったりシルエットやレイヤードが映え、ストリートやヴィンテージなど個性的なスタイリングが得意。着こなしにこなれ感が自然と生まれます。',
    accentColor: '#1B4332',
    bgColor: '#F0F7F4',
    characteristics: [
      '鎖骨・肩甲骨がくっきりしている',
      '骨格のフレームが大きく存在感がある',
      '筋肉・脂肪がつきにくい体質のことが多い',
      '関節が大きく骨感がある',
      '膝の骨が大きくすねの骨がはっきりしている',
    ],
    bestItems: [
      { icon: '🧥', label: 'オーバーサイズパーカー / コート' },
      { icon: '👖', label: 'ワイドパンツ / カーゴパンツ' },
      { icon: '👕', label: 'ヘビーウェイトTシャツ' },
      { icon: '👟', label: 'ボリュームスニーカー' },
      { icon: '🎒', label: 'バックパック / ビッグバッグ' },
    ],
    avoidItems: ['タイトフィットの服（骨感が強調される）', 'スキニーパンツ（骨格感が目立ちすぎる）', '薄手・ペラペラな素材'],
    bestStyles: ['ストリート', 'ゴープコア', 'ヴィンテージ', 'アメカジ', 'ワークウェア', 'ミリタリー'],
    bestColors: ['カーキ', 'オリーブ', 'ブラウン', 'ベージュ', 'グリーン', 'ネイビー'],
    tip: '素材感のある服やレイヤードで骨格の個性を活かして。ゆったりシルエットで骨感がほどよく隠れ、こなれ感が出ます。',
  },
}

// ── Main component ──────────────────────────────────────────────────────────

export default function SkeletalPage() {
  const router = useRouter()
  const [gender, setGender] = useState<Gender | null>(null)
  const [answers, setAnswers] = useState<Record<string, BodyFrameType>>({})
  const [step, setStep] = useState<Step>('gender')
  const [result, setResult] = useState<BodyFrameType | null>(null)
  const [saved, setSaved] = useState(false)
  const [existingType, setExistingType] = useState<BodyFrameType | null>(null)
  const [existingGender, setExistingGender] = useState<Gender | null>(null)

  useEffect(() => {
    const storedType = localStorage.getItem('ai_stylist_body_frame_type') as BodyFrameType | null
    const storedGender = localStorage.getItem('ai_stylist_body_frame_gender') as Gender | null
    if (storedType) setExistingType(storedType)
    if (storedGender) setExistingGender(storedGender)
  }, [])

  const QUESTIONS = gender === 'male' ? MALE_QUESTIONS : FEMALE_QUESTIONS
  const FRAME_DATA = gender === 'male' ? MALE_FRAME_DATA : FEMALE_FRAME_DATA

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined)

  const handleGenderSelect = (g: Gender) => {
    setGender(g)
    setAnswers({})
    setStep('quiz')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDiagnose = () => {
    const scores: Record<BodyFrameType, number> = { straight: 0, wave: 0, natural: 0 }
    for (const t of Object.values(answers)) scores[t]++
    const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as BodyFrameType
    setResult(winner)
    setStep('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApply = () => {
    if (!result || !gender) return
    localStorage.setItem('ai_stylist_body_frame_type', result)
    localStorage.setItem('ai_stylist_body_frame_gender', gender)
    setSaved(true)
    setTimeout(() => router.push('/'), 800)
  }

  const handleReset = () => {
    setAnswers({})
    setStep('gender')
    setResult(null)
    setGender(null)
    setSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (step === 'result' && result && gender) {
    return (
      <ResultView
        type={result}
        gender={gender}
        frameData={FRAME_DATA}
        onApply={handleApply}
        onReset={handleReset}
        saved={saved}
      />
    )
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
              <span className="font-bold">
                {existingGender === 'male' ? '男性 / ' : existingGender === 'female' ? '女性 / ' : ''}
                {FEMALE_FRAME_DATA[existingType].nameJa}
              </span>
              <button
                onClick={() => {
                  const g = existingGender ?? 'female'
                  setGender(g)
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

      {/* Gender select or Quiz */}
      {step === 'gender' ? (
        <div className="max-w-3xl mx-auto px-5 py-16">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-gray-400 mb-8 text-center">
            まず性別を選択してください
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {([
              { value: 'male' as Gender, label: '男性', sub: 'Men\'s Diagnosis', icon: '👔' },
              { value: 'female' as Gender, label: '女性', sub: 'Women\'s Diagnosis', icon: '👗' },
            ] as const).map(({ value, label, sub, icon }) => (
              <button
                key={value}
                onClick={() => handleGenderSelect(value)}
                className="border-2 border-gray-200 hover:border-black transition-all duration-150 p-8 flex flex-col items-center gap-3 group"
              >
                <span className="text-4xl">{icon}</span>
                <span className="text-lg font-black tracking-wide">{label}</span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase group-hover:text-gray-600 transition-colors">{sub}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-5 py-12 space-y-10">

          {/* Gender badge */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-white bg-black px-3 py-1.5">
              {gender === 'male' ? '男性' : '女性'}
            </span>
            <button
              onClick={() => { setStep('gender'); setAnswers({}) }}
              className="text-[11px] text-gray-400 hover:text-black underline transition-colors"
            >
              変更する
            </button>
          </div>

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
      )}
    </div>
  )
}

// ── Result view ─────────────────────────────────────────────────────────────

function ResultView({
  type,
  gender,
  frameData,
  onApply,
  onReset,
  saved,
}: {
  type: BodyFrameType
  gender: Gender
  frameData: Record<BodyFrameType, FrameData>
  onApply: () => void
  onReset: () => void
  saved: boolean
}) {
  const data = frameData[type]

  return (
    <div className="anim-fade-in">
      {/* Result hero */}
      <div className="border-b border-gray-100" style={{ backgroundColor: data.bgColor }}>
        <div className="max-w-3xl mx-auto px-5 py-14">
          <p className="section-label mb-4">Diagnosis Result — {gender === 'male' ? 'Men' : 'Women'}</p>
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
                <span className="w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
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
                <span className="w-4 h-4 border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
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
              <span key={s} className="text-xs font-bold bg-black text-white px-3 py-1.5">{s}</span>
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
              <span key={c} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5">{c}</span>
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
