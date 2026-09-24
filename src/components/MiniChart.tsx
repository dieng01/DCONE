import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryPoint } from '../hooks/useMQTT';

interface MiniChartProps {
  data: HistoryPoint[];
  color: string;
  height?: number;
  showAxis?: boolean;
}

export function MiniChart({ data, color, height = 120, showAxis = true }: MiniChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-gray-500 text-sm">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxis && (
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
        )}
        {showAxis && (
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
        )}
        {showAxis && (
          <YAxis 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
            domain={['auto', 'auto']}
          />
        )}
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
          animationDuration={300}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
