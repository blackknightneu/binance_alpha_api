import { Redis } from '@upstash/redis'

// Lazy initialization - chỉ tạo Redis client khi cần
let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (!url || !token) {
      throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in environment variables')
    }
    
    redis = new Redis({ url, token })
  }
  return redis
}

// Lưu data
export async function saveData(apiKey: string, bodyData: any) {
  const data = {
    apiKey,
    bodyData,
    updatedAt: new Date().toISOString()
  }
  
  // Upstash tự động handle JSON, không cần stringify
  await getRedis().set(`data:${apiKey}`, data)
  return data
}

// Lấy data theo apiKey
export async function getData(apiKey: string) {
  const data = await getRedis().get(`data:${apiKey}`)
  return data || null
}

// Lấy tất cả data
export async function getAllData() {
  const keys = await getRedis().keys('data:*')
  const allData = []
  
  for (const key of keys) {
    const data = await getRedis().get(key)
    if (data) {
      allData.push(data)
    }
  }
  
  return allData.sort((a: any, b: any) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

// Xóa data
export async function deleteData(apiKey: string) {
  const result = await getRedis().del(`data:${apiKey}`)
  return result > 0
}
