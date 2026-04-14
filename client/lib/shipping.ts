/**
 * J&T Express Philippines — Zone-Based Shipping Rate Calculator
 * 
 * Origin: Chancery Compound, Rizal St, Tagum, Davao del Norte (Region XI)
 * 
 * Rates are approximate based on J&T PH published rate card (standard parcel ≤1kg).
 * All rates include a ₱15 surcharge as requested.
 */

export type ShippingZone = {
  zone: number
  label: string
  fee: number
  etaDays: string   // estimated transit days
  description: string
}

/**
 * Maps Philippine region keys → J&T shipping zone info.
 * Origin is Region XI (Davao Region, Mindanao).
 * Rates include a ₱15 per-region price adjustments.
 */
const REGION_ZONES: Record<string, ShippingZone> = {
  // ─── ZONE 1: Same Region (Davao) ─────────────────────────────
  "XI": {
    zone: 1,
    label: "Davao Region",
    fee: 100, // 85 + 15
    etaDays: "1–2",
    description: "Within Davao Region"
  },

  // ─── ZONE 2: Nearby Mindanao ──────────────────────────────────
  "IX": {
    zone: 2,
    label: "Zamboanga Peninsula",
    fee: 130, // 115 + 15
    etaDays: "2–3",
    description: "Zamboanga Peninsula (Region IX)"
  },
  "X": {
    zone: 2,
    label: "Northern Mindanao",
    fee: 130, // 115 + 15
    etaDays: "2–3",
    description: "Northern Mindanao (Region X)"
  },
  "XII": {
    zone: 2,
    label: "SOCCSKSARGEN",
    fee: 125, // 110 + 15
    etaDays: "1–2",
    description: "SOCCSKSARGEN (Region XII)"
  },
  "XIII": {
    zone: 2,
    label: "Caraga",
    fee: 130, // 115 + 15
    etaDays: "2–3",
    description: "Caraga (Region XIII)"
  },
  "ARMM": {
    zone: 2,
    label: "BARMM / ARMM",
    fee: 155, // 140 + 15
    etaDays: "3–5",
    description: "Bangsamoro Autonomous Region"
  },

  // ─── ZONE 3: Visayas ──────────────────────────────────────────
  "VI": {
    zone: 3,
    label: "Western Visayas",
    fee: 180, // 165 + 15
    etaDays: "3–5",
    description: "Western Visayas (Region VI)"
  },
  "VII": {
    zone: 3,
    label: "Central Visayas",
    fee: 180, // 165 + 15
    etaDays: "3–5",
    description: "Central Visayas (Region VII)"
  },
  "VIII": {
    zone: 3,
    label: "Eastern Visayas",
    fee: 190, // 175 + 15
    etaDays: "4–6",
    description: "Eastern Visayas (Region VIII)"
  },

  // ─── ZONE 4: Luzon ────────────────────────────────────────────
  "NCR": {
    zone: 4,
    label: "Metro Manila",
    fee: 225, // 210 + 15
    etaDays: "5–7",
    description: "National Capital Region"
  },
  "CAR": {
    zone: 4,
    label: "Cordillera (CAR)",
    fee: 240, // 225 + 15
    etaDays: "6–8",
    description: "Cordillera Administrative Region"
  },
  "I": {
    zone: 4,
    label: "Ilocos Region",
    fee: 230, // 215 + 15
    etaDays: "6–8",
    description: "Region I — Ilocos Region"
  },
  "II": {
    zone: 4,
    label: "Cagayan Valley",
    fee: 235, // 220 + 15
    etaDays: "6–8",
    description: "Region II — Cagayan Valley"
  },
  "III": {
    zone: 4,
    label: "Central Luzon",
    fee: 225, // 210 + 15
    etaDays: "5–7",
    description: "Region III — Central Luzon"
  },
  "IV-A": {
    zone: 4,
    label: "CALABARZON",
    fee: 225, // 210 + 15
    etaDays: "5–7",
    description: "Region IV-A — CALABARZON"
  },
  "IV-B": {
    zone: 4,
    label: "MIMAROPA",
    fee: 255, // 240 + 15
    etaDays: "7–10",
    description: "Region IV-B — MIMAROPA (island areas)"
  },
  "V": {
    zone: 4,
    label: "Bicol Region",
    fee: 230, // 215 + 15
    etaDays: "6–8",
    description: "Region V — Bicol Region"
  },
}

/** Fallback for any unknown region */
const FALLBACK_ZONE: ShippingZone = {
  zone: 5,
  label: "Remote Area",
  fee: 275, // 260 + 15
  etaDays: "7–14",
  description: "Remote or island area — additional charges may apply"
}

/**
 * Get J&T shipping zone and fee for a given region key.
 * @param regionKey — the `r.key` value from the `philippines` npm package
 */
export function getShippingRate(regionKey: string): ShippingZone {
  return REGION_ZONES[regionKey] ?? FALLBACK_ZONE
}
