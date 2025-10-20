'use client';

/**
 * VAGALSYNC V15.0 - TREND CHART COMPONENT
 * Phase 3: Dashboard Polish with Trends & Charts
 * 
 * File location: /app/components/TrendChart.tsx
 * 
 * DEPENDENCIES REQUIRED:
 * npm install recharts
 */

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TrendDataPoint {
  date: string;
  score?: number;
  hrv?: number;
  sleep?: number;
  stress?: number;
  rhr?: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  metric: 'score' | 'hrv' | 'sleep' | 'stress' | 'rhr';
  title: string;
  showGrid?: boolean;
}

// ============================================================================
// TREND CHART COMPONENT
// ============================================================================

export default function TrendChart({ 
  data, 
  metric, 
  title,
  showGrid = true 
}: TrendChartProps) {
  
  // Color mapping for different metrics
  const getMetricColor = (): string => {
    switch(metric) {
      case 'score': return '#3b82f6'; // blue
      case 'hrv': return '#10b981'; // green
      case 'sleep': return '#8b5cf6'; // purple
      case 'stress': return '#ef4444'; // red
      case 'rhr': return '#f59e0b'; // orange
      default: return '#3b82f6';
    }
  };

  // Gradient ID for fill
  const gradientId = `gradient-${metric}`;

  // Get min/max for Y-axis domain
  const values = data.map(d => d[metric] || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const yAxisDomain = [
    Math.floor(minValue * 0.9),
    Math.ceil(maxValue * 1.1)
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-6 border border-white/10 backdrop-blur">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          {/* Gradient Definition */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          {/* Grid */}
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)" 
              vertical={false}
            />
          )}
          
          {/* X Axis */}
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tick={{ fill: 'rgba(255,255,255,0.7)' }}
          />
          
          {/* Y Axis */}
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            tick={{ fill: 'rgba(255,255,255,0.7)' }}
            domain={yAxisDomain}
            width={40}
          />
          
          {/* Tooltip */}
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: '#fff',
              padding: '12px'
            }}
            labelStyle={{ color: '#9ca3af', fontSize: '12px' }}
            itemStyle={{ color: getMetricColor(), fontSize: '14px', fontWeight: 'bold' }}
          />
          
          {/* Area Chart */}
          <Area
            type="monotone"
            dataKey={metric}
            stroke={getMetricColor()}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            strokeWidth={3}
            dot={{ fill: getMetricColor(), r: 4 }}
            activeDot={{ r: 6, fill: getMetricColor(), stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-400">Min</div>
          <div className="text-lg font-bold" style={{ color: getMetricColor() }}>
            {Math.round(minValue)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Avg</div>
          <div className="text-lg font-bold" style={{ color: getMetricColor() }}>
            {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Max</div>
          <div className="text-lg font-bold" style={{ color: getMetricColor() }}>
            {Math.round(maxValue)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Import in your page.tsx:
 * import TrendChart from './components/TrendChart';
 * 
 * Use in your JSX:
 * 
 * <TrendChart
 *   data={[
 *     { date: 'Mon', score: 68 },
 *     { date: 'Tue', score: 70 },
 *     { date: 'Wed', score: 72 }
 *   ]}
 *   metric="score"
 *   title="7-Day myVagal Tone™ Trend"
 * />
 */
