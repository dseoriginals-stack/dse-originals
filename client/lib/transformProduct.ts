import { ProductFull, ProductCardType } from "@/types/product"

export function transformProductToCard(
  product: ProductFull
): ProductCardType {

  const p = product as any // ✅ allow mixed API shapes
  const variant = product.variants?.[0]

  const image =
    p.image || // from /products
    product.images?.find(i => i.isPrimary)?.url ||
    product.images?.[0]?.url ||
    null

  const price =
    p.price !== undefined
      ? Number(p.price)
      : Number(variant?.price || 0)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image,
    price,
    variantId: variant?.id || ""
  }
}