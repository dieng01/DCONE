# 📦 ALL CODE - Market Monitor Dashboard

File này chứa toàn bộ code của dự án. Copy từng phần vào project của bạn.

---

## 📁 File: src/services/MQTTService.ts

```typescript
/**
 * MQTT Service - Kết nối MQTT Broker qua WebSocket
 * 
 * Trong kiến trúc thực tế:
 * - RESTHeart đóng vai trò MQTT Broker tích hợp sẵn
 * - Dữ liệu được publish qua MQTT topics
 * - RESTHeart tự động lưu vào MongoDB
 * - Client subscribe để nhận real-time data
 * 
 * Topics structure:
 * - /market/stocks/vn-index
 * - /market/stocks/hnx-index
 * - /market/stocks/vn30
 * - /market/crypto/btc
 * - /market/crypto/eth
 * - /market/crypto/bnb
 * - /market/crypto/sol
 * 
 * Lưu ý: Sử dụng simulation mode cho demo.
 * Trong production, kết nối tới RESTHeart MQTT broker qua WebSocket.
 */

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp: number;
}

export interface CryptoData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume24h: number;
  marketCap: number;
  timestamp: number;
}

export type DataCallback = ( StockData | CryptoData) => void;

class MQTTService {
  private connected: boolean = false;
  private callbacks: Map<string, DataCallback[]> = new Map();
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private subscribedTopics: Set<string> = new Set();

  connect(): Promise<void> {
    return new Promise((resolve) => {
      // In production, connect to RESTHeart MQTT broker:
      // const ws = new WebSocket('wss://your-restheart-server:8883/mqtt', 'mqtt');
      
      console.log('[MQTT] Initializing connection...');
      
      // Simulate connection delay
      setTimeout(() => {
        this.connected = true;
        console.log('[MQTT] Connected (simulation mode)');
        this.startSimulation();
        resolve();
      }, 500);
    });
  }

  subscribe(topic: string, callback: DataCallback): void {
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, []);
    }
    this.callbacks.get(topic)!.push(callback);
    this.subscribedTopics.add(topic);
    console.log(`[MQTT] Subscribed to ${topic}`);
  }

  unsubscribe(topic: string, callback: DataCallback): void {
    const callbacks = this.callbacks.get(topic) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.callbacks.delete(topic);
      this.subscribedTopics.delete(topic);
    }
  }

  private startSimulation(): void {
    if (this.simulationInterval) return;

    // Simulate real-time market data (as if coming from MQTT via RESTHeart)
    this.simulationInterval = setInterval(() => {
      this.simulateStockData();
      this.simulateCryptoData();
    }, 2000);
  }

  private simulateStockData(): void {
    const stocks = [
      { topic: '/market/stocks/vn-index', basePrice: 1250, symbol: 'VN-Index' },
      { topic: '/market/stocks/hnx-index', basePrice: 230, symbol: 'HNX-Index' },
      { topic: '/market/stocks/vn30', basePrice: 1180, symbol: 'VN30' },
      { topic: '/market/stocks/upcom', basePrice: 92, symbol: 'UPCOM-Index' },
    ];

    stocks.forEach(stock => {
      if (!this.subscribedTopics.has(stock.topic)) return;
      
      const change = (Math.random() - 0.48) * 5;
      const price = stock.basePrice + change + (Math.random() - 0.5) * 10;
      const  StockData = {
        symbol: stock.symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(((change / stock.basePrice) * 100).toFixed(2)),
        volume: Math.floor(Math.random() * 500000000) + 100000000,
        high: parseFloat((price + Math.random() * 5).toFixed(2)),
        low: parseFloat((price - Math.random() * 5).toFixed(2)),
        timestamp: Date.now(),
      };

      const callbacks = this.callbacks.get(stock.topic) || [];
      callbacks.forEach(cb => cb(data));
    });
  }

  private simulateCryptoData(): void {
    const cryptos = [
      { topic: '/market/crypto/btc', basePrice: 67500, symbol: 'BTC' },
      { topic: '/market/crypto/eth', basePrice: 3450, symbol: 'ETH' },
      { topic: '/market/crypto/bnb', basePrice: 590, symbol: 'BNB' },
      { topic: '/market/crypto/sol', basePrice: 145, symbol: 'SOL' },
    ];

    cryptos.forEach(crypto => {
      if (!this.subscribedTopics.has(crypto.topic)) return;
      
      const changePercent = (Math.random() - 0.47) * 3;
      const price = crypto.basePrice * (1 + changePercent / 100);
      const  CryptoData = {
        symbol: crypto.symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat((price - crypto.basePrice).toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume24h: Math.floor(Math.random() * 50000000000) + 10000000000,
        marketCap: Math.floor(price * (Math.random() * 1000000 + 500000)),
        timestamp: Date.now(),
      };

      const callbacks = this.callbacks.get(crypto.topic) || [];
      callbacks.forEach(cb => cb(data));
    });
  }

  disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.connected = false;
    this.callbacks.clear();
    this.subscribedTopics.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const mqttService = new MQTTService();
```

---

## 📁 File: src/hooks/useMQTT.ts

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { mqttService, StockData, CryptoData, DataCallback } from '../services/MQTTService';

export interface HistoryPoint {
  time: string;
  price: number;
  timestamp: number;
}

export function useMQTTStock(topic: string, symbol: string) {
  const [data, setData] = useState<StockData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const MAX_HISTORY = 50;

  const callback: DataCallback = useCallback((newData) => {
    const stockData = newData as StockData;
    setData(stockData);
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setHistory(prev => {
      const newHistory = [...prev, {
        time: timeStr,
        price: stockData.price,
        timestamp: stockData.timestamp,
      }];
      return newHistory.slice(-MAX_HISTORY);
    });
  }, []);

  useEffect(() => {
    mqttService.subscribe(topic, callback);
    return () => {
      mqttService.unsubscribe(topic, callback);
    };
  }, [topic, callback]);

  return { data, history };
}

export function useMQTTCrypto(topic: string, symbol: string) {
  const [data, setData] = useState<CryptoData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const MAX_HISTORY = 50;

  const callback: DataCallback = useCallback((newData) => {
    const cryptoData = newData as CryptoData;
    setData(cryptoData);
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setHistory(prev => {
      const newHistory = [...prev, {
        time: timeStr,
        price: cryptoData.price,
        timestamp: cryptoData.timestamp,
      }];
      return newHistory.slice(-MAX_HISTORY);
    });
  }, []);

  useEffect(() => {
    mqttService.subscribe(topic, callback);
    return () => {
      mqttService.unsubscribe(topic, callback);
    };
  }, [topic, callback]);

  return { data, history };
}

export function useMQTTConnection() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    const connect = async () => {
      setConnecting(true);
      await mqttService.connect();
      setConnected(true);
      setConnecting(false);
    };

    connect();

    return () => {
      mqttService.disconnect();
    };
  }, []);

  return { connected, connecting };
}
```

---

## 📁 File: src/App.tsx

```typescript
import React from 'react';
import { Dashboard } from './components/Dashboard';

function App() {
  return <Dashboard />;
}

export default App;
```

---

## 📁 File: package.json

```json
{
  "name": "market-monitor",
  "private": true,
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.4"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.7",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.7",
    "typescript": "^5.7.0",
    "vite": "^6.3.5"
  }
}
```

---

## 📁 File: Dockerfile

```dockerfile
# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of npm ci to handle lock file updates)
RUN npm install

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

## 📁 File: docker-compose.yml

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: market-monitor-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_/data/db
      - mongodb_config:/data/configdb
    environment:
      - MONGO_INITDB_DATABASE=restheart
    restart: unless-stopped
    networks:
      - market-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RESTHeart - MQTT Broker + REST API + MongoDB Connector
  restheart:
    image: softinstigate/restheart:latest
    container_name: market-monitor-restheart
    ports:
      - "8080:8080"
      - "1884:1883"
      - "8884:8883"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/restheart
      - RESTHEART_OPTS=-o etc/mqtt.properties
    volumes:
      - ./restheart-config:/opt/restheart/etc/custom
    depends_on:
      mongodb:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - market-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 15s
      timeout: 5s
      retries: 3

  # Frontend Dashboard
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: market-monitor-frontend
    ports:
      - "3000:80"
      - "3443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      restheart:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - market-network

volumes:
  mongodb_
    driver: local
  mongodb_config:
    driver: local

networks:
  market-network:
    driver: bridge
```

---

## 🚀 Quick Start

```bash
# 1. Copy code vào project
# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Run with Docker
docker-compose up -d

# 5. Open browser
# http://localhost:3000
```

---

**Last updated**: 2026-09-27
