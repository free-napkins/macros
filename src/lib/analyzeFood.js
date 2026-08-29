import { supabase } from './supabaseClient'

export async function analyzeFood(description) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const res = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(session ? { authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ description }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to analyze food')
  return data
}
