import { ProductFull, ProductCardType } from "@/types/product"

export function transformProductToCard(
  product: ProductFull
): ProductCardType {

  const p = product as any
  
  // Sort variants (55ml -> 30ml -> Others)
  const variants = [...(product.variants || [])].sort((a, b) => {
    const getVal = (v: any) => 
      (v.attributes || []).find((at: any) => {
        const name = String(at.name || "").toLowerCase()
        return name === "volume" || name === "size" || name === "variant"
      })?.value?.toLowerCase() || ""
    
    const aVal = getVal(a)
    const bVal = getVal(b)
    
    if (aVal.includes("55ml") && !bVal.includes("55ml")) return -1
    if (!aVal.includes("55ml") && bVal.includes("55ml")) return 1
    if (aVal.includes("30ml") && !bVal.includes("30ml")) return -1
    if (!aVal.includes("30ml") && bVal.includes("30ml")) return 1
    return 0
  })

  const firstVariant = variants?.[0]

  // Improve image finding: Prioritize first variant image if it exists (usually 55ml)
  const image =
    firstVariant?.image ||
    p.image || 
    product.images?.find(i => i.isPrimary)?.url ||
    product.images?.[0]?.url ||
    null

  // Improve price finding (pick lowest active price if possible)
  let price = p.price !== undefined ? Number(p.price) : 0
  
  if (variants.length > 0) {
    const prices = variants.map(v => {
      const attrs = (v.attributes || []).map(a => (a.value || "").toLowerCase())
      if (attrs.some(a => a.includes("55ml"))) return 349
      if (attrs.some(a => a.includes("30ml"))) return 249
      return Number(v.price)
    }).filter(p => p > 0)
    
    price = prices.length > 0 ? Math.min(...prices) : Number(firstVariant?.price || 0)
  }

  // Calculate total stock
  const stock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image,
    price,
    stock,
    variantId: p.variantId || firstVariant?.id || "",
    isBestseller: !!p.isBestseller,
    isPopular: !!p.isPopular,
    description: product.description,
    category: product.category,
    variants
  }
}