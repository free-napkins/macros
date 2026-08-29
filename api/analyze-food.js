import { MICRO_KEY_HINT, requireUser, callAnthropicChat } from './_lib/nutritionShared.js'

const SYSTEM_PROMPT =
  "You are a nutrition-logging assistant inside a macro-tracking app. The user describes food they made or " +
  "ate, in their own words, over a back-and-forth conversation. Your job each turn:\n" +
  "1. Figure out their intent: 'log_once' if they want to log a one-off snack/meal just for today, or " +
  "'add_permanent' if they want to add this as a reusable ingredient/food to their database. If genuinely " +
  "unclear from context, ask.\n" +
  "2. If intent is 'add_permanent', figure out entry_mode: 'weight' stores it as a per-100g ingredient (logged " +
  "later by entering grams), 'serving' stores a discrete serving unit like '1 scoop' or '1 bar' alongside the " +
  "per-100g values (logged later by serving count). Ask if unclear.\n" +
  "3. Estimate nutrition normalized to per-100g values using standard knowledge of the food/ingredients " +
  "described (calories, protein_g, carbs_g, fat_g required; fiber_g, sugar_g, sodium_mg, and micronutrients " +
  "where reasonably knowable).\n" +
  "4. If intent is 'log_once', also determine grams_eaten — the total grams actually consumed this instance, " +
  "computed from whatever unit and quantity the user mentioned (e.g. \"4 smores\" at ~30g each -> 120).\n" +
  "5. If a specific ambiguity would meaningfully change the nutrition estimate or the grams_eaten calculation " +
  "(cooking method, portion size, a key ingredient's amount, whether a quantity refers to one item or the whole " +
  "batch), ask ONE short, natural clarifying question in plain text instead of guessing. Don't ask about things " +
  "that wouldn't meaningfully change the outcome — most everyday descriptions have enough to go on.\n" +
  "6. Once you have enough information, call finalize_food_entry. Otherwise just respond in plain text."

const FINALIZE_TOOL = {
  name: 'finalize_food_entry',
  description: 'Call this once you have enough information to log or save the food the user described. Do not call it while you still need to ask a clarifying question — respond in plain text instead.',
  input_schema: {
    type: 'object',
    properties: {
      intent: { type: 'string', enum: ['log_once', 'add_permanent'], description: 'Whether to log a one-off consumption or add a reusable food to the database.' },
      entry_mode: {
        type: 'string',
        enum: ['weight', 'serving'],
        description: "Only meaningful when intent is add_permanent. 'weight' = per-100g ingredient. 'serving' = a discrete serving unit (fill serving_size_g/serving_label too).",
      },
      name: { type: 'string', description: 'Short descriptive name for this food/dish' },
      calories: { type: 'number', description: 'Calories per 100g' },
      protein_g: { type: 'number', description: 'Protein grams per 100g' },
      carbs_g: { type: 'number', description: 'Carbohydrate grams per 100g' },
      fat_g: { type: 'number', description: 'Fat grams per 100g' },
      fiber_g: { type: 'number', description: 'Fiber grams per 100g' },
      sugar_g: { type: 'number', description: 'Sugar grams per 100g' },
      sodium_mg: { type: 'number', description: 'Sodium mg per 100g' },
      grams_eaten: { type: 'number', description: 'Only when intent is log_once: total grams actually consumed this instance.' },
      serving_size_g: { type: 'number', description: 'Only when entry_mode is serving: weight in grams of one serving unit.' },
      serving_label: { type: 'string', description: 'Only when entry_mode is serving: short label for one unit, e.g. "1 scoop", "1 bar".' },
      micronutrients: {
        type: 'object',
        description: 'Any other estimable nutrients per 100g as key/value pairs. ' + MICRO_KEY_HINT,
        additionalProperties: { type: 'number' },
      },
    },
    required: ['intent', 'name', 'calories', 'protein_g', 'carbs_g', 'fat_g'],
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await requireUser(req, res)
  if (!user) return

  const { messages } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' })
    return
  }

  try {
    const content = await callAnthropicChat({
      apiKey,
      system: SYSTEM_PROMPT,
      tools: [FINALIZE_TOOL],
      messages: messages.map((m) => ({ role: m.role, content: [{ type: 'text', text: m.text }] })),
    })

    const toolUse = content.find((b) => b.type === 'tool_use')
    if (toolUse) {
      res.status(200).json({ type: 'proposal', proposal: toolUse.input })
      return
    }

    const text = content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    res.status(200).json({ type: 'message', text: text || "I'm not sure how to respond to that — could you say more?" })
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) })
  }
}
