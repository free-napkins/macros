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
      micronutrients: {
        type: 'object',
        description: 'Any other listed nutrients per 100g as key/value pairs, e.g. {"vitamin_d_mcg": 2.5, "calcium_mg": 120}',
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
        description: 'Nutrients per serving as key/value pairs, e.g. {"vitamin_d3_mcg": 25, "zinc_mg": 15}',
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
