/**
 * MQTT Service - Kết nối MQTT Broker qua WebSocket
 * 
 * Kiến trúc:
 * 1. MQTT Publisher → RESTHeart MQTT Broker → MongoDB (auto-store)
 * 2. Frontend → Subscribe MQTT topics → Real-time updates
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
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private callbacks: Map<string, DataCallback[]> = new Map();
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private subscribedTopics: Set<string> = new Set();
  private useSimulation: boolean = true; // Set to false when RESTHeart is available
  
  // MQTT Broker URL (RESTHeart WebSocket endpoint)
  private brokerUrl: string = '';

  constructor() {
    // Detect environment
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // In production with RESTHeart, use actual MQTT WebSocket
      // For now, use simulation mode
      this.brokerUrl = `ws://${hostname}:8884/mqtt`;
      this.useSimulation = true; // Change to false when RESTHeart MQTT is ready
    }
  }

  async connect(): Promise<void> {
    console.log('[MQTT] Initializing connection...');
    
    if (this.useSimulation) {
      // Simulation mode for demo
      await this.connectSimulation();
    } else {
      // Real MQTT connection via WebSocket
      await this.connectWebSocket();
    }
  }

  private connectSimulation(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        console.log('[MQTT] Connected (simulation mode)');
        console.log('[MQTT] Note: Using simulated data. Enable RESTHeart for real MQTT.');
        this.startSimulation();
        resolve();
      }, 500);
    });
  }

  private connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.brokerUrl, 'mqtt');
        
        this.ws.onopen = () => {
          console.log('[MQTT] WebSocket connected to RESTHeart');
          this.connected = true;
          
          // Send MQTT CONNECT packet (simplified)
          // In production, use proper MQTT.js library for full protocol support
          this.sendMQTTConnect();
          
          // Resubscribe to topics
          this.subscribedTopics.forEach(topic => {
            this.sendMQTTSubscribe(topic);
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMQTTMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[MQTT] WebSocket error:', error);
          // Fallback to simulation
          console.log('[MQTT] Falling back to simulation mode...');
          this.useSimulation = true;
          this.startSimulation();
          resolve();
        };

        this.ws.onclose = () => {
          console.log('[MQTT] WebSocket closed');
          this.connected = false;
        };

        // Timeout
        setTimeout(() => {
          if (!this.connected) {
            console.log('[MQTT] Connection timeout, using simulation mode');
            this.useSimulation = true;
            this.startSimulation();
            resolve();
          }
        }, 5000);

      } catch (error) {
        console.error('[MQTT] Failed to connect:', error);
        this.useSimulation = true;
        this.startSimulation();
        resolve();
      }
    });
  }

  private sendMQTTConnect(): void {
    // Simplified MQTT CONNECT packet
    // In production, use mqtt.js library for proper protocol handling
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // MQTT CONNECT packet structure (simplified)
      const packet = new Uint8Array([
        0x10, // CONNECT packet type
        0x0e, // Remaining length
        0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, // "MQTT"
        0x04, // Protocol level (4 = MQTT 3.1.1)
        0x02, // Connect flags (Clean Session)
        0x00, 0x3c, // Keep alive (60 seconds)
        0x00, 0x04, // Client ID length
        0x77, 0x65, 0x62, // "web" (partial)
      ]);
      this.ws.send(packet);
    }
  }

  private sendMQTTSubscribe(topic: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(`[MQTT] Subscribing to ${topic}`);
      // In production, use proper MQTT SUBSCRIBE packet
    }
  }

  private handleMQTTMessage(data: ArrayBuffer | string): void {
    try {
      // Parse MQTT PUBLISH packet (simplified)
      // In production, use mqtt.js library for proper parsing
      if (typeof data === 'string') {
        const message = JSON.parse(data);
        const topic = message.topic;
        const payload = message.payload;
        
        const callbacks = this.callbacks.get(topic) || [];
        callbacks.forEach(cb => cb(payload));
      }
    } catch (error) {
      console.error('[MQTT] Failed to parse message:', error);
    }
  }

  subscribe(topic: string, callback: DataCallback): void {
    if (!this.callbacks.has(topic)) {
      this.callbacks.set(topic, []);
    }
    this.callbacks.get(topic)!.push(callback);
    this.subscribedTopics.add(topic);
    
    if (this.connected && !this.useSimulation) {
      this.sendMQTTSubscribe(topic);
    }
    
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

    console.log('[MQTT] Starting simulation mode...');
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
      if (!this.subscribedTopics.has(crypto.topic)) return;
      
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
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connected = false;
    this.callbacks.clear();
    this.subscribedTopics.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  isSimulationMode(): boolean {
    return this.useSimulation;
  }
}

export const mqttService = new MQTTService();
