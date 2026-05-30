import { NextRequest, NextResponse } from 'next/server'
import { UserProfile, WardrobeItem, WeeklyOutfitPlan, OutfitItem } from '@/types'
import { mockWeeklyPlan } from '@/lib/mockData'
import { TRENDS } from '@/lib/mockTrends'
import { WeatherData } from '@/lib/weather'

// Vercel Pro: 最大300秒まで許可（無料プランではストリーミングで回避）
export const maxDuration = 300

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
    const plan = buildMockPlanWithWardrobe(wardrobeItems, useWardrobeItems)
    return NextResponse.json(plan)
  }

  // ── 本番: Claude API（ストリーミングで Vercel タイムアウトを回避）──
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
      casual:   'カジュアルな外出', shopping: 'ショッピング・街歩き', cafe:   'カフェ・ランチ',
      date:     'デート',          party:    '飲み会・パーティー', festival: 'フェス・ライブ',
      outdoor:  'アウトドア',      sport:    'スポーツ・ジム',     travel:   '旅行・観光',
      office:   'オフィス',        formal:   'フォーマル',          wedding:  '結婚式',
    }

    const wardrobeSection = useWardrobeItems ? `
【マイクロゼット（ユーザーが所有しているアイテム）】
${wardrobeItems.map((w, i) => `${i + 1}. ${w.category}「${w.name}」${w.brand ? `（${w.brand}）` : ''} カラー:${w.color}${w.note ? ` メモ:${w.note}` : ''}`).join('\n')}
※ 上記を積極的に使用。所有アイテムは isOwned:true、price:0、searchQuery/searchUrl:""。
` : ''

    const DAY_NAMES = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日']
    const weatherSection = useWeatherData && weatherData ? `
【天気予報（7日分）】
${weatherData.days.slice(0, 7).map((d, i) => `- ${DAY_NAMES[i]}（${d.date}）: ${d.conditionJa} 最高${d.tempMax}°C・最低${d.tempMin}°C 降水確率${d.precipProb}%`).join('\n')}
※ 各日の天気・気温に合ったアイテムを選ぶこと。
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
- シルエット: ${fitMap[profile.fit ?? 'regular']}
${profile.bodyFrameType ? `- 骨格タイプ: ${bodyFrameMap[profile.bodyFrameType]}` : ''}
${activeTrends.length > 0 ? `- SNSトレンド: ${activeTrends.map((t) => t.tag).join('・')}` : ''}
${wardrobeSection}${weatherSection}
【出力JSON仕様】
{
  "overallConcept": "今週のスタイルコンセプト（60字以内）",
  "outfits": [
    {
      "day": "月曜日", "dayEn": "MON", "theme": "テーマ", "mood": "キーワード",
      "stylingTip": "ポイント（40字以内）",
      "items": [
        {
          "category": "トップス", "name": "商品名", "brand": "ブランド名",
          "price": 数値, "description": "素材・特徴（20字以内）", "color": "カラー名",
          "searchQuery": "検索ワード", "searchUrl": "https://zozo.jp/search/?q=...",
          "imageColor": "#RRGGBB", "isOwned": false
        }
      ]
    }
  ]
}

【ルール】
- 月〜日の7日分必須、各日3〜4アイテム
- categoryは「トップス」「ボトムス」「シューズ」「アウター」「バッグ」「アクセサリー」のみ
- ブランドリスト（予算・スタイルに応じて幅広く。7日間で多様なブランドを）:
  プチプラ: UNIQLO, GU, H&M, ZARA, COS, Arket
  セレクト: BEAMS, United Arrows, nano・universe, Urban Research, TOMORROWLAND
  スポーツ: NIKE, Adidas, New Balance, THE NORTH FACE, Patagonia, GRAMICCI, Salomon
  ストリート: STÜSSY, Carhartt WIP, Champion, Levi's
  日本デザイナー: Auralee, Comoli, Graphpaper, nanamica, Engineered Garments
  海外中価格帯: A.P.C., Norse Projects, Our Legacy, Nudie Jeans
  シューズ: Dr. Martens, Birkenstock, Common Projects, Clarks, Converse
  ラグジュアリー: Acne Studios, Maison Margiela, Theory, Stone Island
- JSONのみ出力・前後説明文不要`

    // ストリーミングで返す（Vercel タイムアウト回避）
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: 'ファッションスタイリストとしてJSONのみを出力。マークダウン・前後説明文は一切不要。',
      messages: [{ role: 'user', content: prompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('[generate-outfits stream]', err)
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[generate-outfits]', err)
    return NextResponse.json(
      { error: 'コーデの生成に失敗しました。再試行してください。' },
      { status: 500 },
    )
  }
}

// ── モック用: ワードローブアイテムを各日に順番に組み込む ──────────────────
function buildMockPlanWithWardrobe(wardrobeItems: WardrobeItem[], useIt: boolean): WeeklyOutfitPlan {
  if (!useIt || wardrobeItems.length === 0) return mockWeeklyPlan

  const outfits = mockWeeklyPlan.outfits.map((day) => {
    const usedCategories = new Set<string>()
    const owned: OutfitItem[] = []

    for (const w of wardrobeItems) {
      if (usedCategories.has(w.category)) continue
      if (owned.length >= 2) break
      owned.push({
        category: w.category, name: w.name, brand: w.brand || 'MY CLOSET',
        price: 0, description: w.note || `${w.color}・${w.category}`,
        color: w.color, searchQuery: '', searchUrl: '',
        imageColor: w.imageColor, isOwned: true,
      })
      usedCategories.add(w.category)
    }

    const remaining = day.items.filter((item) => !usedCategories.has(item.category))
    return { ...day, items: [...owned, ...remaining].slice(0, 4) }
  })

  return {
    ...mockWeeklyPlan,
    overallConcept: `マイクロゼットのアイテムを起点に、AIが${mockWeeklyPlan.overallConcept}`,
    outfits,
  }
}
