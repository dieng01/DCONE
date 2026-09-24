# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy Market Monitor trong 5 phút!

## Cách 1: Docker Compose (Khuyến nghị)

```bash
# 1. Clone repository
git clone https://github.com/your-repo/market-monitor.git
cd market-monitor

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Open browser
open http://localhost
```

**Services sẽ chạy:**
- Frontend: http://localhost (port 80)
- REST API: http://localhost:8080
- MQTT Broker: ws://localhost:8883/mqtt
- MongoDB: localhost:27017

## Cách 2: Manual Setup (Development)

### Bước 1: Cài đặt MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb-org
sudo systemctl start mongod
```

### Bước 2: Cài đặt RESTHeart

```bash
# Download
wget https://github.com/SoftInstigate/restheart/releases/download/7.6.0/restheart-7.6.0.zip
unzip restheart-7.6.0.zip
cd restheart-7.6.0

# Copy MQTT config
cp ../restheart-config/mqtt.properties etc/

# Start
./bin/start-standalone.sh
```

### Bước 3: Chạy Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Truy cập: http://localhost:5173

## Cách 3: Chỉ Frontend (Demo Mode)

Nếu bạn chỉ muốn xem demo mà không cần setup backend:

```bash
# Install dependencies
npm install

# Start (auto simulation mode)
npm run dev
```

Dashboard sẽ tự động chạy ở chế độ simulation với dữ liệu giả lập.

## Kiểm tra hoạt động

### 1. Kiểm tra MongoDB

```bash
mongosh
> show dbs
> use restheart
> db.market_data.find().limit(5)
```

### 2. Kiểm tra RESTHeart

```bash
# REST API
curl http://localhost:8080

# MQTT WebSocket
curl -I http://localhost:8883/mqtt
```

### 3. Kiểm tra MQTT

```bash
# Install mosquitto clients
# macOS: brew install mosquitto
# Ubuntu: sudo apt install mosquitto-clients

# Subscribe to all topics
mosquitto_sub -h localhost -p 1883 -t "/market/#" -v

# Publish test message
mosquitto_pub -h localhost -p 1883 \
  -t "/market/stocks/vn-index" \
  -m '{"symbol":"VN-Index","price":1250.45,"change":5.23,"changePercent":0.42,"volume":450000000,"high":1255.00,"low":1245.00,"timestamp":1704067200000}'
```

### 4. Kiểm tra Frontend

Mở browser: http://localhost:5173

Bạn sẽ thấy:
- ✅ Kết nối MQTT status (green = connected)
- ✅ Biểu đồ cập nhật real-time
- ✅ MQTT Message Log hiển thị messages

## Troubleshooting nhanh

### Không kết nối được MQTT?

```bash
# Kiểm tra RESTHeart đang chạy
curl http://localhost:8080

# Kiểm tra port
netstat -tlnp | grep -E '1883|8883'

# Xem logs
docker-compose logs restheart
```

### Frontend không hiển thị data?

```bash
# Kiểm tra browser console (F12)
# Đảm bảo WebSocket URL đúng

# Test WebSocket trong console:
const ws = new WebSocket('ws://localhost:8883/mqtt');
ws.onopen = () => console.log('OK');
ws.onerror = (e) => console.error('Error:', e);
```

### MongoDB connection error?

```bash
# Kiểm tra MongoDB
mongosh --eval "db.runCommand({ ping: 1 })"

# Restart
sudo systemctl restart mongod
# or
docker-compose restart mongodb
```

## Tiếp theo

- Đọc [README.md](./README.md) để biết chi tiết kiến trúc
- Xem [API Reference](./README.md#-api-reference) để truy vấn dữ liệu
- Deploy production với [hướng dẫn này](./README.md#-deploy-production)

## Liên hệ hỗ trợ

- Tạo issue trên GitHub
- Email: support@example.com
- Discord: [Community Channel](https://discord.gg/example)

---

**Chúc bạn thành công! 🎉**
