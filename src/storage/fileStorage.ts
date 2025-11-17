import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Thư mục lưu data
const DATA_DIR = path.join(__dirname, '..', '..', 'data')

// Đảm bảo thư mục data tồn tại
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Lấy đường dẫn file từ apiKey
function getFilePath(apiKey: string): string {
  // Sanitize apiKey để tạo filename an toàn
  const safeKey = apiKey.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(DATA_DIR, `${safeKey}.json`)
}

// Lưu hoặc cập nhật data cho apiKey
export async function saveData(apiKey: string, bodyData: any): Promise<{ apiKey: string, bodyData: any, updatedAt: string }> {
  await ensureDataDir()
  
  const filePath = getFilePath(apiKey)
  const data = {
    apiKey,
    bodyData,
    updatedAt: new Date().toISOString()
  }
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  return data
}

// Đọc data từ apiKey
export async function getData(apiKey: string): Promise<{ apiKey: string, bodyData: any, updatedAt: string } | null> {
  const filePath = getFilePath(apiKey)
  
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null // File không tồn tại
    }
    throw error
  }
}

// Lấy tất cả data
export async function getAllData(): Promise<Array<{ apiKey: string, bodyData: any, updatedAt: string }>> {
  await ensureDataDir()
  
  const files = await fs.readdir(DATA_DIR)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  
  const allData = await Promise.all(
    jsonFiles.map(async (file) => {
      const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8')
      return JSON.parse(content)
    })
  )
  
  // Sắp xếp theo updatedAt mới nhất
  return allData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

// Xóa data
export async function deleteData(apiKey: string): Promise<boolean> {
  const filePath = getFilePath(apiKey)
  
  try {
    await fs.unlink(filePath)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}
