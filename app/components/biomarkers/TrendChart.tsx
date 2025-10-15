/**
 * VagalSync V15.0 Ultimate - Trend Chart Component
 * 
 * Modal that displays historical trend analysis for a specific biomarker.
 * 
 * Features:
 * - Line chart showing values over time
 * - Optimal range visualization (shaded area)
 * - Trend direction (improving/stable/declining)
 * - Statistics (average, latest, change %)
 * - Individual data points with details
 */

'use client';

import React, { useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Activity,
  Target
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';

import { BiomarkerDefinition, BiomarkerEntry } from '../../types/biomarker.types';
import { analyzeBiomarkerTrend, formatBiomarkerValue } from '../../utils/calculations';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface TrendChartProps {
  biomarker: BiomarkerDefinition;
  entries: BiomarkerEntry[];
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TrendChart({ 
  biomarker, 
  entries, 
  onClose 
}: TrendChartProps) {
  
  // Analyze trend
  const trendAnalysis = useMemo(() => {
    return analyzeBiomarkerTrend(biomarker.id, entries);
  }, [biomarker.id, entries]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return trendAnalysis.entries
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(entry => ({
        date: new Date(entry.timestamp).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: new Date(entry.timestamp).toLocaleString(),
        value: entry.value,
        optimal: entry.inOptimalRange,
        source: entry.accuracySource,
        notes: entry.notes
      }));
  }, [trendAnalysis.entries]);

  // Parse optimal range for chart reference lines
  const { minOptimal, maxOptimal } = useMemo(() => {
    const range = biomarker.optimalRange;
    
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(Number);
      return { minOptimal: min, maxOptimal: max };
    } else if (range.startsWith('<')) {
      const max = Number(range.substring(1));
      return { minOptimal: 0, maxOptimal: max };
    } else if (range.startsWith('>')) {
      const min = Number(range.substring(1));
      const maxValue = Math.max(...chartData.map(d => d.value));
      return { minOptimal: min, maxOptimal: maxValue * 1.2 };
    }
    
    return { minOptimal: null, maxOptimal: null };
  }, [biomarker.optimalRange, chartData]);

  // Get trend display info
  const getTrendDisplay = () => {
    switch (trendAnalysis.trend) {
      case 'improving':
        return {
          icon: TrendingUp,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-400/30',
          label: 'Improving',
          description: 'Your values are moving toward optimal range'
        };
      case 'declining':
        return {
          icon: TrendingDown,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-400/30',
          label: 'Declining',
          description: 'Your values are moving away from optimal range'
        };
      case 'stable':
        return {
          icon: Minus,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-400/30',
          label: 'Stable',
          description: 'Your values are relatively consistent'
        };
      default:
        return {
          icon: Activity,
          color: 'text-white/60',
          bgColor: 'bg-white/10',
          borderColor: 'border-white/20',
          label: 'Insufficient Data',
          description: 'Add more measurements to see trends'
        };
    }
  };

  const trendDisplay = getTrendDisplay();
  const TrendIcon = trendDisplay.icon;

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
        <p className="text-white font-bold mb-2">{data.fullDate}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white/60">Value:</span>
            <span className="text-white font-bold">
              {formatBiomarkerValue(data.value, biomarker.unit)} {biomarker.unit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60">Status:</span>
            <span className={data.optimal ? 'text-emerald-400' : 'text-red-400'}>
              {data.optimal ? 'Optimal' : 'Suboptimal'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60">Source:</span>
            <span className="text-white/80 text-sm capitalize">
              {data.source.replace('_', ' ')}
            </span>
          </div>
          {data.notes && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-white/70 text-xs italic">"{data.notes}"</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (chartData.length < 2) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Insufficient Data</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/70 text-center py-8">
            You need at least 2 measurements to view trends. Add more data points to see your progress over time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-black/30 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{biomarker.icon || '📊'}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{biomarker.name} Trend</h2>
              <p className="text-white/60 text-sm">
                {trendAnalysis.entries.length} measurements tracked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Trend Status Card */}
          <div className={`${trendDisplay.bgColor} border ${trendDisplay.borderColor} rounded-xl p-6`}>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur rounded-full p-3">
                <TrendIcon className={`w-8 h-8 ${trendDisplay.color}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${trendDisplay.color}`}>
                  {trendDisplay.label}
                </h3>
                <p className="text-white/70">{trendDisplay.description}</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${trendDisplay.color}`}>
                  {trendAnalysis.changePercent > 0 ? '+' : ''}
                  {trendAnalysis.changePercent.toFixed(1)}%
                </div>
                <div className="text-white/60 text-sm">Change</div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-white/60 text-sm mb-1">Latest</div>
              <div className="text-2xl font-bold text-white">
                {formatBiomarkerValue(trendAnalysis.latestValue, biomarker.unit)}
              </div>
              <div className="text-white/40 text-xs">{biomarker.unit}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-white/60 text-sm mb-1">Average</div>
              <div className="text-2xl font-bold text-white">
                {formatBiomarkerValue(trendAnalysis.averageValue, biomarker.unit)}
              </div>
              <div className="text-white/40 text-xs">{biomarker.unit}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-white/60 text-sm mb-1">Optimal</div>
              <div className="text-2xl font-bold text-emerald-400">
                {trendAnalysis.optimalPercentage}%
              </div>
              <div className="text-white/40 text-xs">of measurements</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-white/60 text-sm mb-1">Target</div>
              <div className="text-lg font-bold text-cyan-400">
                {biomarker.optimalRange}
              </div>
              <div className="text-white/40 text-xs">{biomarker.unit}</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Measurements Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff60"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#ffffff60"
                  style={{ fontSize: '12px' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Optimal range visualization */}
                {minOptimal !== null && maxOptimal !== null && (
                  <>
                    <ReferenceLine 
                      y={minOptimal} 
                      stroke="#10b981" 
                      strokeDasharray="5 5"
                      label={{ value: 'Min Optimal', fill: '#10b981', fontSize: 12 }}
                    />
                    <ReferenceLine 
                      y={maxOptimal} 
                      stroke="#10b981" 
                      strokeDasharray="5 5"
                      label={{ value: 'Max Optimal', fill: '#10b981', fontSize: 12 }}
                    />
                  </>
                )}
                
                {/* Data line */}
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Measurement History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 text-sm font-medium py-3 px-4">Date</th>
                    <th className="text-left text-white/60 text-sm font-medium py-3 px-4">Value</th>
                    <th className="text-left text-white/60 text-sm font-medium py-3 px-4">Status</th>
                    <th className="text-left text-white/60 text-sm font-medium py-3 px-4">Source</th>
                    <th className="text-left text-white/60 text-sm font-medium py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[...trendAnalysis.entries]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((entry, index) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white/80 text-sm">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">
                          {formatBiomarkerValue(entry.value, biomarker.unit)} {biomarker.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {entry.inOptimalRange ? (
                          <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium">
                            Optimal
                          </span>
                        ) : (
                          <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-medium">
                            Suboptimal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm capitalize">
                        {entry.accuracySource.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm max-w-xs truncate">
                        {entry.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
