import prisma from "../../config/prisma.js"
import cloudinary from "../../config/cloudinary.js"
import { sendAdminStoryNotification } from "../../config/email.js"

export const getStories = async (req, res, next) => {
  try {
    const userId = req.user?.id || null

    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { status: "approved" },
          ...(userId ? [{ userId, status: "pending" }] : [])
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true }
        }
      }
    })
    res.json(stories)
  } catch (err) {
    next(err)
  }
}

export const createStory = async (req, res, next) => {
  try {
    const { title, content, image, category, name, email } = req.body
    const userId = req.user?.id || null
    
    // 1. Upload to Cloudinary if image is base64
    let imageUrl = image
    if (image && image.startsWith("data:image")) {
       try {
         const uploadRes = await cloudinary.uploader.upload(image, {
           folder: "stories",
           resource_type: "auto"
         })
         imageUrl = uploadRes.secure_url
       } catch (cloudinaryErr) {
         console.error("Cloudinary Upload Error:", cloudinaryErr)
         // Fallback to original image if upload fails
       }
    }

    const story = await prisma.story.create({
      data: {
        title,
        content,
        image: imageUrl,
        category: category || "General",
        userId,
        guestName: userId ? null : name,
        guestEmail: userId ? null : email,
        status: "pending" // Admin must approve
      }
    })

    // 2. Notify Admin
    try {
      await sendAdminStoryNotification(story)
    } catch (emailErr) {
      console.error("Failed to notify admin via email:", emailErr)
    }
    
    res.status(201).json(story)
  } catch (err) {
    next(err)
  }
}

export const getAdminStories = async (req, res, next) => {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    res.json(stories)
  } catch (err) {
    next(err)
  }
}

export const updateStoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const story = await prisma.story.update({
      where: { id },
      data: { status }
    })

    res.json(story)
  } catch (err) {
    next(err)
  }
}

export const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params
    await prisma.story.delete({ where: { id } })
    res.json({ message: "Story deleted" })
  } catch (err) {
    next(err)
  }
}

export const likeStory = async (req, res, next) => {
  try {
    const { id } = req.params
    const story = await prisma.story.update({
      where: { id },
      data: {
        likes: { increment: 1 }
      }
    })
    res.json({ likes: story.likes })
  } catch (err) {
    next(err)
  }
}
