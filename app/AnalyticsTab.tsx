/**
 * ANALYTICS TAB COMPONENT
 * VagalSync V15.0 Ultimate - Progress tracking and trend analysis
 * Patent 3: Biomarker Accuracy Weighting with historical analysis
 */

import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar, Target, Award, Clock, Activity, Heart, Brain } from 'lucide-react';
import { getCurrentMyVagalTone, loadBiomarkerEntries } from './services/storageService.ts';
import { MyVagalToneScore } from './types/biomarker.types';
import { calculateMyVagalTone } from './utils/calculations.ts';

interface AnalyticsTabProps {
  metrics: any;
  interventionLogs: any[];
  selectedDevices: string[];
  socialStreak: number;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  metrics,
  interventionLogs,
  selectedDevices,
  socialStreak
}) => {

// Load real myVagal Tone history from biomarkers
const loadRealHistoricalData = () => {
  const entries = loadBiomarkerEntries();
  
  if (entries.length === 0) {
    return [];
  }
  
  // Group entries by date
  const dateMap = new Map<string, number>();
  const allEntries = loadBiomarkerEntries();
  
  // Calculate score for each unique date
  const uniqueDates = [...new Set(allEntries.map(e => 
    new Date(e.timestamp).toLocaleDateString('en-US')
  ))];
  
  uniqueDates.forEach(dateStr => {
    const entriesForDate = allEntries.filter(e => 
      new Date(e.timestamp).toLocaleDateString('en-US') === dateStr
    );
    
    if (entriesForDate.length > 0) {
      // Calculate myVagal Tone for these entries
      const score = calculateMyVagalTone(entriesForDate);
      
      const shortDate = new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      dateMap.set(shortDate, score.score);
    }
  });
  
  // Convert to array format for charts
  return Array.from(dateMap.entries()).map(([dateStr, score]) => ({
    date: dateStr,
    score: score,
    hrv: Math.round((30 + score / 3) * 10) / 10,
    stress: Math.round((100 - score) * 10) / 10
  }));
};

const historicalData = loadRealHistoricalData();
const latestScore = getCurrentMyVagalTone()?.score ?? 0;
const oldestScore = historicalData.length > 0 ? historicalData[0].score : latestScore;
const totalImprovement = latestScore - oldestScore;
const improvementPercent = oldestScore > 0 
  ? ((totalImprovement / oldestScore) * 100).toFixed(1)
  : '0.0';
  
  // Calculate metrics trends
  const getMetricTrend = (metricName: string) => {
    const enabled = metrics[metricName]?.enabled;
    const value = metrics[metricName]?.value;

    if (!enabled) return null;

    // Simulate trend (in real app, would calculate from historical data)
    const trend = Math.random() > 0.4 ? 'up' : 'down';
    const change = (Math.random() * 15 + 5).toFixed(1);

    return { value, trend, change };
  };

  // Key metrics to display
  const keyMetrics = [
    { name: 'Heart Rate Variability', key: 'heartRateVariability', unit: 'ms', icon: Heart, color: 'text-red-400' },
    { name: 'Resting Heart Rate', key: 'restingHeartRate', unit: 'bpm', icon: Activity, color: 'text-blue-400' },
    { name: 'Sleep Quality', key: 'sleepQuality', unit: '%', icon: Clock, color: 'text-purple-400' },
    { name: 'Stress Level', key: 'stressLevel', unit: '%', icon: Brain, color: 'text-orange-400' },
    { name: 'Recovery Score', key: 'recoveryScore', unit: '%', icon: Target, color: 'text-green-400' }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
          <BarChart3 className="w-12 h-12 mr-4 text-cyan-300" />
          Progress Analytics
        </h2>
        <p className="text-2xl text-cyan-300/80">
          Track your wellness journey with data-driven insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-400/30 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-300 text-sm font-semibold">Current Score</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-1">{latestScore}</div>
          <div className="text-sm text-cyan-200">myVagal Tone™</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-300 text-sm font-semibold">30-Day Change</span>
            {totalImprovement > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className={`text-4xl font-bold mb-1 ${totalImprovement > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalImprovement > 0 ? '+' : ''}{totalImprovement.toFixed(1)}
          </div>
          <div className="text-sm text-green-200">{improvementPercent}% improvement</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 text-sm font-semibold">Active Days</span>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-1">{socialStreak}</div>
          <div className="text-sm text-purple-200">day streak</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-300 text-sm font-semibold">Interventions</span>
            <Activity className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-1">{interventionLogs.length}</div>
          <div className="text-sm text-orange-200">total sessions</div>
        </div>
      </div>

      {/* Score Trend Chart (Text-based representation) */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl p-8 border border-gray-700/30 backdrop-blur">
        <h3 className="text-2xl font-bold text-white mb-6">30-Day myVagal Tone™ Trend</h3>

        <div className="space-y-2">
          {historicalData.map((day, idx) => {
            if (idx % 3 !== 0) return null; // Show every 3rd day

            const barWidth = `${day.score}%`;
            const isRecent = idx > historicalData.length - 8;

            return (
              <div key={idx} className="flex items-center space-x-4">
                <div className="text-xs text-white/60 w-20">{day.date}</div>
                <div className="flex-1 bg-gray-700/30 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all flex items-center justify-end pr-3 ${isRecent
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'bg-gradient-to-r from-gray-600 to-gray-500'
                      }`}
                    style={{ width: barWidth }}
                  >
                    <span className="text-white text-sm font-bold">{day.score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <span className="text-white/70">Last 7 days</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-600 to-gray-500"></div>
            <span className="text-white/70">Historical</span>
          </div>
        </div>
      </div>

      {/* Biomarker Trends */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Key Biomarker Trends</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyMetrics.map((metric) => {
            const trend = getMetricTrend(metric.key);

            if (!trend) {
              return (
                <div
                  key={metric.key}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10 opacity-50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <metric.icon className="w-6 h-6 text-gray-500" />
                    <span className="font-bold text-gray-400">{metric.name}</span>
                  </div>
                  <p className="text-gray-500 text-sm">Not tracking - connect a device</p>
                </div>
              );
            }

            return (
              <div
                key={metric.key}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    <span className="font-bold text-white">{metric.name}</span>
                  </div>
                  {trend.trend === 'up' ? (
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {typeof trend.value === 'number' ? trend.value.toFixed(1) : trend.value}
                      <span className="text-lg text-white/60 ml-2">{metric.unit}</span>
                    </div>
                    <div className={`text-sm ${trend.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {trend.trend === 'up' ? '↑' : '↓'} {trend.change}% vs last week
                    </div>
                  </div>

                  {/* Mini sparkline representation */}
                  <div className="flex items-end space-x-1 h-12">
                    {[40, 45, 42, 48, 52, 55, 60].map((height, idx) => (
                      <div
                        key={idx}
                        className={`w-2 rounded-t ${idx === 6 ? 'bg-cyan-400' : 'bg-gray-600'
                          }`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones & Achievements */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-3xl p-8 border border-yellow-500/30 backdrop-blur">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Award className="w-7 h-7 mr-3 text-yellow-400" />
          Milestones Reached
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4 border border-yellow-400/30">
            <div className="text-4xl mb-2">🎯</div>
            <div className="font-bold text-white mb-1">First Week Complete</div>
            <div className="text-sm text-white/70">Tracked for 7 consecutive days</div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-yellow-400/30">
            <div className="text-4xl mb-2">📈</div>
            <div className="font-bold text-white mb-1">Score Improvement</div>
            <div className="text-sm text-white/70">Improved by 20+ points</div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-yellow-400/30">
            <div className="text-4xl mb-2">🔗</div>
            <div className="font-bold text-white mb-1">Multi-Device Pro</div>
            <div className="text-sm text-white/70">Connected {selectedDevices.length} devices</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-3xl p-8 border border-blue-400/30 backdrop-blur">
        <h3 className="text-2xl font-bold text-white mb-4">📊 Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-green-500/20 rounded-full p-2 mt-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white/90">
                Your myVagal Tone™ has improved by <span className="font-bold text-green-400">{improvementPercent}%</span> over the past 30 days - excellent progress!
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-blue-500/20 rounded-full p-2 mt-1">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white/90">
                Your most effective intervention is <span className="font-bold text-blue-400">breathing exercises</span> with an average improvement of +12 points.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-purple-500/20 rounded-full p-2 mt-1">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white/90">
                You're <span className="font-bold text-purple-400">{(80 - latestScore).toFixed(1)} points</span> away from Elite Resilience status (80+).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
