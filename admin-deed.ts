import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Constant-time delay to slow brute force
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Always wait 500ms — same time for success and failure
  await delay(500)

  try {
    const { password, action, id } = await req.json()

    // Check password
    const adminPassword = Deno.env.get('ADMIN_PASSWORD')!
    if (!password || password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    // action: 'list' | 'approve' | 'reject'
    if (action === 'list') {
      const { data, error } = await supabase
        .from('deeds')
        .select('*')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return new Response(
        JSON.stringify({ deeds: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('deeds')
        .update({ status: 'approved' })
        .eq('id', id)

      if (error) throw error
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('deeds')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
