'use client';

// VagalSync V15.0 - Predictive Analytics Tab (FIXED VERSION)
// Compatible with biologicalTimingEngine-WORKING.ts

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, AlertTriangle, Calendar, Zap, Brain, Activity } from 'lucide-react';
import { loadBiomarkerEntries } from '../../services/storageService';
import { calculateMyVagalTone } from '../../utils/calculations';
import { biologicalTimingEngine } from '../../services/biologicalTimingEngine';
import type { BiomarkerEntry } from '../../types/biomarker.types';

export default function PredictiveAnalyticsTab() {
  const [currentState, setCurrentState] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadPredictiveData();
    
    // Update every 5 minutes
    const interval = setInterval(() => {
      loadPredictiveData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);
      
      // Update timing engine with latest biomarker data
      await biologicalTimingEngine.updateFromBiomarkers();
      
      // Get current biological state
      const state = biologicalTimingEngine.getCurrentState();
      setCurrentState(state);
      
      // Get 24-hour forecast
      const forecastData = biologicalTimingEngine.get24HourForecast();
      setForecast(forecastData);
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('[PredictiveAnalytics] Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'CORTISOL_AWAKENING_RESPONSE': 'from-orange-600 to-red-600',
      'MORNING_PEAK': 'from-yellow-500 to-orange-500',
      'MIDDAY_PLATEAU': 'from-blue-500 to-cyan-500',
      'AFTERNOON_DIP': 'from-indigo-500 to-purple-500',
      'EVENING_WIND_DOWN': 'from-purple-600 to-pink-600',
      'MELATONIN_ONSET': 'from-violet-600 to-purple-800',
      'DEEP_SLEEP_WINDOW': 'from-indigo-800 to-gray-900'
    };
    return colors[phase] || 'from-gray-600 to-gray-800';
  };

  const getPhaseDescription = (phase: string) => {
    const descriptions: Record<string, string> = {
      'CORTISOL_AWAKENING_RESPONSE': 'Cortisol spike - Natural wake-up process',
      'MORNING_PEAK': 'Peak alertness & performance',
      'MIDDAY_PLATEAU': 'Sustained performance window',
      'AFTERNOON_DIP': 'Natural energy low - consider rest',
      'EVENING_WIND_DOWN': 'Recovery & relaxation phase',
      'MELATONIN_ONSET': 'Sleep preparation - melatonin rising',
      'DEEP_SLEEP_WINDOW': 'Optimal sleep & recovery period'
    };
    return descriptions[phase] || 'Biological timing phase';
  };

  const getAutonomicColor = (balance: string) => {
    if (balance === 'sympathetic') return 'text-red-400';
    if (balance === 'parasympathetic') return 'text-green-400';
    return 'text-blue-400';
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === 'critical') return 'border-red-500 bg-red-500/10';
    if (urgency === 'high') return 'border-orange-500 bg-orange-500/10';
    if (urgency === 'medium') return 'border-yellow-500 bg-yellow-500/10';
    return 'border-blue-500 bg-blue-500/10';
  };

  if (loading && !currentState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Brain className="w-8 h-8 mr-3 text-cyan-400" />
            Predictive Analytics
          </h1>
          <p className="text-white/60 mt-2">
            Biological timing intelligence powered by Patent #10
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-sm">Last updated</p>
          <p className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Current State */}
      {currentState && (
        <div className={`bg-gradient-to-br ${getPhaseColor(currentState.circadianPhase)} rounded-3xl p-8 border border-white/20 shadow-2xl`}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-3" />
            Current Biological State
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Circadian Phase */}
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">Circadian Phase</div>
              <div className="text-2xl font-bold text-white">
                {currentState.circadianPhase.replace(/_/g, ' ')}
              </div>
              <div className="text-white/80 text-xs">
                {getPhaseDescription(currentState.circadianPhase)}
              </div>
            </div>

            {/* Ultradian Cycle */}
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">Ultradian Cycle</div>
              <div className="flex items-end space-x-2">
                <div className="text-2xl font-bold text-white">
                  {Math.round(currentState.ultradianCyclePosition * 100)}%
                </div>
                <div className="text-white/60 text-sm mb-1">
                  {currentState.ultradianCyclePosition > 0.7 || currentState.ultradianCyclePosition < 0.3 
                    ? '(Trough)' 
                    : currentState.ultradianCyclePosition > 0.4 && currentState.ultradianCyclePosition < 0.6
                    ? '(Peak)'
                    : '(Rising)'}
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-1000"
                  style={{ width: `${currentState.ultradianCyclePosition * 100}%` }}
                />
              </div>
            </div>

            {/* Autonomic Balance */}
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">Autonomic Balance</div>
              <div className={`text-2xl font-bold capitalize ${getAutonomicColor(currentState.autonomicBalance)}`}>
                {currentState.autonomicBalance}
              </div>
              <div className="text-white/80 text-xs">
                {currentState.autonomicBalance === 'sympathetic' && 'Fight-or-flight active'}
                {currentState.autonomicBalance === 'parasympathetic' && 'Rest & digest active'}
                {currentState.autonomicBalance === 'balanced' && 'Homeostatic balance'}
              </div>
            </div>

            {/* Optimal Window */}
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">Intervention Window</div>
              <div className="flex items-center space-x-2">
                {currentState.optimalInterventionWindow ? (
                  <>
                    <Target className="w-6 h-6 text-green-400" />
                    <div className="text-2xl font-bold text-green-400">OPTIMAL</div>
                  </>
                ) : (
                  <>
                    <Clock className="w-6 h-6 text-yellow-400" />
                    <div className="text-2xl font-bold text-yellow-400">WAIT</div>
                  </>
                )}
              </div>
              <div className="text-white/80 text-xs">
                {currentState.optimalInterventionWindow 
                  ? 'Perfect time for interventions'
                  : 'Next window in ~30-60 min'}
              </div>
            </div>
          </div>

          {/* Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/20">
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">Predicted HRV</div>
              <div className="text-3xl font-bold text-white">
                {Math.round(currentState.predictedHRV)} ms
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-medium">Predicted Readiness</div>
              <div className="text-3xl font-bold text-white">
                {Math.round(currentState.predictedReadiness)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Alerts */}
      {currentState && currentState.riskFactors.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl p-6 border border-red-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Risk Alerts
          </h3>
          <div className="space-y-2">
            {currentState.riskFactors.map((risk: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 text-white/90">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {currentState && currentState.recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Zap className="w-6 h-6 mr-3 text-yellow-400" />
            Timed Recommendations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentState.recommendations.map((rec: any, index: number) => (
              <div
                key={index}
                className={`rounded-2xl p-6 border ${getUrgencyColor(rec.urgency)} backdrop-blur`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {rec.timing}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    rec.urgency === 'critical' ? 'bg-red-500 text-white' :
                    rec.urgency === 'high' ? 'bg-orange-500 text-white' :
                    rec.urgency === 'medium' ? 'bg-yellow-500 text-black' :
                    'bg-blue-500 text-white'
                  }`}>
                    {rec.urgency.toUpperCase()}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">{rec.action}</h4>
                <p className="text-white/80 text-sm mb-3">{rec.rationale}</p>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white/60 text-xs">Expected Impact</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-full rounded-full"
                        style={{ width: `${rec.expectedImpact}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm">{rec.expectedImpact}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Forecast */}
      {forecast && (
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-blue-400" />
            24-Hour HRV Forecast
          </h2>

          {/* Simple Chart Visualization */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 h-48">
              {forecast.hrv24h.slice(0, 24).map((point: any, index: number) => {
                const maxHRV = Math.max(...forecast.hrv24h.map((p: any) => p.value));
                const height = (point.value / maxHRV) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center justify-end">
                    <div 
                      className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t transition-all hover:from-cyan-400 hover:to-blue-400"
                      style={{ height: `${height}%` }}
                      title={`${point.time}: ${point.value} ms`}
                    />
                    {index % 3 === 0 && (
                      <span className="text-white/40 text-xs mt-2">
                        {point.time.split(':')[0]}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-white/60 text-sm mb-1">Average HRV</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(forecast.hrv24h.reduce((sum: number, p: any) => sum + p.value, 0) / forecast.hrv24h.length)} ms
                </div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-white/60 text-sm mb-1">Peak HRV Time</div>
                <div className="text-2xl font-bold text-white">
                  {forecast.hrv24h.reduce((max: any, p: any) => p.value > max.value ? p : max, forecast.hrv24h[0]).time}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimal Windows */}
      {forecast && forecast.optimalWindows.length > 0 && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-green-400" />
            Optimal Intervention Windows (Next 24h)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecast.optimalWindows.slice(0, 6).map((window: any, index: number) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-bold">{window.type}</span>
                  <Target className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-white text-sm">
                  {window.start} - {window.end}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-cyan-400" />
          How Predictive Analytics Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-3xl">🔄</div>
            <h4 className="font-bold text-white">1. Continuous Monitoring</h4>
            <p className="text-white/60">
              Tracks circadian rhythms, ultradian cycles, and autonomic balance in real-time
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-3xl">🧠</div>
            <h4 className="font-bold text-white">2. Pattern Recognition</h4>
            <p className="text-white/60">
              AI analyzes your biological timing patterns to predict optimal windows
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-3xl">🎯</div>
            <h4 className="font-bold text-white">3. Timed Interventions</h4>
            <p className="text-white/60">
              Recommends specific actions at the perfect biological timing for 2-5X effectiveness
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
