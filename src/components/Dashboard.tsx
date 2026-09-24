import React from 'react';
import { Activity, BarChart3, Bitcoin, TrendingUp, Globe, DollarSign } from 'lucide-react';
import { useMQTTStock, useMQTTCrypto, useMQTTConnection } from '../hooks/useMQTT';
import { StatsCard } from './StatsCard';
import { StockChart, CryptoChart } from './Charts';
import { MiniChart } from './MiniChart';
import { ConnectionStatus, ArchitectureDiagram } from './Architecture';
import { MQTTLog } from './MQTTLog';

export function Dashboard() {
  const { connected, connecting } = useMQTTConnection();

  // Stock data from MQTT
  const vnIndex = useMQTTStock('/market/stocks/vn-index', 'VN-Index');
  const hnxIndex = useMQTTStock('/market/stocks/hnx-index', 'HNX-Index');
  const vn30 = useMQTTStock('/market/stocks/vn30', 'VN30');
  const upcom = useMQTTStock('/market/stocks/upcom', 'UPCOM');

  // Crypto data from MQTT
  const btc = useMQTTCrypto('/market/crypto/btc', 'BTC');
  const eth = useMQTTCrypto('/market/crypto/eth', 'ETH');
  const bnb = useMQTTCrypto('/market/crypto/bnb', 'BNB');
  const sol = useMQTTCrypto('/market/crypto/sol', 'SOL');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Market Monitor</h1>
              <p className="text-xs text-gray-400">Real-time Dashboard • MQTT + MongoDB + RESTHeart</p>
            </div>
          </div>
          <ConnectionStatus connected={connected} connecting={connecting} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Vietnamese Stock Market Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Thị trường Chứng khoán Việt Nam</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">MQTT Real-time</span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="VN-Index"
              value={vnIndex.data ? vnIndex.data.price.toLocaleString('vi-VN') : '---'}
              change={vnIndex.data?.change}
              changePercent={vnIndex.data?.changePercent}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
              subtitle={`Vol: ${vnIndex.data ? (vnIndex.data.volume / 1000000).toFixed(0) + 'M' : '---'}`}
            />
            <StatsCard
              title="HNX-Index"
              value={hnxIndex.data ? hnxIndex.data.price.toLocaleString('vi-VN') : '---'}
              change={hnxIndex.data?.change}
              changePercent={hnxIndex.data?.changePercent}
              icon={<BarChart3 className="w-5 h-5" />}
              color="green"
              subtitle={`Vol: ${hnxIndex.data ? (hnxIndex.data.volume / 1000000).toFixed(0) + 'M' : '---'}`}
            />
            <StatsCard
              title="VN30"
              value={vn30.data ? vn30.data.price.toLocaleString('vi-VN') : '---'}
              change={vn30.data?.change}
              changePercent={vn30.data?.changePercent}
              icon={<Activity className="w-5 h-5" />}
              color="purple"
              subtitle={`Vol: ${vn30.data ? (vn30.data.volume / 1000000).toFixed(0) + 'M' : '---'}`}
            />
            <StatsCard
              title="UPCOM-Index"
              value={upcom.data ? upcom.data.price.toLocaleString('vi-VN') : '---'}
              change={upcom.data?.change}
              changePercent={upcom.data?.changePercent}
              icon={<BarChart3 className="w-5 h-5" />}
              color="orange"
              subtitle={`Vol: ${upcom.data ? (upcom.data.volume / 1000000).toFixed(0) + 'M' : '---'}`}
            />
          </div>

          {/* Stock Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StockChart
              title="VN-Index"
              data={vnIndex.history}
              color="#3B82F6"
              currentPrice={vnIndex.data?.price}
              change={vnIndex.data?.change}
            />
            <StockChart
              title="HNX-Index"
              data={hnxIndex.history}
              color="#10B981"
              currentPrice={hnxIndex.data?.price}
              change={hnxIndex.data?.change}
            />
          </div>
        </section>

        {/* Crypto Market Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bitcoin className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">Thị trường Cryptocurrency</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">MQTT Real-time</span>
          </div>

          {/* Crypto Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Bitcoin (BTC)"
              value={btc.data ? '$' + btc.data.price.toLocaleString('en-US') : '---'}
              change={btc.data?.change}
              changePercent={btc.data?.changePercent}
              icon={<Bitcoin className="w-5 h-5" />}
              color="orange"
            />
            <StatsCard
              title="Ethereum (ETH)"
              value={eth.data ? '$' + eth.data.price.toLocaleString('en-US') : '---'}
              change={eth.data?.change}
              changePercent={eth.data?.changePercent}
              icon={<DollarSign className="w-5 h-5" />}
              color="purple"
            />
            <StatsCard
              title="BNB"
              value={bnb.data ? '$' + bnb.data.price.toLocaleString('en-US') : '---'}
              change={bnb.data?.change}
              changePercent={bnb.data?.changePercent}
              icon={<Activity className="w-5 h-5" />}
              color="cyan"
            />
            <StatsCard
              title="Solana (SOL)"
              value={sol.data ? '$' + sol.data.price.toLocaleString('en-US') : '---'}
              change={sol.data?.change}
              changePercent={sol.data?.changePercent}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
          </div>

          {/* Crypto Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CryptoChart
              title="Bitcoin (BTC/USD)"
              data={btc.history}
              color="#F97316"
              currentPrice={btc.data?.price}
              changePercent={btc.data?.changePercent}
              volume={btc.data?.volume24h}
            />
            <CryptoChart
              title="Ethereum (ETH/USD)"
              data={eth.history}
              color="#8B5CF6"
              currentPrice={eth.data?.price}
              changePercent={eth.data?.changePercent}
              volume={eth.data?.volume24h}
            />
            <CryptoChart
              title="BNB (BNB/USD)"
              data={bnb.history}
              color="#06B6D4"
              currentPrice={bnb.data?.price}
              changePercent={bnb.data?.changePercent}
              volume={bnb.data?.volume24h}
            />
            <CryptoChart
              title="Solana (SOL/USD)"
              data={sol.history}
              color="#10B981"
              currentPrice={sol.data?.price}
              changePercent={sol.data?.changePercent}
              volume={sol.data?.volume24h}
            />
          </div>
        </section>

        {/* Architecture & Info Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ArchitectureDiagram />
          
          {/* MQTT Message Log */}
          <MQTTLog />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Real-time Market Monitoring Dashboard
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Architecture: MQTT Protocol → RESTHeart (Broker + REST API) → MongoDB → Web Dashboard
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Data is simulated for demonstration. In production, connect to your RESTHeart MQTT broker.
          </p>
        </footer>
      </main>
    </div>
  );
}
