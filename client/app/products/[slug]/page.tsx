import type { Metadata, ResolvingMetadata } from 'next'
import ProductClient from "./ProductClient"
import { getImageUrl } from "@/lib/image"

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dseoriginals.com'

  try {
    const res = await fetch(`${apiUrl}/api/products/slug/${slug}`, {
      next: { revalidate: 3600 } 
    })
    
    if (!res.ok) throw new Error("Product fetch failed")
    const product = await res.json()

    const title = `${product.name} | DSE Originals`
    const description = product.description?.substring(0, 160) || `Experience premium quality with ${product.name} from DSE Originals.`
    
    // ✅ Ensure high-quality absolute URL for social media
    let imageUrl = ""
    const primaryImage = product.images?.[0]?.url || product.variants?.find((v: any) => v.image)?.image
    
    if (primaryImage) {
      imageUrl = getImageUrl(primaryImage)
      
      // ✅ Force absolute URL using the main domain for social media
      // This solves issues where crawlers might be blocked from the API subdomain
      if (imageUrl.startsWith('http')) {
        imageUrl = imageUrl.replace('https://api.dseoriginals.com', 'https://www.dseoriginals.com')
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://www.dseoriginals.com${imageUrl}`
      }

      // ✅ High-quality Cloudinary transformation
      if (imageUrl.includes('cloudinary.com')) {
        if (imageUrl.includes('/upload/')) {
          imageUrl = imageUrl.replace('/upload/', '/upload/w_1200,h_630,c_fill,g_auto,f_jpg/')
        } else {
          // Fallback if /upload/ is missing for some reason
          imageUrl += '?w=1200&h=630&c=fill'
        }
      }
    } else {
      // Fallback to a branded social share image if the product has no images
      imageUrl = `https://www.dseoriginals.com/DSEoriginals.png`
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.dseoriginals.com/products/${slug}`,
        siteName: 'DSE Originals',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        locale: 'en_PH',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    }
  } catch (err) {
    return {
      title: 'DSE Originals | Premium Collection',
      description: 'Handcrafted excellence for your lifestyle.',
      openGraph: {
        images: [`https://www.dseoriginals.com/DSEoriginals.png`]
      }
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const slug = params.slug
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dseoriginals.com'

  let initialProduct = null
  try {
    const res = await fetch(`${apiUrl}/api/products/slug/${slug}`, {
      next: { revalidate: 60 } 
    })
    if (res.ok) initialProduct = await res.json()
  } catch (err) {
    console.error("Server fetch failed", err)
  }

  return <ProductClient initialProduct={initialProduct} />
}