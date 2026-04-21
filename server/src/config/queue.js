import connection from "./redis.js"

// Queue disabled for development

export const emailQueue = null
export const orderQueue = null

export default connection