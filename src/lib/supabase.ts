import { createBrowserClient } from '@supabase/ssr'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = (): boolean => {
  if (!rawUrl || !rawKey) return false
  if (rawUrl.includes('placeholder') || rawUrl.includes('ngftjzquzmsfjjbwnuts')) return false
  if (rawKey.includes('YOUR_ANON_KEY') || rawKey === 'placeholder-key') return false
  return true
}

export const supabase = createBrowserClient(
  isSupabaseConfigured() ? rawUrl! : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? rawKey! : 'placeholder-key'
)