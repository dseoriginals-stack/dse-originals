// import prisma from "../../config/prisma.js"
// import bcrypt from "bcryptjs"
// import jwt from "jsonwebtoken"

// const JWT_SECRET = process.env.JWT_SECRET || "secret"

// // ✅ FIX: environment-aware cookies
// const isProd = process.env.NODE_ENV === "production"

// const cookieOptions = {
//   httpOnly: true,
//   secure: true,
//   sameSite: "none",
// }

// /*
// =========================
// LOGIN
// =========================
// */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const user = await prisma.user.findUnique({
//       where: { email }
//     })

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" })
//     }

//     const valid = await bcrypt.compare(password, user.password)

//     if (!valid) {
//       return res.status(401).json({ message: "Invalid credentials" })
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     )

//     // ✅ FIXED COOKIE
//     res.cookie("token", token, cookieOptions)
//     res.cookie("role", user.role, cookieOptions)

//     res.json({
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         name: user.name,
//         phone: user.phone,
//         luckyPoints: user.luckyPoints
//       }
//     })

//   } catch (err) {
//     console.error("❌ LOGIN ERROR:", err)
//     res.status(500).json({ message: "Login failed" })
//   }
// }

// /*
// =========================
// REGISTER
// =========================
// */
// export const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body

//     const existing = await prisma.user.findUnique({
//       where: { email }
//     })

//     if (existing) {
//       return res.status(400).json({ message: "Email already exists" })
//     }

//     const hashed = await bcrypt.hash(password, 10)

//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashed,
//         role: "user"
//       }
//     })

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     )

//     // ✅ FIXED COOKIE
//     res.cookie("token", token, cookieOptions)
//     res.cookie("role", user.role, cookieOptions)

//     res.json({
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         name: user.name
//       }
//     })

//   } catch (err) {
//     console.error("❌ REGISTER ERROR:", err)
//     res.status(500).json({ message: "Register failed" })
//   }
// }

// /*
// =========================
// SYNC (VERY IMPORTANT)
// =========================
// */
// export const sync = async (req, res) => {
//   try {
//     const token = req.cookies.token

//     if (!token) {
//       return res.status(401).json({ message: "No session" })
//     }

//     const decoded = jwt.verify(token, JWT_SECRET)

//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId }
//     })

//     if (!user) {
//       return res.status(401).json({ message: "User not found" })
//     }

//     res.json({
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         name: user.name,
//         phone: user.phone,
//         luckyPoints: user.luckyPoints
//       }
//     })

//   } catch (err) {
//     console.error("❌ SYNC ERROR:", err)
//     res.status(401).json({ message: "Invalid session" })
//   }
// }

// /*
// =========================
// LOGOUT
// =========================
// */
// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", cookieOptions)
//     res.clearCookie("role", cookieOptions)

//     res.json({ message: "Logged out" })
//   } catch (err) {
//     console.error("❌ LOGOUT ERROR:", err)
//     res.status(500).json({ message: "Logout failed" })
//   }
// }