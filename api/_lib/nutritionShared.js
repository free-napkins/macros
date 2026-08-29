import { createClient } from '@supabase/supabase-js'

export const MICRO_KEY_HINT =
  'Use these exact keys where known (per 100g): vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, ' +
  'vitamin_e_mg, vitamin_k_mcg, vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b5_mg, vitamin_b6_mg, ' +
  'vitamin_b12_mcg, folate_mcg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg, potassium_mg, zinc_mg, ' +
  'copper_mg, manganese_mg, selenium_mcg, saturated_g, monounsaturated_g, polyunsaturated_g, trans_fat_g, ' +
  'cholesterol_mg, omega3_g, omega6_g, alcohol_g, caffeine_mg, water_g, starch_g, ' +
  'insoluble_fiber_g, soluble_fiber_g.'

// Verifies the caller holds a valid Supabase session before any route
// spends the shared ANTHROPIC_API_KEY. Writes a 401 and returns null
// on failure — callers should `if (!user) return` immediately after.
export async function requireUser(req, res) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  // Reuses the same Supabase project vars already configured for the client
  // build (VITE_-prefixed vars are still plain process.env entries at
  // runtime in a Vercel serverless function — the prefix only controls
  // what Vite inlines into the browser bundle).
  const supabaseServer = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(token)
  if (error || !user) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  return user
}

// Forces a single tool call against Claude and returns its parsed
// input. Throws on any failure (non-OK response, no tool_use block).
export async function callAnthropicTool({ apiKey, tool, content }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Anthropic API error: ${response.status} ${text}`)
  }

  const data = await response.json()
  const toolUse = data.content?.find((b) => b.type === 'tool_use')
  if (!toolUse) {
    throw new Error('No structured result returned')
  }
  return toolUse.input
}
