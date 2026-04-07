import multer from "multer"
import path from "path"
import fs from "fs"

// Ensure uploads folder exists
const uploadDir = "uploads"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext
    cb(null, uniqueName)
  }
})

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false)
    }

    cb(null, true)
  }
})