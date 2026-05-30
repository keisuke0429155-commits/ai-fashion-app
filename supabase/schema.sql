-- ============================================================
-- AI Stylist — Supabase Schema
-- Supabase SQL Editor で実行してください
-- ============================================================

-- ── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT        PRIMARY KEY,
  email         TEXT        UNIQUE NOT NULL,
  name          TEXT        NOT NULL DEFAULT '',
  password_hash TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Shops ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
  id                  TEXT        PRIMARY KEY,
  owner_id            TEXT        NOT NULL UNIQUE,
  name                TEXT        NOT NULL DEFAULT '',
  url                 TEXT        NOT NULL DEFAULT '',
  description         TEXT        NOT NULL DEFAULT '',
  accent_color        TEXT        NOT NULL DEFAULT '#000000',
  base_access_token   TEXT,
  base_refresh_token  TEXT,
  base_last_sync_at   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Shop Products ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_products (
  id               TEXT        PRIMARY KEY,
  shop_id          TEXT        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  shop_name        TEXT        NOT NULL DEFAULT '',
  shop_url         TEXT        NOT NULL DEFAULT '',
  shop_accent_color TEXT       NOT NULL DEFAULT '#000000',
  category         TEXT        NOT NULL,
  name             TEXT        NOT NULL,
  price            INTEGER     NOT NULL DEFAULT 0,
  color            TEXT        NOT NULL DEFAULT '',
  image_color      TEXT        NOT NULL DEFAULT '#CCCCCC',
  description      TEXT        NOT NULL DEFAULT '',
  product_url      TEXT        NOT NULL,
  active           BOOLEAN     NOT NULL DEFAULT TRUE,
  source           TEXT        NOT NULL DEFAULT 'manual',
  source_item_id   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS shops_owner_id_idx          ON shops(owner_id);
CREATE INDEX IF NOT EXISTS shop_products_shop_id_idx   ON shop_products(shop_id);
CREATE INDEX IF NOT EXISTS shop_products_active_idx    ON shop_products(active);
CREATE INDEX IF NOT EXISTS shop_products_source_idx    ON shop_products(shop_id, source);

-- ── Row Level Security（サービスロールキーがバイパスするため無効化可）──
-- 本番でユーザー直接アクセスが必要な場合は適宜ポリシーを追加してください
ALTER TABLE users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE shops          DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products  DISABLE ROW LEVEL SECURITY;
