# 📊 Market Monitor - Real-time Dashboard

Dashboard giám sát Real-time cho thị trường Chứng khoán Việt Nam và Cryptocurrency sử dụng kiến trúc **MQTT + MongoDB + RESTHeart**.

![Architecture](https://img.shields.io/badge/MQTT-Protocol-orange?style=flat-square)
![Database](https://img.shields.io/badge/MongoDB-Database-green?style=flat-square)
![RESTHeart](https://img.shields.io/badge/RESTHeart-Broker-blue?style=flat-square)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square)

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Setup](#-cài-đặt--setup)
  - [1. Cài đặt MongoDB](#1-cài-đặt-mongodb)
  - [2. Cài đặt RESTHeart](#2-cài-đặt-restheart)
  - [3. Cấu hình MQTT trong RESTHeart](#3-cấu-hình-mqtt-trong-restheart)
  - [4. Cài đặt Frontend](#4-cài-đặt-frontend)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [MQTT Topics](#-mqtt-topics)
- [API Reference](#-api-reference)
- [Chạy dự án](#-chạy-dự-án)
- [Deploy Production](#-deploy-production)
- [Troubleshooting](#-troubleshooting)
- [Tham khảo](#-tham-khảo)

---

## 🎯 Tổng quan

Ứng dụng này demo kiến trúc Real-time Monitoring sử dụng:

- **MQTT Protocol**: Giao thức messaging lightweight cho IoT và real-time data
- **RESTHeart**: API Server tích hợp sẵn MQTT Broker và MongoDB connector
- **MongoDB**: NoSQL database lưu trữ time-series data
- **React + TypeScript**: Frontend dashboard với biểu đồ real-time

### Tính năng

✅ Giám sát Real-time VN-Index, HNX-Index, VN30, UPCOM-Index  
✅ Theo dõi giá BTC, ETH, BNB, SOL  
✅ Biểu đồ AreaChart với gradient và animation  
✅ MQTT Message Log trực tiếp  
✅ Responsive design, Dark theme  
✅ Auto-reconnect khi mất kết nối  

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                             │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ Stock Market │              │ Crypto Market│             │
│  │   (VN, US)   │              │  (Binance,   │             │
│  │              │              │   Coinbase)  │             │
│  └──────┬───────┘              └──────┬───────┘             │
│         │                             │                     │
│         └──────────┬──────────────────┘                     │
│                    │                                        │
│                    ▼                                        │
│         ┌──────────────────┐                               │
│         │  MQTT Publisher  │                               │
│         │  (Data Bridge)   │                               │
│         └────────┬─────────┘                               │
└──────────────────┼──────────────────────────────────────────┘
                   │ MQTT Publish
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESTHEART SERVER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MQTT Broker (Built-in)                   │  │
│  │  • WebSocket Support (ws:// & wss://)                │  │
│  │  • Topic-based routing                               │  │
│  │  • QoS 0, 1, 2 support                              │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Auto-store to MongoDB                      │  │
│  │  • Collection: market_data                          │  │
│  │  • Time-series indexing                             │  │
│  │  • Retention policies                               │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              REST API Gateway                        │  │
│  │  • GET /market-data (historical)                    │  │
│  │  • POST /market-data (manual insert)                │  │
│  │  • Aggregation pipelines                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ MQTT Subscribe (WebSocket)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 WEB DASHBOARD (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Real-time charts (Recharts)                      │  │
│  │  • Stats cards with live updates                    │  │
│  │  • MQTT message log                                 │  │
│  │  • Connection status indicator                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Luồng dữ liệu

1. **Data Sources** thu thập dữ liệu từ các nguồn (API chứng khoán, crypto exchanges)
2. **MQTT Publisher** publish dữ liệu lên các topics
3. **RESTHeart** nhận messages qua MQTT Broker tích hợp
4. **MongoDB** tự động lưu trữ dữ liệu (configured via RESTHeart)
5. **Web Dashboard** subscribe MQTT topics để nhận real-time updates
6. Dữ liệu lịch sử có thể truy vấn qua REST API

---

## 💻 Yêu cầu hệ thống

### Server (RESTHeart + MongoDB)

- **OS**: Linux (Ubuntu 20.04+), macOS, Windows
- **Java**: JDK 17 hoặc cao hơn
- **MongoDB**: 6.0 hoặc cao hơn
- **RESTHeart**: 7.0 hoặc cao hơn
- **RAM**: Tối thiểu 4GB (8GB khuyến nghị)
- **Storage**: 20GB+ (tùy lượng data)

### Client (Frontend)

- **Node.js**: 18.0 hoặc cao hơn
- **npm**: 9.0 hoặc cao hơn
- **Browser**: Chrome, Firefox, Edge, Safari (modern versions)

---

## 🚀 Cài đặt & Setup

### 1. Cài đặt MongoDB

#### Ubuntu/Debian

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --eval "db.runCommand({ ping: 1 })"
```

#### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

#### Docker

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### 2. Cài đặt RESTHeart

#### Download RESTHeart

```bash
# Download latest version
wget https://github.com/SoftInstigate/restheart/releases/download/7.6.0/restheart-7.6.0.zip

# Extract
unzip restheart-7.6.0.zip
cd restheart-7.6.0
```

#### Cấu hình cơ bản

Chỉnh sửa file `etc/restheart-default.properties`:

```properties
# MongoDB connection
mongo-db-uri=mongodb://localhost:27017/restheart

# REST API
listen-port=8080
listen-host=0.0.0.0

# HTTPS (optional but recommended)
# listen-port=443
# https-host=0.0.0.0
# keystore-file=etc/ssl/keystore.pem
# keystore-password=password

# Authentication
auth-token-ttl=300
```

### 3. Cấu hình MQTT trong RESTHeart

RESTHeart tích hợp sẵn MQTT Broker. Kích hoạt bằng cách thêm configuration:

#### Tạo file `etc/mqtt.properties`

```properties
# MQTT Broker Configuration
mqtt.enabled=true
mqtt.listen-port=1883
mqtt.websocket-port=8883
mqtt.host=0.0.0.0

# WebSocket path
mqtt.websocket-path=/mqtt

# Authentication (optional)
mqtt.allow-anonymous=true

# MongoDB auto-store
mqtt.mongo-db=restheart
mqtt.mongo-collection=market_data

# Message retention
mqtt.retain-messages=true
mqtt.max-retained-messages=1000

# QoS levels
mqtt.default-qos=1

# Topic permissions (optional)
# mqtt.topic-permissions=/etc/mqtt-acl.json
```

#### Thêm vào `etc/restheart-default.properties`

```properties
# Include MQTT configuration
include-file=etc/mqtt.properties
```

#### Khởi động RESTHeart

```bash
# Start RESTHeart
./bin/start-standalone.sh

# Or with systemd (production)
sudo cp restheart.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start restheart
sudo systemctl enable restheart
```

#### Kiểm tra MQTT Broker

```bash
# Test MQTT connection
mosquitto_sub -h localhost -p 1883 -t "/test" -v &
mosquitto_pub -h localhost -p 1883 -t "/test" -m "Hello MQTT"

# Check WebSocket endpoint
curl -I http://localhost:8883/mqtt
```

### 4. Cài đặt Frontend

```bash
# Clone repository
git clone https://github.com/your-repo/market-monitor.git
cd market-monitor

# Install dependencies
npm install

# Configure MQTT broker URL
# Edit src/services/MQTTService.ts
# Change brokerUrl to your RESTHeart MQTT endpoint:
# private brokerUrl = 'ws://your-server:8883/mqtt';

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Cấu trúc dự án

```
market-monitor/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard component
│   │   ├── StatsCard.tsx       # Statistics cards
│   │   ├── Charts.tsx          # Area charts for stocks/crypto
│   │   ├── MiniChart.tsx       # Small chart component
│   │   ├── Architecture.tsx    # Architecture diagram
│   │   └── MQTTLog.tsx         # Real-time MQTT log
│   ├── hooks/
│   │   └── useMQTT.ts          # MQTT subscription hooks
│   ├── services/
│   │   └── MQTTService.ts      # MQTT client service
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
└── README.md                   # This file
```

---

## 📡 MQTT Topics

### Cấu trúc Topics

```
/market/
├── stocks/
│   ├── vn-index          # VN-Index data
│   ├── hnx-index         # HNX-Index data
│   ├── vn30              # VN30 index data
│   └── upcom             # UPCOM index data
└── crypto/
    ├── btc               # Bitcoin data
    ├── eth               # Ethereum data
    ├── bnb               # Binance Coin data
    └── sol               # Solana data
```

### Định dạng Message

#### Stock Data

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

#### Crypto Data

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

### Publish dữ liệu

```bash
# Publish stock data
mosquitto_pub -h localhost -p 1883 \
  -t "/market/stocks/vn-index" \
  -m '{"symbol":"VN-Index","price":1250.45,"change":5.23,"changePercent":0.42,"volume":450000000,"high":1255.00,"low":1245.00,"timestamp":1704067200000}'

# Publish crypto data
mosquitto_pub -h localhost -p 1883 \
  -t "/market/crypto/btc" \
  -m '{"symbol":"BTC","price":67500.00,"change":1250.00,"changePercent":1.89,"volume24h":45000000000,"marketCap":1320000000000,"timestamp":1704067200000}'
```

### Subscribe từ Dashboard

```javascript
// Trong src/services/MQTTService.ts
const client = mqtt.connect('ws://localhost:8883/mqtt');

client.on('connect', () => {
  client.subscribe('/market/stocks/vn-index');
  client.subscribe('/market/crypto/btc');
});

client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log(`${topic}:`, data);
});
```

---

## 🔌 API Reference

RESTHeart cung cấp REST API để truy vấn dữ liệu lịch sử:

### GET /market-data

Truy vấn dữ liệu lịch sử từ MongoDB.

```bash
# Get all records
curl http://localhost:8080/market-data

# Filter by topic
curl "http://localhost:8080/market-data?filter={\"topic\":\"/market/stocks/vn-index\"}"

# Filter by time range
curl "http://localhost:8080/market-data?filter={\"timestamp\":{\"$gt\":1704067200000}}"

# Sort by timestamp (descending)
curl "http://localhost:8080/market-data?sort={\"timestamp\":-1}"

# Limit results
curl "http://localhost:8080/market-data?limit=100"
```

### POST /market-data

Insert dữ liệu thủ công (nếu cần).

```bash
curl -X POST http://localhost:8080/market-data \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "/market/stocks/vn-index",
    "data": {
      "symbol": "VN-Index",
      "price": 1250.45,
      "timestamp": 1704067200000
    }
  }'
```

### Aggregation

```bash
# Get latest price for each symbol
curl "http://localhost:8080/market-data/aggregate" \
  -H "Content-Type: application/json" \
  -d '{
    "aggregate": {
      "$group": {
        "_id": "$data.symbol",
        "latestPrice": { "$last": "$data.price" },
        "lastUpdate": { "$max": "$timestamp" }
      }
    }
  }'
```

---

## 🏃 Chạy dự án

### Development Mode

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start RESTHeart
cd restheart-7.6.0
./bin/start-standalone.sh

# Terminal 3: Start Frontend
cd market-monitor
npm run dev
```

Truy cập: `http://localhost:5173`

### Production Mode

```bash
# Build frontend
npm run build

# Serve with nginx/apache
sudo cp -r dist/* /var/www/html/

# Or use Node.js server
npx serve dist -p 3000
```

### Docker Compose (Recommended)

Tạo file `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  restheart:
    image: softinstigate/restheart:latest
    container_name: restheart
    ports:
      - "8080:8080"   # REST API
      - "1883:1883"   # MQTT TCP
      - "8883:8883"   # MQTT WebSocket
    environment:
      - MONGO_URI=mongodb://mongodb:27017/restheart
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: frontend
    ports:
      - "80:80"
    depends_on:
      - restheart
    restart: unless-stopped

volumes:
  mongodb_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🌐 Deploy Production

### 1. Server Setup

```bash
# Ubuntu Server 22.04
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx

# Install MongoDB
# (theo hướng dẫn ở trên)

# Install RESTHeart
# (theo hướng dẫn ở trên)
```

### 2. Nginx Configuration

```nginx
# /etc/nginx/sites-available/market-monitor

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # REST API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # MQTT WebSocket
    location /mqtt {
        proxy_pass http://localhost:8883/mqtt;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/market-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL Certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Environment Variables

Tạo file `.env.production`:

```env
VITE_MQTT_BROKER_URL=wss://your-domain.com/mqtt
VITE_REST_API_URL=https://your-domain.com/api
VITE_WS_RECONNECT_INTERVAL=5000
```

### 4. Monitoring & Logging

```bash
# Install PM2 for process management
npm install -g pm2

# Start RESTHeart with PM2
pm2 start "./bin/start-standalone.sh" --name restheart

# Monitor
pm2 monit
pm2 logs restheart

# Auto-start on boot
pm2 startup
pm2 save
```

---

## 🔧 Troubleshooting

### MQTT Connection Failed

**Vấn đề**: Dashboard không kết nối được MQTT broker

**Giải pháp**:
```bash
# Kiểm tra RESTHeart đang chạy
curl http://localhost:8080

# Kiểm tra MQTT port
netstat -tlnp | grep 1883
netstat -tlnp | grep 8883

# Test MQTT connection
mosquitto_sub -h localhost -p 1883 -t "/test" -v

# Kiểm tra firewall
sudo ufw allow 1883/tcp
sudo ufw allow 8883/tcp
```

### MongoDB Connection Error

**Vấn đề**: RESTHeart không kết nối được MongoDB

**Giải pháp**:
```bash
# Kiểm tra MongoDB
mongosh
> db.runCommand({ ping: 1 })

# Kiểm tra connection string
cat etc/restheart-default.properties | grep mongo

# Restart MongoDB
sudo systemctl restart mongod
```

### WebSocket Connection Issues

**Vấn đề**: Browser không kết nối được WebSocket

**Giải pháp**:
```javascript
// Kiểm tra browser console
// Đảm bảo URL đúng protocol:
// - ws:// cho HTTP
// - wss:// cho HTTPS

// Test trong browser console:
const ws = new WebSocket('ws://localhost:8883/mqtt');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

### Data Not Updating

**Vấn đề**: Dashboard không nhận được dữ liệu mới

**Giải pháp**:
```bash
# Kiểm tra có messages được publish không
mosquitto_sub -h localhost -p 1883 -t "/market/#" -v

# Kiểm tra MongoDB có lưu data không
mongosh
> use restheart
> db.market_data.find().sort({timestamp: -1}).limit(5)

# Kiểm tra RESTHeart logs
tail -f logs/restheart.log
```

### Performance Issues

**Vấn đề**: Dashboard chậm, lag

**Giải pháp**:
```javascript
// Giảm frequency cập nhật
// Trong MQTTService.ts:
setInterval(() => {
  // ...
}, 5000); // Tăng từ 2000 lên 5000ms

// Limit history points
const MAX_HISTORY = 30; // Giảm từ 50 xuống 30

// Enable MongoDB TTL index
mongosh
> use restheart
> db.market_data.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 86400 })
```

---

## 📚 Tham khảo

### Tài liệu chính thức

- [RESTHeart Documentation](https://restheart.org/docs/)
- [RESTHeart MQTT Plugin](https://restheart.org/docs/mqtt/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MQTT Protocol Specification](https://mqtt.org/mqtt-specification/)
- [MQTT.js Library](https://github.com/mqttjs/MQTT.js)

### Bài viết liên quan

- [MQTT and MongoDB built into RESTHeart](https://maurizioturatti.com/writing/mqtt-and-mongodb-built-into-restheart/)
- [Real-time Data Streaming with MQTT](https://www.hivemq.com/article/mqtt-essentials/)
- [Building Dashboards with React and Recharts](https://recharts.org/en-US/guide)

### Công cụ hữu ích

- [MQTT Explorer](https://mqtt-explorer.com/) - GUI client cho MQTT
- [Mosquitto CLI](https://mosquitto.org/man/mosquitto_pub-1.html) - Command line MQTT client
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI cho MongoDB

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

**Developed with ❤️ for Real-time Market Monitoring**
