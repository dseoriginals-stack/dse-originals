import redis from "../config/redis.js"
import logger from "../config/logger.js"

/*
--------------------------------
GET CACHE
--------------------------------
*/

export async function getCache(key) {
  try {
    if (redis.status !== "ready") return null

    const data = await redis.get(key)
    if (!data) return null

    return JSON.parse(data)
  } catch (err) {
    logger.warn(`Cache GET error for ${key}: ${err.message}`)
    return null
  }
}

/*
--------------------------------
SET CACHE
--------------------------------
*/

export async function setCache(key, value, ttl = 120) {
  try {
    if (redis.status !== "ready") return

    await redis.set(
      key,
      JSON.stringify(value),
      "EX",
      ttl
    )
  } catch (err) {
    logger.warn(`Cache SET error for ${key}: ${err.message}`)
  }
}

/*
--------------------------------
DELETE CACHE PATTERN
--------------------------------
*/

export async function deleteByPattern(pattern) {
  try {
    if (redis.status !== "ready") return

    const keys = await redis.keys(pattern)
    if (!keys.length) return

    await redis.del(keys)
  } catch (err) {
    logger.warn(`Cache DELETE error for pattern ${pattern}: ${err.message}`)
  }
}