export type ProductVariant = {
  id: string
  price: number
  stock: number
  image?: string | null
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
  isPopular?: boolean
  category?: string
  categoryId?: string
  tags?: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  videoUrl?: string
  storyHtml?: string
}

export type ProductCardType = {
  id: string
  name: string
  price: number
  slug: string
  image: string | null
  variantId: string
  stock: number
  category?: string
  isBestseller?: boolean
  isPopular?: boolean
  description?: string
  variants?: ProductVariant[]
}