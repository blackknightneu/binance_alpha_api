import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { saveData, getData, getAllData, deleteData } from './storage/upstashStorage.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Enable CORS cho tất cả origins
app.use(cors())

// Parse JSON body with 50mb limit
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// POST endpoint - Insert or Update data with apiKey and bodyData
app.post('/api/data', async (req, res) => {
  try {
    const { apiKey, bodyData } = req.body

    if (!apiKey || !bodyData) {
      return res.status(400).json({ 
        error: 'apiKey and bodyData are required' 
      })
    }

    // Lưu data vào file JSON (tự động update nếu file đã tồn tại)
    const savedData = await saveData(apiKey, bodyData)

    res.status(200).json({
      success: true,
      message: 'Data saved successfully',
      data: savedData
    })
  } catch (error) {
    console.error('Error saving data:', error)
    res.status(500).json({ 
      error: 'Failed to save data',
      details: error.message 
    })
  }
})

// GET endpoint - Retrieve data by apiKey (optional query parameter)
app.get('/api/data', async (req, res) => {
  try {
    const { apiKey } = req.query

    if (apiKey) {
      // Lấy data của apiKey cụ thể
      const data = await getData(apiKey as string)
      
      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Data not found for this apiKey'
        })
      }

      return res.status(200).json({
        success: true,
        data
      })
    }

    // Lấy tất cả data
    const allData = await getAllData()

    res.status(200).json({
      success: true,
      count: allData.length,
      data: allData
    })
  } catch (error) {
    console.error('Error retrieving data:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve data',
      details: error.message 
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`API endpoints:`)
  console.log(`  POST http://localhost:${PORT}/api/data`)
  console.log(`  GET  http://localhost:${PORT}/api/data`)
  console.log(`Storage: Upstash Redis`)
})

export default app

