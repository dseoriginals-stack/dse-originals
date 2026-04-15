const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSizes() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: {
        include: {
          attributes: true
        }
      }
    }
  });

  for (const product of products) {
    if (!product.category) continue;

    let sizes = [];
    const catId = product.category.id.toLowerCase();
    
    if (catId === 'apparel' || catId === 'dsecollection') {
      sizes = ["XS", "S", "M", "L", "XL", "2XL"];
    } else if (catId === 'perfume') {
      sizes = ["30ml", "55ml"];
    } else {
      continue; // Skip unknown categories
    }

    // Check if the product already has size variants
    const hasSizeVariants = product.variants.some(v => 
      v.attributes.some(a => a.name === "Size")
    );

    if (hasSizeVariants) {
      console.log(`Skipping ${product.name} (already has sizes)`);
      continue;
    }

    const defaultVariant = product.variants[0];
    if (!defaultVariant) continue;

    const basePrice = defaultVariant.price;
    const baseStock = defaultVariant.stock;

    console.log(`Migrating ${product.name} to have sizes: ${sizes.join(', ')}`);

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      if (i === 0) {
        // Update the first existing variant to prevent foreign key issues
        await prisma.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            name: `Size ${size}`,
            attributes: {
              create: [
                {
                  name: "Size",
                  value: size
                }
              ]
            }
          }
        });
      } else {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: `SKU-${defaultVariant.sku}-${size}`, // Append size to base SKU
            name: `Size ${size}`,
            price: basePrice,
            stock: baseStock,
            attributes: {
              create: [
                {
                  name: "Size",
                  value: size
                }
              ]
            }
          }
        });
      }
    }
  }

  console.log("Migration complete.");
}

addSizes().catch(console.error).finally(() => prisma.$disconnect());
