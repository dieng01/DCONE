/**
 * MQTT Service - Kết nối MQTT Broker
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
 */

import mqtt, { MqttClient } from 'mqtt';

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

export type DataCallback = (data: StockData | CryptoData) => void;

class MQTTService {
  private client: MqttClient | null = null;
  private connected: boolean = false;
  private callbacks: Map<string, DataCallback[]> = new Map();
  private simulationInterval: NodeJS.Timeout | null = null;

  // RESTHeart MQTT Broker configuration
  private brokerUrl = 'wss://broker.hivemq.com:8884/mqtt'; // Public broker for demo
  
  // In production with RESTHeart:
  // private brokerUrl = 'wss://your-restheart-server:8883/mqtt';

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(this.brokerUrl, {
          clientId: `dashboard_${Math.random().toString(16).slice(2)}`,
          clean: true,
          connectTimeout: 4000,
          reconnectPeriod: 5000,
        });

        this.client.on('connect', () => {
          this.connected = true;
          console.log('[MQTT] Connected to broker');
          this.startSimulation();
          resolve();
        });

        this.client.on('error', (err) => {
          console.error('[MQTT] Connection error:', err);
          // Fallback to simulation mode
          this.startSimulation();
          resolve();
        });

        this.client.on('message', (topic, message) => {
          try {
            const data = JSON.parse(message.toString());
            const callbacks = this.callbacks.get(topic) || [];
            callbacks.forEach(cb => cb(data));
          } catch (e) {
            console.error('[MQTT] Parse error:', e);
          }
        });

        this.client.on('offline', () => {
          this.connected = false;
          console.log('[MQTT] Offline');
        });

        // Timeout - if not connected in 3s, use simulation
        setTimeout(() => {
          if (!this.connected) {
            console.log('[MQTT] Using simulation mode (RESTHeart broker not available)');
            this.startSimulation();
            resolve();
          }
        }, 3000);

      } catch (err) {
        console.error('[MQTT] Failed to connect:', err);
        this.startSimulation();
        resolve();
      }
    });
  }

  subscribe(topic: string, callback: DataCallback): void {
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, []);
    }
    this.callbacks.get(topic)!.push(callback);

    if (this.client && this.connected) {
      this.client.subscribe(topic);
    }
  }

  unsubscribe(topic: string, callback: DataCallback): void {
    const callbacks = this.callbacks.get(topic) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (this.client && this.connected && callbacks.length === 0) {
      this.client.unsubscribe(topic);
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
      const change = (Math.random() - 0.48) * 5;
      const price = stock.basePrice + change + (Math.random() - 0.5) * 10;
      const data: StockData = {
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
      const changePercent = (Math.random() - 0.47) * 3;
      const price = crypto.basePrice * (1 + changePercent / 100);
      const data: CryptoData = {
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
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const mqttService = new MQTTService();
