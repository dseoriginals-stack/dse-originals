export type ProductVariant = {
  id: string
  price: number
  stock: number
  attributes: {
    name: string
    value: string
  }[]
}

export type ProductImage = {
  url: string
  isPrimary?: boolean
}

export type ProductFull = {
  id: string
  name: string
  slug: string
  description?: string
  status?: string
  isBestseller?: boolean
  category?: string
  tags?: string[]
  images: ProductImage[]
  variants: ProductVariant[]
}

export type ProductCardType = {
  id: string
  name: string
  price: number
  slug: string
  image: string | null
  variantId: string
  stock: number
  isBestseller?: boolean
  isPopular?: boolean
  description?: string
  variants?: ProductVariant[]
}