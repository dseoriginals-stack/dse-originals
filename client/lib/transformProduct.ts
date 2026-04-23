import { ProductFull, ProductCardType } from "@/types/product"

export function transformProductToCard(
  product: ProductFull
): ProductCardType {

  const p = product as any
  const variants = product.variants || []
  const variant = variants?.[0]

  // Improve image finding
  const image =
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
    
    price = prices.length > 0 ? Math.min(...prices) : Number(variant?.price || 0)
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
    variantId: p.variantId || variant?.id || "",
    isBestseller: !!p.isBestseller,
    isPopular: !!p.isPopular,
    description: product.description,
    variants
  }
}