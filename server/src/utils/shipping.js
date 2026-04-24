const REGION_ZONES = {
  "XI": 100,
  "IX": 130,
  "X": 130,
  "XII": 125,
  "XIII": 130,
  "ARMM": 155,
  "VI": 180,
  "VII": 180,
  "VIII": 190,
  "NCR": 225,
  "CAR": 240,
  "I": 230,
  "II": 235,
  "III": 225,
  "IV-A": 225,
  "IV-B": 255,
  "V": 230,
}

const FALLBACK_FEE = 275

/**
 * Get base shipping fee for a region.
 */
export function getBaseShippingFee(region) {
  return REGION_ZONES[region] || FALLBACK_FEE
}

/**
 * Calculates estimated weight in KG.
 */
export function calculateOrderWeight(items) {
  let grams = 0
  for (const item of items) {
    const cat = (item.category || "").toLowerCase()
    const qty = item.quantity || 1
    
    if (cat === 'perfume') {
      const volAttr = (item.attributes || []).find(a => (a.name || "").toLowerCase().includes('volume'))
      const ml = parseInt(volAttr?.value || "55") || 55
      grams += ml * qty
    } else if (cat === 'apparel') {
      grams += 250 * qty
    } else {
      grams += 200 * qty
    }
  }
  return grams / 1000
}

/**
 * Final calculation based on weight.
 */
export function calculateFinalShippingFee(baseFee, weightKg) {
  if (weightKg <= 1) return baseFee
  const extraKg = Math.ceil(weightKg - 1)
  return baseFee + (extraKg * 45)
}
