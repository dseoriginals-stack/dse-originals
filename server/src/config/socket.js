import { Server } from "socket.io"
import logger from "./logger.js"

let io

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  io.on("connection", (socket) => {
    logger.info(`Socket Connected: ${socket.id}`)

    // Join admin room if requested
    socket.on("join-admin", () => {
      socket.join("admin-room")
      logger.info(`Socket ${socket.id} joined admin-room`)
    })

    socket.on("disconnect", () => {
      logger.info(`Socket Disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!")
  }
  return io
}

/**
 * Sends a real-time notification to all admin/staff users.
 */
export const notifyAdmins = (event, data) => {
  if (io) {
    io.to("admin-room").emit(event, data)
  }
}
