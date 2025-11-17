# Binance Alpha API

API để insert và lấy dữ liệu từ MongoDB với apiKey và bodyData.

## Cài đặt

```bash
npm install
```

## Cấu hình

1. Copy file `.env.example` thành `.env`:
```bash
copy .env.example .env
```

2. Cập nhật `MONGODB_URI` trong file `.env` với connection string MongoDB của bạn.

## API Endpoints

### POST /api/data
Insert data vào MongoDB với apiKey và bodyData.

**Request Body:**
```json
{
  "apiKey": "your-api-key",
  "bodyData": {
    "any": "data",
    "you": "want"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data inserted successfully",
  "data": {
    "_id": "...",
    "apiKey": "your-api-key",
    "bodyData": {...},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### GET /api/data
Lấy tất cả data hoặc filter theo apiKey.

**Query Parameters (optional):**
- `apiKey`: Filter data theo apiKey cụ thể

**Examples:**
```bash
# Lấy tất cả data
GET /api/data

# Lấy data theo apiKey
GET /api/data?apiKey=your-api-key
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "apiKey": "your-api-key",
      "bodyData": {...},
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

## Testing với cURL

**POST request:**
```bash
curl -X POST http://localhost:3000/api/data ^
  -H "Content-Type: application/json" ^
  -d "{\"apiKey\":\"test-key-123\",\"bodyData\":{\"symbol\":\"BTCUSDT\",\"price\":50000}}"
```

**GET request (all data):**
```bash
curl http://localhost:3000/api/data
```

**GET request (filter by apiKey):**
```bash
curl "http://localhost:3000/api/data?apiKey=test-key-123"
```

## Cấu trúc Project

```
src/
  ├── index.ts          # Main Express app with API endpoints
  ├── db/
  │   └── connection.ts # MongoDB connection
  └── models/
      └── Data.ts       # Mongoose schema and model
```
