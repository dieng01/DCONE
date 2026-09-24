import { useState, useEffect, useRef, useCallback } from 'react';
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
