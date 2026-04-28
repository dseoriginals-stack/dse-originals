import redis from './src/config/redis.js'

async function clear() {
  try {
    const keys = await redis.keys('*')
    if (keys.length > 0) {
      await redis.del(keys)
      console.log('✅ Cache cleared:', keys.length, 'keys removed')
    } else {
      console.log('ℹ️ Cache already empty')
    }
  } catch (err) {
    console.error('❌ Failed to clear cache:', err)
  } finally {
    process.exit()
  }
}

clear()
