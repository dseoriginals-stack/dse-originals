import prisma from "../config/prisma.js"
import generateSlug from "../utils/slugify.js"

/* =========================
   GET
========================= */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" }
  })
}

/* =========================
   CREATE
========================= */
export async function createCategory(data) {
  const slug = await generateSlug(data.name)

  return prisma.category.create({
    data: {
      name: data.name,
      slug
    }
  })
}

/* =========================
   DELETE
========================= */
export async function deleteCategory(id) {
  return prisma.category.delete({
    where: { id }
  })
}