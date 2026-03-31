import prisma from "../src/config/prisma.js"
import cloudinary from "../src/config/cloudinary.js"
import fs from "fs"
import path from "path"

const uploadsDir = path.resolve("uploads") // adjust if needed

async function migrate() {
  const products = await prisma.product.findMany({
    include: { images: true }
  })

  for (const product of products) {
    for (const img of product.images) {
      if (!img.url || img.url.startsWith("http")) continue

      try {
        const filename = img.url.replace(/^\/?uploads\//, "")
        const filePath = path.join(uploadsDir, filename)

        if (!fs.existsSync(filePath)) {
          console.log("❌ File missing:", filePath)
          continue
        }

        console.log("⬆️ Uploading:", filename)

        const result = await cloudinary.uploader.upload(filePath, {
          folder: "dse-products"
        })

        await prisma.productImage.update({
          where: { id: img.id },
          data: { url: result.secure_url }
        })

        console.log("✅ Migrated:", result.secure_url)

      } catch (err) {
        console.error("❌ Failed:", img.url, err.message)
      }
    }
  }

  console.log("🎉 Migration complete")
  process.exit()
}

migrate()