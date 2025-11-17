import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { connectDB } from './db/connection.js'
import { Data } from './models/Data.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

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

    // Tìm và update nếu apiKey đã tồn tại, hoặc tạo mới nếu chưa có
    const updatedData = await Data.findOneAndUpdate(
      { apiKey },
      { bodyData },
      { 
        new: true,        // Trả về document sau khi update
        upsert: true,     // Tạo mới nếu không tìm thấy
        runValidators: true
      }
    )

    res.status(200).json({
      success: true,
      message: updatedData.isNew ? 'Data created successfully' : 'Data updated successfully',
      data: updatedData
    })
  } catch (error) {
    console.error('Error upserting data:', error)
    res.status(500).json({ 
      error: 'Failed to upsert data',
      details: error.message 
    })
  }
})

// GET endpoint - Retrieve data by apiKey (optional query parameter)
app.get('/api/data', async (req, res) => {
  try {
    const { apiKey } = req.query

    let query = {}
    if (apiKey) {
      query = { apiKey }
    }

    const data = await Data.find(query).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    console.error('Error retrieving data:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve data',
      details: error.message 
    })
  }
})

// Connect to MongoDB
connectDB()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`API endpoints:`)
  console.log(`  POST http://localhost:${PORT}/api/data`)
  console.log(`  GET  http://localhost:${PORT}/api/data`)
})

export default app
