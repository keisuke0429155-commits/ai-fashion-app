import { NextRequest, NextResponse } from 'next/server'
import { UserProfile, WardrobeItem, WeeklyOutfitPlan, OutfitItem } from '@/types'
import { mockWeeklyPlan } from '@/lib/mockData'
import { TRENDS } from '@/lib/mockTrends'
import { WeatherData } from '@/lib/weather'

const USE_MOCK = !process.env.ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY === 'your_api_key_here'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const profile: UserProfile = body.profile ?? body
  const wardrobeItems: WardrobeItem[] = body.wardrobeItems ?? []
  const weatherData: WeatherData | null = body.weatherData ?? null
  const useWardrobeItems = profile.useWardrobe && wardrobeItems.length > 0
  const useWeatherData = profile.useWeather && !!weatherData
  const selectedTrendIds: string[] = profile.selectedTrends ?? []
  const activeTrends = TRENDS.filter((t) => selectedTrendIds.includes(t.id))

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000))
    // モック時もワードローブアイテムを組み込む
    const plan = buildMockPlanWithWardrobe(wardrobeItems, useWardrobeItems)
    return NextResponse.json(plan)
  }

  // ── 本番: Claude API ──
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const genderMap   = { male: '男性', female: '女性', unisex: 'ユニセックス' }
    const bodyMap     = { slim: 'スリム', standard: '標準', athletic: 'アスリート体型', plus: 'ぽっちゃり' }
    const budgetRange = { low: '〜5,000円', mid: '5,000〜15,000円', high: '15,000円〜' }
    const fitMap      = { tight: 'タイト', regular: 'レギュラー', relaxed: 'リラックス', oversized: 'オーバーサイズ', wide: 'ワイド' }
    const bodyFrameMap: Record<string, string> = {
      straight: 'ストレート（筋肉質・立体感・上半身に重心。Vネック・シンプルな素材感・テーラードが映える。ギャザー過多・厚手ニットは避ける）',
      wave:     'ウェーブ（柔らか・曲線的・下半身に重心。フリル・ウエストマーク・ショート丈が映える。ビッグシルエット・ローライズは避ける）',
      natural:  'ナチュラル（フレーム感・骨格美・骨感がある。ゆったりシルエット・レイヤード・素材感が映える。タイトフィット・薄手素材は避ける）',
    }
    const occasionMap: Record<string, string> = {
      casual:   'カジュアルな外出（公園・散歩・友人と）',
      shopping: 'ショッピング・街歩き（おしゃれに動きやすく）',
      cafe:     'カフェ・ランチ（こなれた日常スタイル）',
      date:     'デート（印象よく・清潔感重視）',
      party:    '飲み会・パーティー（華やかさ＆抜け感）',
      festival: 'フェス・ライブ（動きやすく個性的に）',
      outdoor:  'アウトドア・ハイキング（機能性重視）',
      sport:    'スポーツ・ジム（スポーティ＆おしゃれ）',
      travel:   '旅行・観光（荷物少なく・着回し重視）',
      office:   'オフィス・ビジネス（きちんと感・清潔感）',
      formal:   'フォーマル（式典・礼装）',
      wedding:  '結婚式・披露宴（ゲスト服装・上品に）',
    }

    const wardrobeSection = useWardrobeItems ? `
【マイクロゼット（ユーザーが所有しているアイテム）】
${wardrobeItems.map((w, i) => `${i + 1}. ${w.category}「${w.name}」${w.brand ? `（${w.brand}）` : ''} カラー:${w.color}${w.note ? ` メモ:${w.note}` : ''}`).join('\n')}

※ 上記のアイテムを積極的に使用してコーデを組んでください。
  所有アイテムを使う日のコーデでは、そのアイテムの isOwned を true にしてください。
  所有アイテムが足りないカテゴリ（トップス/ボトムス/シューズ等）は新規購入アイテムで補完してください。
  所有アイテムは price: 0、searchQuery: ""、searchUrl: "" を設定してください。
` : ''

    const DAY_NAMES = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日']
    const weatherSection = useWeatherData && weatherData ? `
【天気予報（7日分）】
${weatherData.days.slice(0, 7).map((d, i) => {
  const day = DAY_NAMES[i] ?? `${i + 1}日目`
  return `- ${day}（${d.date}）: ${d.conditionJa} 最高${d.tempMax}°C・最低${d.tempMin}°C 降水確率${d.precipProb}% スタイリングアドバイス:「${d.outfitAdvice}」`
}).join('\n')}

※ 各日の天気・気温に合ったアイテムを必ず選んでください。
  雨の日: 防水素材・レインブーツ優先。雪の日: 防寒最優先。
  気温20°C以上: アウター不要。15°C以下: アウター必須。10°C以下: 厚手コート必須。
  stylingTip には天気・気温に触れた内容を含めてください。
` : ''

    const prompt = `あなたはトップクラスのファッションスタイリストです。以下のプロフィールに基づいて1週間（月〜日）のコーディネート提案をJSON形式で出力してください。

【プロフィール】
- 性別: ${genderMap[profile.gender]}
- 年齢: ${profile.age}歳
- 体型: ${bodyMap[profile.bodyType]}
- 身長: ${profile.height}cm
- 好みスタイル: ${profile.styles.join('・')}
- 着用シーン: ${profile.occasion.map((o) => occasionMap[o] ?? o).join(' / ')}
- 予算（1アイテム目安）: ${budgetRange[profile.budget]}
- 好みカラー: ${(profile.colors ?? []).join('・') || '指定なし'}
- シルエット/サイズ感: ${fitMap[profile.fit ?? 'regular']}
${profile.bodyFrameType ? `- 骨格タイプ: ${bodyFrameMap[profile.bodyFrameType]}` : ''}
${activeTrends.length > 0 ? `- 反映するSNSトレンド: ${activeTrends.map((t) => `${t.tag}（${t.description}）`).join('・')}` : ''}
${wardrobeSection}
${weatherSection}
【出力JSON仕様】
{
  "overallConcept": "今週のスタイルコンセプト説明（60字以内）",
  "outfits": [
    {
      "day": "月曜日",
      "dayEn": "MON",
      "theme": "コーデテーマ",
      "mood": "キーワード",
      "stylingTip": "スタイリングのポイント（40字以内）",
      "items": [
        {
          "category": "トップス",
          "name": "商品名",
          "brand": "ブランド名",
          "price": 価格（所有アイテムは0）,
          "description": "素材・特徴（20字以内）",
          "color": "カラー名",
          "searchQuery": "検索キーワード（所有アイテムは空文字）",
          "searchUrl": "https://zozo.jp/search/?q=...",
          "imageColor": "#HEXカラーコード",
          "isOwned": false
        }
      ]
    }
  ]
}

【ルール】
- 月〜日の7日分必須、各日3〜4アイテム
- categoryは「トップス」「ボトムス」「シューズ」「アウター」「バッグ」「アクセサリー」のみ
- 下記ブランドリストから予算・スタイルに合わせて幅広く選ぶこと。同じブランドを連続して使わず、7日間で多様なブランドを登場させること
- 【プチプラ〜ミドル】UNIQLO, GU, H&M, Mango, ZARA, & Other Stories, Arket, COS, Weekday
- 【セレクト・国内】BEAMS, United Arrows, SHIPS, Journal Standard, nano・universe, Urban Research, Freak's Store, ADAM ET ROPÉ, Edifice, TOMORROWLAND, Spick and Span
- 【スポーツ・アウトドア】NIKE, Adidas, New Balance, Vans, Salomon, THE NORTH FACE, Patagonia, Arc'teryx, GRAMICCI, and wander, Columbia, L.L.Bean
- 【ストリート・カジュアル】STÜSSY, Supreme, Carhartt WIP, Champion, Dickies, Wrangler, Levi's, Lee
- 【日本デザイナー・セレクト】Auralee, Comoli, Graphpaper, nanamica, YAECA, Engineered Garments, Blurhms, HERILL, ts(s), CIOTA
- 【海外中価格帯】A.P.C., Sandro, Ami Paris, Toteme, Margaret Howell, Norse Projects, Our Legacy, Wood Wood, Nudie Jeans
- 【シューズ専門】Dr. Martens, Birkenstock, Common Projects, Tod's, Clarks, REDWING, Timberland, Converse
- 【ラグジュアリー】Theory, Acne Studios, Maison Margiela, Bottega Veneta, Loewe, Isabel Marant, Nanushka, Jacquemus, Stone Island, CP Company
- 7日間でバリエーション豊富に（テーマ・気分・色・素材も毎日変化させる）
- JSONのみ出力・前後の説明文不要`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: 'ファッションスタイリストとしてJSONのみを出力。マークダウン・前後説明文は一切不要。',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0]
    if (raw.type !== 'text') throw new Error('Unexpected response')

    // コードフェンス除去 → 最初の { から最後の } を抽出してパース
    let text = raw.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const start = text.indexOf('{')
    const end   = text.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON not found in response')
    text = text.slice(start, end + 1)

    const plan: WeeklyOutfitPlan = JSON.parse(text)
    return NextResponse.json(plan)
  } catch (err) {
    console.error('[generate-outfits]', err)
    return NextResponse.json({ error: 'コーデの生成に失敗しました。再試行してください。' }, { status: 500 })
  }
}

// ── モック用: ワードローブアイテムを各日に順番に組み込む ──
function buildMockPlanWithWardrobe(wardrobeItems: WardrobeItem[], useIt: boolean): WeeklyOutfitPlan {
  if (!useIt || wardrobeItems.length === 0) return mockWeeklyPlan

  const outfits = mockWeeklyPlan.outfits.map((day, dayIdx) => {
    // その日に使うワードローブアイテムを1〜2点選ぶ（カテゴリが重複しないよう）
    const usedCategories = new Set<string>()
    const owned: OutfitItem[] = []

    for (const w of wardrobeItems) {
      if (usedCategories.has(w.category)) continue
      if (owned.length >= 2) break
      owned.push({
        category: w.category,
        name: w.name,
        brand: w.brand || 'MY CLOSET',
        price: 0,
        description: w.note || `${w.color}・${w.category}`,
        color: w.color,
        searchQuery: '',
        searchUrl: '',
        imageColor: w.imageColor,
        isOwned: true,
      })
      usedCategories.add(w.category)
    }

    // 元のアイテムから所有アイテムと同じカテゴリを除外して補完
    const remaining = day.items.filter((item) => !usedCategories.has(item.category))
    const items = [...owned, ...remaining].slice(0, 4)

    return { ...day, items }
  })

  return {
    ...mockWeeklyPlan,
    overallConcept: `マイクロゼットのアイテムを起点に、AIが${mockWeeklyPlan.overallConcept}`,
    outfits,
  }
}
