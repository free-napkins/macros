import { Input } from '../design-kit.tsx'

// Shared editable macro/micro field grid used anywhere an AI-parsed
// (or manually entered) food needs review before saving — currently
// the label-scan flow in QuickAdd.jsx and the free-text Ask flow.
export default function NutrientFieldsGrid({ fields, onChange, namePrefix }) {
  const microCount = fields ? Object.keys(fields.micronutrients || {}).length : 0

  return (
    <>
      <Input label="Name" name={`${namePrefix}-name`} value={fields.name} onChange={(e) => onChange('name', e.target.value)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        <Input
          label="Group under product (optional)"
          name={`${namePrefix}-product-name`}
          placeholder="e.g. Kit Kat"
          value={fields.product_name}
          onChange={(e) => onChange('product_name', e.target.value)}
        />
        <Input
          label="Variant / size (optional)"
          name={`${namePrefix}-variant-label`}
          placeholder="e.g. King Size"
          value={fields.variant_label}
          onChange={(e) => onChange('variant_label', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        <Input
          label="Calories / 100g"
          name={`${namePrefix}-calories`}
          type="number"
          value={fields.calories}
          onChange={(e) => onChange('calories', e.target.value)}
        />
        <Input
          label="Protein g / 100g"
          name={`${namePrefix}-protein`}
          type="number"
          value={fields.protein_g}
          onChange={(e) => onChange('protein_g', e.target.value)}
        />
        <Input
          label="Carbs g / 100g"
          name={`${namePrefix}-carbs`}
          type="number"
          value={fields.carbs_g}
          onChange={(e) => onChange('carbs_g', e.target.value)}
        />
        <Input
          label="Fat g / 100g"
          name={`${namePrefix}-fat`}
          type="number"
          value={fields.fat_g}
          onChange={(e) => onChange('fat_g', e.target.value)}
        />
        <Input
          label="Fiber g / 100g"
          name={`${namePrefix}-fiber`}
          type="number"
          value={fields.fiber_g}
          onChange={(e) => onChange('fiber_g', e.target.value)}
        />
        <Input
          label="Sugar g / 100g"
          name={`${namePrefix}-sugar`}
          type="number"
          value={fields.sugar_g}
          onChange={(e) => onChange('sugar_g', e.target.value)}
        />
        <Input
          label="Sodium mg / 100g"
          name={`${namePrefix}-sodium`}
          type="number"
          value={fields.sodium_mg}
          onChange={(e) => onChange('sodium_mg', e.target.value)}
        />
        <Input
          label="Serving size (g)"
          name={`${namePrefix}-serving-size`}
          type="number"
          placeholder="e.g. 240"
          value={fields.serving_size_g || ''}
          onChange={(e) => onChange('serving_size_g', e.target.value)}
        />
        <Input
          label="Serving label (optional)"
          name={`${namePrefix}-serving-label`}
          placeholder='e.g. "1 scoop"'
          value={fields.serving_label || ''}
          onChange={(e) => onChange('serving_label', e.target.value)}
        />
      </div>
      {microCount > 0 && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          + {microCount} other nutrient{microCount === 1 ? '' : 's'} detected
        </div>
      )}
    </>
  )
}
