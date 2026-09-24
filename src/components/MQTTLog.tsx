import React, { useState, useEffect, useRef } from 'react';
import { Activity, Trash2 } from 'lucide-react';

interface LogEntry {
  id: number;
  type: 'mqtt' | 'recv' | 'restheart' | 'db' | 'error';
  topic?: string;
  value?: string;
  message: string;
  timestamp: Date;
}

export function MQTTLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial logs
    const initialLogs: LogEntry[] = [
      { id: logIdRef.current++, type: 'mqtt', message: 'Connecting to MQTT broker...', timestamp: new Date() },
      { id: logIdRef.current++, type: 'mqtt', message: 'Connected! Subscribing to topics...', timestamp: new Date() },
      { id: logIdRef.current++, type: 'mqtt', message: 'Subscribed: /market/stocks/vn-index', timestamp: new Date() },
      { id: logIdRef.current++, type: 'mqtt', message: 'Subscribed: /market/stocks/hnx-index', timestamp: new Date() },
      { id: logIdRef.current++, type: 'mqtt', message: 'Subscribed: /market/stocks/vn30', timestamp: new Date() },
      { id: logIdRef.current++, type: 'mqtt', message: 'Subscribed: /market/crypto/btc', timestamp: new Date() },
      { id: logIdRef.current++, type: 'mqtt', message: 'Subscribed: /market/crypto/eth', timestamp: new Date() },
      { id: logIdRef.current++, type: 'restheart', message: 'RESTHeart MQTT bridge active', timestamp: new Date() },
      { id: logIdRef.current++, type: 'db', message: 'MongoDB collection: market_data ready', timestamp: new Date() },
    ];
    setLogs(initialLogs);
  }, []);

  // Simulate incoming MQTT messages in log
  useEffect(() => {
    const interval = setInterval(() => {
      const topics = [
        { topic: '/market/stocks/vn-index', prefix: 'VN-Index' },
        { topic: '/market/stocks/hnx-index', prefix: 'HNX-Index' },
        { topic: '/market/crypto/btc', prefix: 'BTC' },
        { topic: '/market/crypto/eth', prefix: 'ETH' },
        { topic: '/market/crypto/bnb', prefix: 'BNB' },
        { topic: '/market/crypto/sol', prefix: 'SOL' },
      ];

      const random = topics[Math.floor(Math.random() * topics.length)];
      const value = random.topic.includes('crypto') 
        ? '$' + (Math.random() * 70000 + 100).toFixed(2)
        : (Math.random() * 1300 + 80).toFixed(2);

      const newLog: LogEntry = {
        id: logIdRef.current++,
        type: 'recv',
        topic: random.topic,
        value,
        message: `${random.prefix}: ${value}`,
        timestamp: new Date(),
      };

      setLogs(prev => [...prev.slice(-30), newLog]);

      // Add RESTHeart storage log
      setTimeout(() => {
        const storeLog: LogEntry = {
          id: logIdRef.current++,
          type: 'restheart',
          message: `Auto-stored ${random.topic} → MongoDB`,
          timestamp: new Date(),
        };
        setLogs(prev => [...prev.slice(-30), storeLog]);
      }, 100);

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'mqtt': return 'text-green-400';
      case 'recv': return 'text-blue-400';
      case 'restheart': return 'text-yellow-400';
      case 'db': return 'text-cyan-400';
      case 'error': return 'text-red-400';
    }
  };

  const getLogLabel = (type: LogEntry['type']) => {
    switch (type) {
      case 'mqtt': return '[MQTT]';
      case 'recv': return '[RECV]';
      case 'restheart': return '[RESTHeart]';
      case 'db': return '[MongoDB]';
      case 'error': return '[ERROR]';
    }
  };

  const getBorderColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'mqtt': return 'border-green-500/20';
      case 'recv': return 'border-blue-500/20';
      case 'restheart': return 'border-yellow-500/20';
      case 'db': return 'border-cyan-500/20';
      case 'error': return 'border-red-500/20';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          MQTT Message Log
        </h3>
        <button 
          onClick={() => setLogs([])}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          title="Clear log"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div ref={scrollRef} className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs pr-2">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`bg-gray-900/50 rounded p-2 border ${getBorderColor(log.type)} animate-[fadeIn_0.3s_ease-in]`}
          >
            <span className="text-gray-600 mr-2">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className={`${getLogColor(log.type)} font-bold`}>
              {getLogLabel(log.type)}
            </span>
            <span className="text-gray-400 ml-1">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-600 text-center py-8">
            No messages yet...
          </div>
        )}
      </div>
    </div>
  );
}
