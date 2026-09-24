import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { HistoryPoint } from '../hooks/useMQTT';

interface StockChartProps {
  title: string;
  data: HistoryPoint[];
  color: string;
  currentPrice?: number;
  change?: number;
}

export function StockChart({ title, data, color, currentPrice, change }: StockChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 text-sm">Đang kết nối MQTT...</span>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{title}</h3>
        {currentPrice && (
          <div className="text-right">
            <div className="text-xl font-bold text-white">{currentPrice.toLocaleString('vi-VN')}</div>
            {change !== undefined && (
              <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={`stock-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            labelStyle={{ color: '#9CA3AF' }}
            formatter={(value: number) => [value.toLocaleString('vi-VN'), 'Giá']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#stock-gradient-${color})`}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CryptoChartProps {
  title: string;
  data: HistoryPoint[];
  color: string;
  currentPrice?: number;
  changePercent?: number;
  volume?: number;
}

export function CryptoChart({ title, data, color, currentPrice, changePercent, volume }: CryptoChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 text-sm">Đang kết nối MQTT...</span>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = changePercent !== undefined && changePercent >= 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{title}</h3>
        {currentPrice && (
          <div className="text-right">
            <div className="text-xl font-bold text-white">${currentPrice.toLocaleString('en-US')}</div>
            {changePercent !== undefined && (
              <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
            )}
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={`crypto-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            labelStyle={{ color: '#9CA3AF' }}
            formatter={(value: number) => ['$' + value.toLocaleString('en-US'), 'Giá']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#crypto-gradient-${color})`}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
      {volume && (
        <div className="mt-2 text-xs text-gray-500">
          Volume 24h: ${(volume / 1000000000).toFixed(2)}B
        </div>
      )}
    </div>
  );
}
