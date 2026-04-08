/**
 * J&T Express Philippines — Zone-Based Shipping Rate Calculator
 * 
 * Origin: Chancery Compound, Rizal St, Tagum, Davao del Norte (Region XI)
 * 
 * Rates are approximate based on J&T PH published rate card (standard parcel ≤1kg).
 * Source: J&T Express Philippines standard domestic rates.
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
 */
const REGION_ZONES: Record<string, ShippingZone> = {
  // ─── ZONE 1: Same Region (Davao) ─────────────────────────────
  "XI": {
    zone: 1,
    label: "Davao Region",
    fee: 85,
    etaDays: "1–2",
    description: "Within Davao Region"
  },

  // ─── ZONE 2: Nearby Mindanao ──────────────────────────────────
  "IX": {
    zone: 2,
    label: "Zamboanga Peninsula",
    fee: 115,
    etaDays: "2–3",
    description: "Zamboanga Peninsula (Region IX)"
  },
  "X": {
    zone: 2,
    label: "Northern Mindanao",
    fee: 115,
    etaDays: "2–3",
    description: "Northern Mindanao (Region X)"
  },
  "XII": {
    zone: 2,
    label: "SOCCSKSARGEN",
    fee: 110,
    etaDays: "1–2",
    description: "SOCCSKSARGEN (Region XII)"
  },
  "XIII": {
    zone: 2,
    label: "Caraga",
    fee: 115,
    etaDays: "2–3",
    description: "Caraga (Region XIII)"
  },
  "ARMM": {
    zone: 2,
    label: "BARMM / ARMM",
    fee: 140,
    etaDays: "3–5",
    description: "Bangsamoro Autonomous Region"
  },

  // ─── ZONE 3: Visayas ──────────────────────────────────────────
  "VI": {
    zone: 3,
    label: "Western Visayas",
    fee: 165,
    etaDays: "3–5",
    description: "Western Visayas (Region VI)"
  },
  "VII": {
    zone: 3,
    label: "Central Visayas",
    fee: 165,
    etaDays: "3–5",
    description: "Central Visayas (Region VII)"
  },
  "VIII": {
    zone: 3,
    label: "Eastern Visayas",
    fee: 175,
    etaDays: "4–6",
    description: "Eastern Visayas (Region VIII)"
  },

  // ─── ZONE 4: Luzon ────────────────────────────────────────────
  "NCR": {
    zone: 4,
    label: "Metro Manila",
    fee: 210,
    etaDays: "5–7",
    description: "National Capital Region"
  },
  "CAR": {
    zone: 4,
    label: "Cordillera (CAR)",
    fee: 225,
    etaDays: "6–8",
    description: "Cordillera Administrative Region"
  },
  "I": {
    zone: 4,
    label: "Ilocos Region",
    fee: 215,
    etaDays: "6–8",
    description: "Region I — Ilocos Region"
  },
  "II": {
    zone: 4,
    label: "Cagayan Valley",
    fee: 220,
    etaDays: "6–8",
    description: "Region II — Cagayan Valley"
  },
  "III": {
    zone: 4,
    label: "Central Luzon",
    fee: 210,
    etaDays: "5–7",
    description: "Region III — Central Luzon"
  },
  "IV-A": {
    zone: 4,
    label: "CALABARZON",
    fee: 210,
    etaDays: "5–7",
    description: "Region IV-A — CALABARZON"
  },
  "IV-B": {
    zone: 4,
    label: "MIMAROPA",
    fee: 240,
    etaDays: "7–10",
    description: "Region IV-B — MIMAROPA (island areas)"
  },
  "V": {
    zone: 4,
    label: "Bicol Region",
    fee: 215,
    etaDays: "6–8",
    description: "Region V — Bicol Region"
  },
}

/** Fallback for any unknown region */
const FALLBACK_ZONE: ShippingZone = {
  zone: 5,
  label: "Remote Area",
  fee: 260,
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
