/**
 * VagalSync V15.0 Ultimate - Optimal Time Badge Component
 * 
 * Displays "Best Time" badges on interventions showing:
 * - Optimal time window
 * - Effectiveness multiplier
 * - Quick reasoning
 * 
 * Can be used on interventions, protocols, supplements, etc.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Info, Zap } from 'lucide-react';
import type { OptimalWindow, ActivityType } from '../../../lib/optimizer/BiologicalWindowsOptimizer';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface OptimalTimeBadgeProps {
  activity: ActivityType;           // What activity to optimize
  userId: string;                    // User ID for personalization
  compact?: boolean;                 // Compact vs full display
  showDetails?: boolean;             // Show detailed breakdown
  onSchedule?: (window: OptimalWindow) => void;  // Callback when user clicks to schedule
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function OptimalTimeBadge({
  activity,
  userId,
  compact = false,
  showDetails = false,
  onSchedule
}: OptimalTimeBadgeProps) {
  
  const [bestWindow, setBestWindow] = useState<OptimalWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // ============================================================================
  // FETCH OPTIMAL WINDOW
  // ============================================================================

  useEffect(() => {
    fetchOptimalTime();
  }, [activity, userId]);

  const fetchOptimalTime = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/optimizer/windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activity,
          duration: 60  // Default 60 minutes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch optimal time');
      }

      const data = await response.json();
      
      if (data.windows && data.windows.length > 0) {
        setBestWindow(data.windows[0]);  // Take the best window
      }

    } catch (err: any) {
      console.error('[OptimalTimeBadge] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-400/30 rounded-lg">
        <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
        <span className="text-sm text-purple-300">Optimizing...</span>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !bestWindow) {
    return null;  // Silently fail - don't show badge if optimization fails
  }

  // ============================================================================
  // COMPACT DISPLAY
  // ============================================================================

  if (compact) {
    return (
      <div 
        className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg cursor-pointer hover:border-cyan-400 transition-all"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => onSchedule?.(bestWindow)}
      >
        <Zap className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-cyan-300">
          {bestWindow.startTime}
        </span>
        <span className="text-xs text-cyan-400 font-bold">
          {bestWindow.effectiveness}x
        </span>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute z-50 mt-2 p-3 bg-black/90 border border-cyan-400/30 rounded-lg shadow-2xl backdrop-blur-xl w-64 top-full left-0">
            <div className="text-sm text-white mb-2">
              <span className="font-semibold">Best Time:</span> {bestWindow.startTime}
            </div>
            <div className="text-xs text-cyan-300 mb-2">
              {bestWindow.effectiveness}x effectiveness multiplier
            </div>
            <div className="text-xs text-gray-400">
              {bestWindow.reasoning}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // FULL DISPLAY
  // ============================================================================

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/30 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Optimal Timing</div>
            <div className="text-xs text-purple-300">Patent #10: Biological Windows</div>
          </div>
        </div>
        
        {/* Effectiveness Badge */}
        <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full">
          <span className="text-lg font-bold text-cyan-400">
            {bestWindow.effectiveness}x
          </span>
        </div>
      </div>

      {/* Best Time */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-purple-200">Best Time:</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {bestWindow.startTime} - {bestWindow.endTime}
        </div>
        <div className="text-xs text-purple-300 mt-1">
          {bestWindow.duration} minutes
        </div>
      </div>

      {/* Reasoning */}
      {bestWindow.reasoning && (
        <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-200">
              {bestWindow.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Effectiveness Factors (if showDetails) */}
      {showDetails && (
        <div className="space-y-2 mb-3">
          <div className="text-xs font-semibold text-purple-300">Effectiveness Factors:</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(bestWindow.factors).map(([factor, multiplier]) => (
              <div 
                key={factor}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
              >
                <span className="text-xs text-purple-200 capitalize">
                  {factor}:
                </span>
                <span className="text-xs font-bold text-cyan-400">
                  {multiplier}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              bestWindow.confidence === 'high' ? 'bg-green-500 w-full' :
              bestWindow.confidence === 'medium' ? 'bg-yellow-500 w-2/3' :
              'bg-orange-500 w-1/3'
            }`}
          />
        </div>
        <span className="text-xs text-purple-300 capitalize">
          {bestWindow.confidence} confidence
        </span>
      </div>

      {/* Action Button */}
      {onSchedule && (
        <button
          onClick={() => onSchedule(bestWindow)}
          className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Schedule at Optimal Time
        </button>
      )}
    </div>
  );
}
