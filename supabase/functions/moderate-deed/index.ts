import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, author } = await req.json()

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (content.length > 280) {
      return new Response(
        JSON.stringify({ error: 'Content too long (max 280 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Claude Haiku for moderation
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `You are a content moderator for a website called "One Good Deed" where people anonymously share a good deed they did today.

Classify the following message and respond ONLY with a JSON object (no markdown, no explanation):
{
  "status": "approved" | "pending_review" | "rejected",
  "reason": "one short sentence explaining your decision"
}

Rules:
- "approved": genuine good deed, kind act, positive contribution, creative work shared with others, anything done with good intentions for oneself or the world
- "pending_review": clearly ambiguous, offensive, or impossible to interpret as positive
- "rejected": harmful content, threats, violence, illegal activity, hate speech, spam

Message to classify: "${content.replace(/"/g, '\\"')}"`,
          },
        ],
      }),
    })

    const anthropicData = await anthropicResponse.json()
    const moderationText = anthropicData.content[0].text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    let moderation
    try {
      moderation = JSON.parse(moderationText)
    } catch {
      moderation = { status: 'pending_review', reason: 'Could not parse moderation response' }
    }

    // Insert into database using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data, error } = await supabase
      .from('deeds')
      .insert({
        content: content.trim(),
        author: author || null,
        status: moderation.status,
        moderation_reason: moderation.reason,
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        status: moderation.status,
        id: data.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})