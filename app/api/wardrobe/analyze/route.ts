import { NextRequest, NextResponse } from 'next/server'

const USE_MOCK = !process.env.ANTHROPIC_API_KEY ||
  process.env.ANTHROPIC_API_KEY === 'your_api_key_here'

// Mock results by rough filename hint (for demo mode)
const MOCK_RESULTS = [
  { category: 'トップス',    name: 'オーバーサイズTシャツ', brand: '',       color: 'ホワイト',   imageColor: '#F5F5F0', note: 'コットン100% カジュアル' },
  { category: 'ボトムス',    name: 'スリムデニムパンツ',    brand: '',       color: 'インディゴ', imageColor: '#283593', note: '12oz デニム ストレート' },
  { category: 'アウター',    name: 'テーラードジャケット',  brand: '',       color: 'ライトグレー', imageColor: '#CFD8DC', note: 'ウールブレンド 軽量' },
  { category: 'シューズ',    name: 'ローカットスニーカー',  brand: '',       color: 'ホワイト',   imageColor: '#FAFAFA', note: 'キャンバス素材' },
]

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { imageBase64, mediaType } = body as { imageBase64: string; mediaType: string }

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: '画像データが不正です' }, { status: 400 })
  }

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1800))
    const result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
    return NextResponse.json(result)
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: 'ファッション画像分析の専門家。JSONのみ出力。',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif', data: imageBase64 },
          },
          {
            type: 'text',
            text: `この服・ファッションアイテムの画像を分析し、以下のJSON形式のみを返してください。

{
  "category": "トップス" | "ボトムス" | "シューズ" | "アウター" | "バッグ" | "アクセサリー",
  "name": "アイテムの推定名称（例:オーバーサイズスウェット、ワイドデニムパンツ）",
  "brand": "ブランド名（ロゴ・タグが見えれば記入、不明なら空文字）",
  "color": "メインカラー名（日本語、例:ホワイト・ネイビー・バーガンディ）",
  "imageColor": "アイテムの代表色のHEXコード（例:#F5F5F5）",
  "note": "素材・シルエット・特徴の説明（20字以内）"
}

JSONのみ出力。前後の説明文不要。`,
          },
        ],
      }],
    })

    const raw = message.content[0]
    if (raw.type !== 'text') throw new Error('Unexpected response type')

    const text = raw.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const result = JSON.parse(text)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[wardrobe/analyze]', err)
    return NextResponse.json({ error: '画像の解析に失敗しました。もう一度お試しください。' }, { status: 500 })
  }
}
