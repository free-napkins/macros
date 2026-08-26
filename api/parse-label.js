const MICRO_KEY_HINT =
  'Use these exact keys where the label lists them (per 100g): vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, ' +
  'vitamin_e_mg, vitamin_k_mcg, vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b5_mg, vitamin_b6_mg, ' +
  'vitamin_b12_mcg, folate_mcg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg, potassium_mg, zinc_mg, ' +
  'copper_mg, manganese_mg, selenium_mcg, saturated_g, monounsaturated_g, polyunsaturated_g, trans_fat_g, ' +
  'cholesterol_mg, omega3_g, omega6_g, alcohol_g, caffeine_mg, water_g, starch_g, ' +
  'insoluble_fiber_g, soluble_fiber_g. Only include keys actually printed on the label.'

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
        description: 'Any other listed nutrients per 100g as key/value pairs. ' + MICRO_KEY_HINT,
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
      nutrients: {
        type: 'object',
        description:
          'Nutrients per serving as key/value pairs, e.g. {"vitamin_d_mcg": 25, "zinc_mg": 15}. ' +
          'Map label names to these keys regardless of exact wording (e.g. "Vitamin D3" or "Cholecalciferol" -> vitamin_d_mcg, "Cobalamin"/"Methylcobalamin" -> vitamin_b12_mcg). ' +
          MICRO_KEY_HINT,
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
      : "Read the supplement facts label in this photo. Report nutrient amounts per the label's stated serving/dose — do not normalize to 100g. Call extract_nutrition with the result."

  try {
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
        tool_choice: { type: 'tool', name: 'extract_nutrition' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
              { type: 'text', text: instruction },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      res.status(502).json({ error: `Anthropic API error: ${response.status} ${text}` })
      return
    }

    const data = await response.json()
    const toolUse = data.content?.find((b) => b.type === 'tool_use')
    if (!toolUse) {
      res.status(502).json({ error: 'No structured result returned' })
      return
    }
    res.status(200).json(toolUse.input)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
