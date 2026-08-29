import { MICRO_KEY_HINT, requireUser, callAnthropicTool } from './_lib/nutritionShared.js'

const ANALYZE_TOOL = {
  name: 'extract_nutrition_from_description',
  description: 'Extract nutrition facts from a free-text food description, normalized to per-100g values, plus optional serving/quantity detection.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Short descriptive name for this food/dish' },
      calories: { type: 'number', description: 'Calories per 100g' },
      protein_g: { type: 'number', description: 'Protein grams per 100g' },
      carbs_g: { type: 'number', description: 'Carbohydrate grams per 100g' },
      fat_g: { type: 'number', description: 'Fat grams per 100g' },
      fiber_g: { type: 'number', description: 'Fiber grams per 100g' },
      sugar_g: { type: 'number', description: 'Sugar grams per 100g' },
      sodium_mg: { type: 'number', description: 'Sodium mg per 100g' },
      serving_size_g: {
        type: 'number',
        description: 'Best-guess weight in grams of "one unit" of what was described (e.g. one smore, one cup cooked rice). Omit if the description has no natural discrete unit.',
      },
      serving_label: { type: 'string', description: 'Short label for one unit, e.g. "1 smore", "1 cup cooked"' },
      quantity: {
        type: 'number',
        description:
          'The number of units the description says were actually eaten, e.g. 4 from "I ate 4 smores tonight". ' +
          'Omit entirely if the description is a generic ingredient/dish definition with no implied amount eaten, ' +
          'e.g. "white rice cooked in chicken stock".',
      },
      micronutrients: {
        type: 'object',
        description: 'Any other estimable nutrients per 100g as key/value pairs. ' + MICRO_KEY_HINT,
        additionalProperties: { type: 'number' },
      },
    },
    required: ['name', 'calories', 'protein_g', 'carbs_g', 'fat_g'],
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await requireUser(req, res)
  if (!user) return

  const { description } = req.body || {}
  if (!description || !description.trim()) {
    res.status(400).json({ error: 'description is required' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' })
    return
  }

  const instruction =
    `The user is describing a food in their own words: "${description.trim()}". Estimate its nutrition ` +
    'normalized to per-100g values using standard knowledge of that ingredient/dish. If the description ' +
    'implies a specific countable unit and quantity eaten (e.g. "4 smores"), fill in serving_size_g, ' +
    'serving_label, and quantity; otherwise omit those three fields entirely. ' +
    'Call extract_nutrition_from_description with the result.'

  try {
    const result = await callAnthropicTool({
      apiKey,
      tool: ANALYZE_TOOL,
      content: [{ type: 'text', text: instruction }],
    })
    res.status(200).json(result)
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) })
  }
}
