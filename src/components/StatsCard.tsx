import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  changePercent?: number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: string;
}

export function StatsCard({ title, value, change, changePercent, icon, subtitle, color = 'blue' }: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = !change || change === 0;

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="flex items-center gap-2">
        {change !== undefined && (
          <>
            {isPositive && <TrendingUp className="w-4 h-4 text-green-400" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-red-400" />}
            {isNeutral && <Minus className="w-4 h-4 text-gray-400" />}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
              {isPositive ? '+' : ''}{change?.toFixed(2)} ({isPositive ? '+' : ''}{changePercent?.toFixed(2)}%)
            </span>
          </>
        )}
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
}
