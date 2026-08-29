import { MICRO_KEY_HINT, requireUser, callAnthropicTool } from './_lib/nutritionShared.js'

const FOOD_TOOL = {
  name: 'extract_nutrition',
  description: 'Extract nutrition facts from a food or product label photo, normalized to per-100g values.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Product name if visible, else a short descriptive name' },
      calories: { type: 'number', description: 'Calories per 100g' },
      protein_g: { type: 'number', description: 'Protein grams per 100g' },
      carbs_g: { type: 'number', description: 'Carbohydrate grams per 100g' },
      fat_g: { type: 'number', description: 'Fat grams per 100g' },
      fiber_g: { type: 'number', description: 'Fiber grams per 100g' },
      sugar_g: { type: 'number', description: 'Sugar grams per 100g' },
      sodium_mg: { type: 'number', description: 'Sodium mg per 100g' },
      serving_size_g: { type: 'number', description: 'The serving size printed on the label, converted to grams (e.g. "1 cup (240g)" -> 240)' },
      serving_label: { type: 'string', description: 'The serving size exactly as printed, e.g. "1 cup", "2 tbsp", "1 slice (28g)"' },
      micronutrients: {
        type: 'object',
        description: 'Any other listed nutrients per 100g as key/value pairs. ' + MICRO_KEY_HINT + ' Only include keys actually printed on the label.',
        additionalProperties: { type: 'number' },
      },
    },
    required: ['calories', 'protein_g', 'carbs_g', 'fat_g'],
  },
}

const SUPPLEMENT_TOOL = {
  name: 'extract_nutrition',
  description: 'Extract nutrition facts from a supplement label photo, per serving/dose exactly as printed.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Supplement name if visible, else a short descriptive name' },
      dose_label: { type: 'string', description: 'Serving size as printed, e.g. "1 tablet" or "2 capsules"' },
      servings_per_container: { type: 'number', description: 'Number of servings per container, e.g. 60 from "Servings Per Container: 60"' },
      nutrients: {
        type: 'object',
        description:
          'Every nutrient/ingredient listed on the supplement facts panel, per serving, as key/value pairs, ' +
          'e.g. {"vitamin_d_mcg": 25, "zinc_mg": 15}. Capture ALL of them, not just the common ones — including ' +
          'proprietary blend components and anything else printed, however minor. ' +
          'Map label names to these keys regardless of exact wording (e.g. "Vitamin D3" or "Cholecalciferol" -> vitamin_d_mcg, "Cobalamin"/"Methylcobalamin" -> vitamin_b12_mcg). ' +
          MICRO_KEY_HINT + ' Only include items actually printed on the label — do not guess values that aren\'t stated.',
        additionalProperties: { type: 'number' },
      },
    },
    required: ['nutrients'],
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await requireUser(req, res)
  if (!user) return

  const { imageBase64, mediaType, kind } = req.body || {}
  if (!imageBase64 || !mediaType || !['food', 'supplement'].includes(kind)) {
    res.status(400).json({ error: 'imageBase64, mediaType, and kind ("food" or "supplement") are required' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' })
    return
  }

  const tool = kind === 'food' ? FOOD_TOOL : SUPPLEMENT_TOOL
  const instruction =
    kind === 'food'
      ? "Read the nutrition facts label in this photo. Normalize all values to per-100g (if the label states per-serving values and a serving size in grams, convert; if serving size isn't in grams, make a reasonable estimate from typical serving sizes). Call extract_nutrition with the result."
      : "Read the supplement facts label in this photo thoroughly — capture every nutrient, mineral, and blend ingredient listed, not just the well-known ones, and the servings-per-container count if printed. Report nutrient amounts per the label's stated serving/dose — do not normalize to 100g. Call extract_nutrition with the result."

  try {
    const result = await callAnthropicTool({
      apiKey,
      tool,
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: instruction },
      ],
    })
    res.status(200).json(result)
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) })
  }
}
