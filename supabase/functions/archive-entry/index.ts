import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type MutationPayload = {
  type: 'text' | 'image' | 'link'
  content: string
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: 'Missing Supabase environment variables.' }, 500)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'Missing authorization header.' }, 401)
  }

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: authData, error: authError } = await callerClient.auth.getUser()
  if (authError || !authData.user) {
    return json({ error: 'Unauthorized.' }, 401)
  }
  const user = authData.user

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const db = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : callerClient

  let body: {
    action?: 'create' | 'update' | 'delete'
    id?: string
    payload?: MutationPayload
  }

  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON payload.' }, 400)
  }

  const action = body.action
  if (!action) {
    return json({ error: 'Action is required.' }, 400)
  }

  if (action === 'create') {
    const payload = body.payload
    if (!payload || !payload.type || !payload.content) {
      return json({ error: 'Missing payload.' }, 400)
    }

    const { error } = await db.from('archive_items').insert({
      profile_id: user.id,
      type: payload.type,
      content: payload.content,
    })
    if (error) return json({ error: error.message }, 400)

    return json({ success: true })
  }

  const id = (body.id ?? '').trim()
  if (!id) {
    return json({ error: 'Entry id is required.' }, 400)
  }

  const { data: item, error: itemError } = await db
    .from('archive_items')
    .select('id, profile_id')
    .eq('id', id)
    .maybeSingle()
  if (itemError) return json({ error: itemError.message }, 400)
  if (!item || item.profile_id !== user.id) {
    return json({ error: 'Unauthorized.' }, 403)
  }

  if (action === 'delete') {
    const { error } = await db.from('archive_items').delete().eq('id', id)
    if (error) return json({ error: error.message }, 400)
    return json({ success: true })
  }

  if (action === 'update') {
    const payload = body.payload
    if (!payload || !payload.type || !payload.content) {
      return json({ error: 'Missing payload.' }, 400)
    }

    const { data, error } = await db
      .from('archive_items')
      .update({ type: payload.type, content: payload.content })
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (error) return json({ error: error.message }, 400)
    if (!data) return json({ error: 'No archive entry was updated.' }, 409)

    return json({ success: true })
  }

  return json({ error: 'Unsupported action.' }, 400)
})
