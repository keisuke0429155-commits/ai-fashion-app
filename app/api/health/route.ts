import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET() {
  const checks: Record<string, { ok: boolean; message: string }> = {}

  // ── 1. 環境変数チェック ──────────────────────────────────────
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL:  process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET:           process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL:              process.env.NEXTAUTH_URL,
    ANTHROPIC_API_KEY:         process.env.ANTHROPIC_API_KEY,
  }

  const missingEnv = Object.entries(envVars)
    .filter(([, v]) => !v || v.includes('your_') || v.includes('placeholder'))
    .map(([k]) => k)

  checks.env = missingEnv.length === 0
    ? { ok: true,  message: '必須環境変数はすべて設定済み' }
    : { ok: false, message: `未設定の変数: ${missingEnv.join(', ')}` }

  // ── 2. Supabase 接続チェック ─────────────────────────────────
  try {
    const { error } = await db.from('users').select('id').limit(1)
    checks.supabase_users = error
      ? { ok: false, message: error.message }
      : { ok: true,  message: 'users テーブルへの接続成功' }
  } catch (e) {
    checks.supabase_users = { ok: false, message: String(e) }
  }

  try {
    const { error } = await db.from('shops').select('id').limit(1)
    checks.supabase_shops = error
      ? { ok: false, message: error.message }
      : { ok: true,  message: 'shops テーブルへの接続成功' }
  } catch (e) {
    checks.supabase_shops = { ok: false, message: String(e) }
  }

  try {
    const { error } = await db.from('shop_products').select('id').limit(1)
    checks.supabase_products = error
      ? { ok: false, message: error.message }
      : { ok: true,  message: 'shop_products テーブルへの接続成功' }
  } catch (e) {
    checks.supabase_products = { ok: false, message: String(e) }
  }

  // ── 結果サマリー ─────────────────────────────────────────────
  const allOk = Object.values(checks).every((c) => c.ok)

  return NextResponse.json(
    { status: allOk ? 'ok' : 'error', checks },
    { status: allOk ? 200 : 500 }
  )
}
