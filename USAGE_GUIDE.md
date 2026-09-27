# 🚀 Hướng Dẫn Sử Dụng - Mô Hình MQTT + MongoDB + RESTHeart

## 📋 Mục lục

1. [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
2. [Cài đặt và chạy](#-cài-đặt-và-chạy)
3. [Kiểm tra hoạt động](#-kiểm-tra-hoạt-động)
4. [API Reference](#-api-reference)
5. [Troubleshooting](#-troubleshooting)

---

## 🏗️ Tổng quan kiến trúc

### Luồng dữ liệu

```
┌──────────────┐
│   Publisher  │ ──MQTT Publish──┐
│   (Python)   │                 │
└──────────────┘                 │
                                 ▼
                    ┌────────────────────────┐
                    │     RESTHeart          │
                    │  ┌──────────────────┐  │
                    │  │  MQTT Broker     │  │
                    │  │  (Port 1883)     │  │
                    │  └────────┬─────────┘  │
                    │           │            │
                    │           ▼            │
                    │  ┌──────────────────┐  │
                    │  │  Auto-store      │  │
                    │  └────────┬─────────┘  │
                    └───────────┼────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ MongoDB  │ │ REST API │ │ Frontend │
              │ (Data)   │ │ (Query)  │ │ (Subscribe)│
              └──────────┘ └──────────┘ └──────────┘
```

### Components

| Component | Vai trò | Port |
|-----------|---------|------|
| **Publisher** | Publish market data | - |
| **RESTHeart** | MQTT Broker + REST API | 1884 (MQTT), 8080 (REST) |
| **MongoDB** | Store time-series data | 27017 |
| **Frontend** | Subscribe & display | 3000 |

---

## 🛠️ Cài đặt và chạy

### Cách 1: Docker Compose (Khuyến nghị)

```bash
# 1. Clone project
git clone <repo-url>
cd market-monitor

# 2. Start all services
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

**Services sẽ chạy:**
- ✅ MongoDB (port 27017)
- ✅ RESTHeart MQTT Broker (port 1884, 8884)
- ✅ RESTHeart REST API (port 8080)
- ✅ MQTT Publisher (auto-publish)
- ✅ Frontend Dashboard (port 3000)

### Cách 2: Manual Setup

#### Bước 1: Start MongoDB

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=restheart \
  mongo:7.0
```

#### Bước 2: Start RESTHeart

```bash
docker run -d \
  --name restheart \
  -p 8080:8080 \
  -p 1884:1883 \
  -p 8884:8883 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/restheart \
  -v $(pwd)/restheart-config:/opt/restheart/etc/custom \
  softinstigate/restheart:latest
```

#### Bước 3: Run Publisher

```bash
cd publisher
pip install -r requirements.txt
python publisher.py
```

#### Bước 4: Start Frontend

```bash
npm install
npm run dev
```

---

## 🔍 Kiểm tra hoạt động

### 1. Kiểm tra Publisher

```bash
# Xem logs
docker-compose logs -f publisher

# Output:
# [MQTT Publisher] Connected to restheart:1883
# [PUBLISH] /market/stocks/vn-index → VN-Index: 1250.45
# [PUBLISH] /market/crypto/btc → BTC: $67500.00
```

### 2. Kiểm tra MQTT Broker (RESTHeart)

#### Cách 1: Dùng mosquitto_sub

```bash
# Install mosquitto clients
# macOS: brew install mosquitto
# Ubuntu: sudo apt install mosquitto-clients

# Subscribe to all topics
mosquitto_sub -h localhost -p 1884 -t "/market/#" -v

# Output:
# /market/stocks/vn-index {"symbol":"VN-Index","price":1250.45,...}
# /market/crypto/btc {"symbol":"BTC","price":67500.00,...}
```

#### Cách 2: Dùng MQTT Explorer

1. Download: https://mqtt-explorer.com/
2. Connect: `ws://localhost:8884/mqtt`
3. Subscribe: `/market/#`
4. See real-time messages

### 3. Kiểm tra MongoDB

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh

# Switch to database
use restheart

# Check collections
show collections

# Query recent data
db.market_data.find().sort({timestamp: -1}).limit(5)

# Count documents
db.market_data.countDocuments()

# Check data by topic
db.market_data.find({topic: "/market/stocks/vn-index"}).sort({timestamp: -1}).limit(3)
```

**Output:**
```json
{
  "_id": ObjectId("..."),
  "topic": "/market/stocks/vn-index",
  "payload": {
    "symbol": "VN-Index",
    "price": 1250.45,
    "change": 5.23,
    "changePercent": 0.42,
    "volume": 450000000,
    "timestamp": 1704067200000
  },
  "timestamp": ISODate("2024-01-01T00:00:00Z")
}
```

### 4. Kiểm tra REST API

```bash
# Get all data
curl http://localhost:8080/market_data

# Filter by topic
curl "http://localhost:8080/market_data?filter={\"topic\":\"/market/stocks/vn-index\"}"

# Filter by time range
curl "http://localhost:8080/market_data?filter={\"timestamp\":{\"$gt\":1704067200000}}"

# Sort by timestamp (descending)
curl "http://localhost:8080/market_data?sort={\"timestamp\":-1}&limit=10"

# Get latest price for each symbol
curl "http://localhost:8080/market_data/aggregate" \
  -H "Content-Type: application/json" \
  -d '{
    "aggregate": {
      "$group": {
        "_id": "$payload.symbol",
        "latestPrice": { "$last": "$payload.price" },
        "lastUpdate": { "$max": "$timestamp" }
      }
    }
  }'
```

### 5. Kiểm tra Frontend

```bash
# Open browser
http://localhost:3000

# Open DevTools (F12)
# Console tab:
# [MQTT] Connected (simulation mode)
# [MQTT] Subscribed to /market/stocks/vn-index
# [MQTT] Received: VN-Index: 1250.45
```

---

## 📡 API Reference

### REST API Endpoints

#### GET /market_data

Query historical market data.

**Parameters:**
- `filter` (JSON): MongoDB query filter
- `sort` (JSON): Sort order
- `limit` (number): Max results
- `skip` (number): Offset

**Examples:**

```bash
# Get all records
curl http://localhost:8080/market_data

# Filter by topic
curl "http://localhost:8080/market_data?filter={\"topic\":\"/market/stocks/vn-index\"}"

# Filter by time range
curl "http://localhost:8080/market_data?filter={\"timestamp\":{\"$gt\":1704067200000}}"

# Sort and limit
curl "http://localhost:8080/market_data?sort={\"timestamp\":-1}&limit=100"
```

#### POST /market_data

Insert data manually (if needed).

```bash
curl -X POST http://localhost:8080/market_data \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "/market/stocks/vn-index",
    "payload": {
      "symbol": "VN-Index",
      "price": 1250.45,
      "change": 5.23,
      "changePercent": 0.42,
      "volume": 450000000,
      "timestamp": 1704067200000
    }
  }'
```

#### DELETE /market_data/{id}

Delete specific record.

```bash
curl -X DELETE http://localhost:8080/market_data/{id}
```

---

## 🐛 Troubleshooting

### Lỗi: Publisher không kết nối được

```bash
# Kiểm tra RESTHeart đang chạy
docker-compose ps restheart

# Kiểm tra logs
docker-compose logs restheart

# Restart RESTHeart
docker-compose restart restheart
```

### Lỗi: MongoDB không lưu data

```bash
# Kiểm tra MongoDB connection
docker-compose exec mongodb mongosh
> db.runCommand({ ping: 1 })

# Kiểm tra RESTHeart config
cat restheart-config/mqtt.properties | grep mongo

# Restart services
docker-compose restart mongodb restheart
```

### Lỗi: Frontend không nhận data

```bash
# Kiểm tra browser console (F12)
# Xem có lỗi WebSocket không

# Kiểm tra MQTT broker
mosquitto_sub -h localhost -p 1884 -t "/market/#" -v

# Nếu không có data → Publisher chưa chạy
docker-compose logs publisher
```

### Lỗi: Port conflict

```bash
# Kiểm tra port đang dùng
netstat -ano | findstr :1884
netstat -ano | findstr :8884
netstat -ano | findstr :3000

# Đổi port trong docker-compose.yml
# Hoặc dừng process chiếm port
taskkill /PID <PID> /F
```

### Lỗi: RESTHeart không start

```bash
# Kiểm tra logs
docker-compose logs restheart

# Kiểm tra config
cat restheart-config/mqtt.properties

# Restart với config mới
docker-compose down
docker-compose up -d --build
```

---

## 📊 MQTT Topics

### Stock Market

| Topic | Symbol | Description |
|-------|--------|-------------|
| `/market/stocks/vn-index` | VN-Index | Vietnam Stock Index |
| `/market/stocks/hnx-index` | HNX-Index | Hanoi Stock Index |
| `/market/stocks/vn30` | VN30 | Top 30 VN Stocks |
| `/market/stocks/upcom` | UPCOM | Unlisted Companies |

### Cryptocurrency

| Topic | Symbol | Description |
|-------|--------|-------------|
| `/market/crypto/btc` | BTC | Bitcoin |
| `/market/crypto/eth` | ETH | Ethereum |
| `/market/crypto/bnb` | BNB | Binance Coin |
| `/market/crypto/sol` | SOL | Solana |

### Message Format

**Stock Data:**
```json
{
  "symbol": "VN-Index",
  "price": 1250.45,
  "change": 5.23,
  "changePercent": 0.42,
  "volume": 450000000,
  "high": 1255.00,
  "low": 1245.00,
  "timestamp": 1704067200000
}
```

**Crypto Data:**
```json
{
  "symbol": "BTC",
  "price": 67500.00,
  "change": 1250.00,
  "changePercent": 1.89,
  "volume24h": 45000000000,
  "marketCap": 1320000000000,
  "timestamp": 1704067200000
}
```

---

## 🎯 Production Deployment

### 1. Enable Real MQTT Mode

**File:** `src/services/MQTTService.ts`

```typescript
// Line 35: Change to false
this.useSimulation = false;
```

### 2. Use MQTT.js Library

```bash
npm install mqtt
```

```typescript
import mqtt from 'mqtt';

const client = mqtt.connect('ws://localhost:8884/mqtt');

client.on('connect', () => {
  console.log('[MQTT] Connected to RESTHeart');
  client.subscribe('/market/stocks/vn-index');
  client.subscribe('/market/crypto/btc');
});

client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log(`Received: ${topic}`, data);
});
```

### 3. Security Configuration

**File:** `restheart-config/mqtt.properties`

```properties
# Disable anonymous access
mqtt.allow-anonymous=false
mqtt.default-user=admin
mqtt.default-password=your_secure_password

# Enable SSL/TLS
mqtt.ssl-enabled=true
mqtt.ssl-keystore=etc/ssl/keystore.jks
mqtt.ssl-keystore-password=your_keystore_password
```

### 4. Monitoring

```bash
# RESTHeart metrics
curl http://localhost:8080/metrics

# MongoDB stats
docker-compose exec mongodb mongosh
> db.stats()
> db.market_data.stats()

# Publisher stats
docker-compose logs publisher | grep PUBLISH | wc -l
```

### 5. Backup

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup

# Copy backup to host
docker cp market-monitor-mongodb:/data/backup ./backup

# Restore
docker cp ./backup market-monitor-mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

---

## 📚 Tài liệu tham khảo

- [RESTHeart Documentation](https://restheart.org/docs/)
- [RESTHeart MQTT Plugin](https://restheart.org/docs/mqtt/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MQTT Protocol Specification](https://mqtt.org/mqtt-specification/)
- [MQTT.js Library](https://github.com/mqttjs/MQTT.js)

---

**Chúc bạn thành công! 🚀**
