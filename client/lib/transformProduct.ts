import { ProductFull, ProductCardType } from "@/types/product"

export function transformProductToCard(
  product: ProductFull
): ProductCardType {
  const image =
    product.images?.find(i => i.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png"

  const price =
    product.variants?.length > 0
      ? Number(product.variants[0].price)
      : 0

  const variant = product.variants?.[0]

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image,
    price,
    variantId: variant?.id || ""
  }
}