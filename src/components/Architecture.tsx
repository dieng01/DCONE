import React from 'react';
import { Wifi, WifiOff, Database, Server, Radio } from 'lucide-react';

interface ConnectionStatusProps {
  connected: boolean;
  connecting: boolean;
}

export function ConnectionStatus({ connected, connecting }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
        connected 
          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
          : connecting 
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}>
        {connecting ? (
          <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        ) : connected ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span className="text-xs font-medium">
          {connecting ? 'Đang kết nối...' : connected ? 'MQTT Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Server className="w-5 h-5 text-blue-400" />
        Kiến trúc hệ thống
      </h3>
      <div className="flex flex-col items-center gap-3">
        {/* Data Sources */}
        <div className="flex gap-3 flex-wrap justify-center">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-blue-400 text-xs font-medium">📈 Chứng khoán VN</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2 text-center">
            <div className="text-purple-400 text-xs font-medium">₿ Crypto Markets</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-gray-500 text-lg">↓ MQTT Publish ↓</div>

        {/* RESTHeart + MQTT Broker */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg px-6 py-3 text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-bold">RESTHeart</span>
          </div>
          <div className="text-gray-400 text-xs">MQTT Broker + REST API Gateway</div>
        </div>

        {/* Arrow */}
        <div className="text-gray-500 text-lg">↓ Auto-store ↓</div>

        {/* MongoDB */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg px-6 py-3 text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-bold">MongoDB</span>
          </div>
          <div className="text-gray-400 text-xs">Time-series data storage</div>
        </div>

        {/* Arrow */}
        <div className="text-gray-500 text-lg">↑ MQTT Subscribe ↑</div>

        {/* Dashboard */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg px-6 py-3 text-center w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-bold">Web Dashboard</span>
          </div>
          <div className="text-gray-400 text-xs">Real-time React App (MQTT.js)</div>
        </div>
      </div>

      {/* Topics info */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-500 mb-2">MQTT Topics:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          <code className="text-xs text-blue-300 bg-blue-500/5 px-2 py-0.5 rounded">/market/stocks/vn-index</code>
          <code className="text-xs text-blue-300 bg-blue-500/5 px-2 py-0.5 rounded">/market/stocks/hnx-index</code>
          <code className="text-xs text-purple-300 bg-purple-500/5 px-2 py-0.5 rounded">/market/crypto/btc</code>
          <code className="text-xs text-purple-300 bg-purple-500/5 px-2 py-0.5 rounded">/market/crypto/eth</code>
        </div>
      </div>
    </div>
  );
}
