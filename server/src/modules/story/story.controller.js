import prisma from "../../config/prisma.js"

export const getStories = async (req, res, next) => {
  try {
    const stories = await prisma.story.findMany({
      where: { status: "approved" }, // Match schema StoryStatus
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
    
    const model = prisma.story || prisma.Story
    if (!model) {
       throw new Error("Story model not found in database client. Please redeploy server.")
    }

    const story = await model.create({
      data: {
        title,
        content,
        image,
        category,
        userId,
        guestName: userId ? null : name,
        guestEmail: userId ? null : email,
        status: "pending" // Admin must approve
      }
    })
    
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
