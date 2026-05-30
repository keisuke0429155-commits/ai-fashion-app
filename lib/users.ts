import bcrypt from 'bcryptjs'
import { db } from './supabase'

export interface StoredUser {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUser(row: any): StoredUser {
  return {
    id:           row.id,
    email:        row.email,
    name:         row.name,
    passwordHash: row.password_hash,
    createdAt:    row.created_at,
  }
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const { data } = await db
    .from('users')
    .select('*')
    .ilike('email', email)
    .maybeSingle()
  return data ? toUser(data) : null
}

export async function createUser(name: string, email: string, password: string): Promise<StoredUser> {
  const existing = await getUserByEmail(email)
  if (existing) throw new Error('このメールアドレスはすでに登録されています')

  const passwordHash = await bcrypt.hash(password, 10)
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const { data, error } = await db
    .from('users')
    .insert({ id, email, name, password_hash: passwordHash })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toUser(data)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
