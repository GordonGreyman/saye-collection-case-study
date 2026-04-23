import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  return (data as Profile | null) ?? null
}
