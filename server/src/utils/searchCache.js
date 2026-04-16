import redis from "../config/redis.js"

/*
-----------------------------------
GET CACHE
-----------------------------------
*/

export const getCache = async (key) => {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    return null
  }
}

/*
-----------------------------------
SET CACHE
-----------------------------------
*/

export const setCache = async (key, value, ttl = 60) => {
  try {
    await redis.set(
      key,
      JSON.stringify(value),
      "EX",
      ttl
    )
  } catch {}
}

/*
-----------------------------------
DELETE CACHE (PATTERN)
-----------------------------------
*/

export const deleteCache = async (pattern) => {
  if (!redis) return

  try {
    const keys = await redis.keys(pattern)

    if (keys && keys.length > 0) {
      console.log(`🧹 CACHE: Clearing ${keys.length} keys for [${pattern}]`)
      await redis.del(keys)
    } else {
      console.log(`ℹ️ CACHE: No keys found for pattern [${pattern}]`)
    }
  } catch (err) {
    console.error(`❌ CACHE ERROR [${pattern}]:`, err)
  }
}