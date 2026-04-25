import { createClient } from '@/lib/supabase/server'

export type HandoffNavState = {
  isAuthenticated: boolean
  profileId: string | null
}

export async function getHandoffNavState(): Promise<HandoffNavState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isAuthenticated: false, profileId: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  return {
    isAuthenticated: true,
    profileId: profile?.id ?? null,
  }
}
