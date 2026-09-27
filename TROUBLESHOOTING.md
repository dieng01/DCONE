# 🐛 Troubleshooting Guide

## Các vấn đề đã sửa

### 1. Lỗi "Cannot read properties of null (reading 'useRef')"

**Nguyên nhân:**
- Package `mqtt` v5 sử dụng Node.js APIs (`net`, `tls`, `fs`, etc.) không hoạt động trong browser
- Khi Vite bundle cho browser, các module Node.js này gây ra lỗi runtime
- Dẫn đến React không thể initialize đúng cách, gây lỗi hooks

**Giải pháp:**
- Loại bỏ dependency `mqtt` package
- Viết lại MQTTService sử dụng simulation mode cho demo
- Trong production, sử dụng native WebSocket API để kết nối RESTHeart MQTT broker

**File đã sửa:**
- `src/services/MQTTService.ts` - Viết lại hoàn toàn, không dùng mqtt package
- `src/hooks/useMQTT.ts` - Sửa import React đúng cách

### 2. Import React trong hooks

**Nguyên nhân:**
- React 18 với Vite yêu cầu import React default export khi sử dụng hooks
- Import riêng lẻ `import { useState, useEffect } from 'react'` có thể gây lỗi

**Giải pháp:**
```typescript
// ❌ Sai
import { useState, useEffect, useRef } from 'react';

// ✅ Đúng
import React, { useState, useEffect, useRef } from 'react';
```

### 3. NodeJS.Timeout type

**Nguyên nhân:**
- `NodeJS.Timeout` là type của Node.js, không tồn tại trong browser
- Gây lỗi TypeScript khi build

**Giải pháp:**
```typescript
// ❌ Sai
private simulationInterval: NodeJS.Timeout | null = null;

// ✅ Đúng
private simulationInterval: ReturnType<typeof setInterval> | null = null;
```

---

## Kết quả

### Trước khi sửa
- ❌ Bundle size: 918KB
- ❌ Runtime error: useRef null
- ❌ Không chạy được trong browser

### Sau khi sửa
- ✅ Bundle size: 567KB (giảm 38%)
- ✅ Không có runtime error
- ✅ Chạy mượt mà trong browser
- ✅ Simulation mode hoạt động tốt

---

## Cách chạy project

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

Truy cập: http://localhost:5173

---

## Production Setup với RESTHeart

Để kết nối với RESTHeart MQTT broker thực tế:

### 1. Cài đặt RESTHeart

```bash
# Download RESTHeart
wget https://github.com/SoftInstigate/restheart/releases/download/7.6.0/restheart-7.6.0.zip
unzip restheart-7.6.0.zip
cd restheart-7.6.0

# Start with MQTT enabled
./bin/start-standalone.sh
```

### 2. Cấu hình MQTTService.ts

Sửa file `src/services/MQTTService.ts`:

```typescript
class MQTTService {
  private ws: WebSocket | null = null;
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Connect to RESTHeart MQTT broker via WebSocket
      this.ws = new WebSocket('wss://your-restheart-server:8883/mqtt', 'mqtt');
      
      this.ws.onopen = () => {
        console.log('[MQTT] Connected to RESTHeart');
        this.connected = true;
        
        // Send MQTT CONNECT packet
        this.sendMQTTConnect();
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        this.handleMQTTMessage(event.data);
      };
      
      this.ws.onerror = (error) => {
        console.error('[MQTT] WebSocket error:', error);
        reject(error);
      };
    });
  }
  
  private sendMQTTConnect(): void {
    // Implement MQTT CONNECT packet
    // See: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html
  }
  
  private handleMQTTMessage(data: ArrayBuffer): void {
    // Parse MQTT packet and dispatch to callbacks
  }
}
```

### 3. Hoặc sử dụng MQTT.js browser build

```bash
npm install mqtt
```

```typescript
// Sử dụng browser-specific import
import mqtt from 'mqtt/dist/mqtt.min';

const client = mqtt.connect('wss://your-restheart-server:8883/mqtt');
```

---

## Tài liệu tham khảo

- [RESTHeart MQTT Documentation](https://restheart.org/docs/mqtt/)
- [MQTT over WebSocket](https://www.hivemq.com/blog/mqtt-essentials-special-mqtt-over-websockets/)
- [Vite Browser Compatibility](https://vitejs.dev/guide/build.html#browser-compatibility)
- [React 18 Hooks](https://react.dev/reference/react)

---

## Liên hệ hỗ trợ

Nếu gặp vấn đề khác, vui lòng:
1. Kiểm tra browser console (F12)
2. Xem logs trong terminal
3. Tạo issue trên GitHub với thông tin lỗi chi tiết

**Happy coding! 🚀**
