# 📦 Code Summary - Market Monitor Dashboard

## 📁 Cấu trúc dự án

```
market-monitor/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── StatsCard.tsx
│   │   ├── Charts.tsx
│   │   ├── MiniChart.tsx
│   │   ├── Architecture.tsx
│   │   └── MQTTLog.tsx
│   ├── hooks/
│   │   └── useMQTT.ts
│   ├── services/
│   │   └── MQTTService.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .env.example
├── README.md
└── QUICKSTART.md
```

## 🔄 Cách cập nhật code

### Cách 1: Copy từng file thủ công

Copy nội dung các file từ thư mục `src/` vào project của bạn.

### Cách 2: Sử dụng script tự động

```bash
# Linux/Mac
chmod +x update-code.sh
./update-code.sh

# Windows
update-code.bat
```

## 📋 Danh sách file đã cập nhật

### ✅ Files đã sửa (Critical)

1. **src/services/MQTTService.ts** - Xóa import mqtt, dùng simulation mode
2. **src/hooks/useMQTT.ts** - Sửa import React
3. **src/App.tsx** - Thêm import React
4. **package.json** - Dọn dẹp dependencies
5. **Dockerfile** - Node 22 + npm install
6. **docker-compose.yml** - Đổi port (1884, 8884, 3000)
7. **nginx.conf** - Cấu hình proxy

### 📄 Files mới tạo

1. **README.md** - Tài liệu chi tiết
2. **QUICKSTART.md** - Hướng dẫn nhanh
3. **TROUBLESHOOTING.md** - Xử lý lỗi
4. **FIX_DOCKER_BUILD.md** - Fix lỗi Docker build
5. **FIX_PORT_CONFLICT.md** - Fix lỗi port conflict
6. **PORT_FIX_SUMMARY.md** - Tóm tắt fix port
7. **fix-docker-build.sh** - Script fix Docker (Linux/Mac)
8. **fix-docker-windows.bat** - Script fix Docker (Windows)
9. **update-code.sh** - Script cập nhật code (Linux/Mac)
10. **update-code.bat** - Script cập nhật code (Windows)

## 🎯 Các lỗi đã fix

| # | Lỗi | Giải pháp |
|---|-----|-----------|
| 1 | `Cannot read properties of null (reading 'useRef')` | Xóa mqtt package, viết lại MQTTService |
| 2 | `Rollup failed to resolve import "mqtt"` | Loại bỏ import mqtt |
| 3 | Docker build fail (lock file sync) | Dùng `npm install` thay vì `npm ci` |
| 4 | Port 1883 conflict | Đổi sang 1884, 8884, 3000 |
| 5 | YAML syntax error | Sửa `mongodb_data:` thiếu dấu `:` |

## 🚀 Quick Start

```bash
# 1. Clone hoặc copy code
# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Run with Docker
docker-compose up -d

# 5. Open browser
# http://localhost:3000
```

## 📊 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS 4
- **Backend**: RESTHeart (MQTT + MongoDB)
- **Database**: MongoDB 7.0
- **Container**: Docker + Docker Compose

## 🔗 Ports

| Service | Port |
|---------|------|
| Frontend | 3000 |
| REST API | 8080 |
| MQTT TCP | 1884 |
| MQTT WebSocket | 8884 |
| MongoDB | 27017 |

---

**Last updated**: 2026-09-27
**Version**: 1.0.0
