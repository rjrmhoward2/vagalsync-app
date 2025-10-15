/**
 * VagalSync V15.0 Ultimate - Intervention Card with Optimal Timing
 * 
 * Example component showing how to integrate OptimalTimeBadge
 * into intervention cards
 */

'use client';

import React from 'react';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import OptimalTimeBadge from '../optimizer/OptimalTimeBadge';
import type { OptimalWindow } from '../../../lib/optimizer/BiologicalWindowsOptimizer';

// ============================================================================
// TYPES
// ============================================================================

interface Intervention {
  id: string;
  name: string;
  description: string;
  category: 'exercise' | 'meditation' | 'supplementation' | 'coldExposure' | 'breathwork';
  icon: string;
  duration: number;  // minutes
}

interface InterventionCardProps {
  intervention: Intervention;
  userId: string;
  onSchedule?: (intervention: Intervention, window: OptimalWindow) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function InterventionCard({
  intervention,
  userId,
  onSchedule
}: InterventionCardProps) {
  
  const handleSchedule = (window: OptimalWindow) => {
    console.log(`Scheduling ${intervention.name} at ${window.startTime}`);
    onSchedule?.(intervention, window);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{intervention.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{intervention.name}</h3>
            <p className="text-sm text-purple-300 capitalize">
              {intervention.category.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-purple-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{intervention.duration} min</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-purple-200 text-sm mb-4">
        {intervention.description}
      </p>

      {/* Optimal Timing Badge */}
      <div className="mb-4">
        <OptimalTimeBadge
          activity={intervention.category}
          userId={userId}
          showDetails={false}
          onSchedule={handleSchedule}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-all"
        >
          Learn More
        </button>
        <button
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Start Now
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE USAGE IN INTERVENTIONS TAB
// ============================================================================

/**
 * Example of how to use in your Interventions Tab
 */

export function InterventionsTabExample() {
  const userId = 'demo-user';  // Get from auth

  const interventions: Intervention[] = [
    {
      id: '1',
      name: 'Morning Cardio',
      description: 'High-intensity interval training to boost metabolism and mood',
      category: 'exercise',
      icon: '🏃',
      duration: 30
    },
    {
      id: '2',
      name: 'Meditation Session',
      description: 'Mindfulness meditation to reduce stress and improve focus',
      category: 'meditation',
      icon: '🧘',
      duration: 20
    },
    {
      id: '3',
      name: 'Cold Shower',
      description: 'Cold exposure therapy to activate brown fat and boost immune system',
      category: 'coldExposure',
      icon: '❄️',
      duration: 5
    },
    {
      id: '4',
      name: 'Omega-3 Supplement',
      description: 'High-quality fish oil for inflammation reduction',
      category: 'supplementation',
      icon: '💊',
      duration: 1
    }
  ];

  const handleSchedule = (intervention: Intervention, window: OptimalWindow) => {
    console.log(`Scheduling ${intervention.name}:`, {
      time: window.startTime,
      effectiveness: window.effectiveness,
      reasoning: window.reasoning
    });

    // TODO: Add to calendar or schedule
    alert(`✅ ${intervention.name} scheduled for ${window.startTime} (${window.effectiveness}x effectiveness!)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Interventions
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interventions.map(intervention => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              userId={userId}
              onSchedule={handleSchedule}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
