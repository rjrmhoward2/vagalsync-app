/**
 * INTERVENTIONS TAB COMPONENT
 * VagalSync V15.0 Ultimate - Track and optimize wellness interventions
 * Patent 12: Adaptive Protocol Library with effectiveness tracking
 * 
 * INTEGRATED FEATURES:
 * 1. Provider Protocols (from ProfessionalFi) - PRIORITY
 * 2. AI-Generated Recommendations - SUPPLEMENTARY/FALLBACK
 * 3. Quick-Start Interventions - IMMEDIATE ACTION
 * 4. Session Logging & Tracking
 * 5. Historical Analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Wind,
  Zap,
  Brain,
  Activity,
  Clock,
  TrendingUp,
  CheckCircle,
  Play,
  Pause,
  Calendar,
  Award,
  Stethoscope,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye
} from 'lucide-react';

import InterventionGuidancePanel from './components/InterventionGuidancePanel';
import { getCurrentMyVagalTone } from './services/storageService';
import { MyVagalToneScore } from './types/biomarker.types';
import { InterventionLog } from './types/intervention.types';

// ============================================================================
// TYPES
// ============================================================================

interface InterventionTabProps {
  breathingExercise: boolean;
  setBreathingExercise: (value: boolean) => void;
  arMode: boolean;
  setArMode: (value: boolean) => void;
  vagalToneScore: number;
  interventionLogs: InterventionLog[];
  setInterventionLogs: (logs: InterventionLog[]) => void;
}

interface ProviderProtocol {
  id: string;
  providerId: string;
  providerName: string;
  providerTitle: string;
  protocolName: string;
  description: string;
  duration: string;
  priority: 'critical' | 'high' | 'medium';
  status: 'active' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  interventions: string[];
  notes?: string;
  followUpScheduled?: Date;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InterventionsTab: React.FC<InterventionTabProps> = ({
  breathingExercise,
  setBreathingExercise,
  arMode,
  setArMode,
  vagalToneScore,
  interventionLogs,
  setInterventionLogs
}) => {

  // State
  const [myVagalTone, setMyVagalTone] = useState<MyVagalToneScore | null>(null);
  const [providerProtocols, setProviderProtocols] = useState<ProviderProtocol[]>([]);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [expandedProtocols, setExpandedProtocols] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    const score = getCurrentMyVagalTone();
    setMyVagalTone(score);
    loadProviderProtocols();
  }, []);

  const loadProviderProtocols = () => {
    try {
      const stored = localStorage.getItem('vagalsync_provider_protocols');
      if (stored) {
        const protocols = JSON.parse(stored).map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: p.endDate ? new Date(p.endDate) : undefined,
          followUpScheduled: p.followUpScheduled ? new Date(p.followUpScheduled) : undefined
        }));
        setProviderProtocols(protocols);
      }
    } catch (error) {
      console.error('Failed to load provider protocols:', error);
    }
  };

  const toggleProtocol = (id: string) => {
    const newExpanded = new Set(expandedProtocols);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedProtocols(newExpanded);
  };

  const hasActiveProviderProtocol = providerProtocols.some(p => p.status === 'active');

  // Available intervention types
  const interventionTypes = [
    {
      id: 'breathing',
      name: 'Box Breathing',
      icon: Wind,
      duration: '10 min',
      effectiveness: 92,
      vagal_impact: '+8-12 pts',
      description: '4-4-4-4 breathing pattern for immediate parasympathetic activation',
      color: 'from-blue-500 to-cyan-500',
      active: breathingExercise,
      toggle: () => setBreathingExercise(!breathingExercise)
    },
    {
      id: 'vns',
      name: 'VNS Therapy',
      icon: Zap,
      duration: '30 min',
      effectiveness: 88,
      vagal_impact: '+12-18 pts',
      description: 'Apollo/Pulsetto vagus nerve stimulation session',
      color: 'from-purple-500 to-pink-500',
      active: false,
      toggle: () => { }
    },
    {
      id: 'meditation',
      name: 'Guided Meditation',
      icon: Brain,
      duration: '20 min',
      effectiveness: 85,
      vagal_impact: '+6-10 pts',
      description: 'Mindfulness meditation with HRV biofeedback',
      color: 'from-indigo-500 to-purple-500',
      active: false,
      toggle: () => { }
    },
    {
      id: 'cold-exposure',
      name: 'Cold Exposure',
      icon: Activity,
      duration: '3 min',
      effectiveness: 90,
      vagal_impact: '+10-15 pts',
      description: 'Cold shower or ice bath for hormetic stress',
      color: 'from-cyan-500 to-blue-600',
      active: false,
      toggle: () => { }
    },
    {
      id: 'yoga',
      name: 'Restorative Yoga',
      icon: Activity,
      duration: '45 min',
      effectiveness: 83,
      vagal_impact: '+7-11 pts',
      description: 'Gentle stretching with breath synchronization',
      color: 'from-green-500 to-emerald-600',
      active: false,
      toggle: () => { }
    },
    {
      id: 'sound-therapy',
      name: 'Binaural Beats',
      icon: Brain,
      duration: '15 min',
      effectiveness: 78,
      vagal_impact: '+4-8 pts',
      description: 'Theta/delta wave entrainment for deep relaxation',
      color: 'from-violet-500 to-purple-600',
      active: false,
      toggle: () => { }
    }
  ];

  // Calculate intervention statistics
  const getInterventionStats = () => {
    if (interventionLogs.length === 0) return null;

    const totalSessions = interventionLogs.length;
    const avgImprovement = interventionLogs.reduce((sum, log) => sum + log.improvement, 0) / totalSessions;
    const bestSession = interventionLogs.reduce((best, log) =>
      log.improvement > best.improvement ? log : best
    );
    const thisWeek = interventionLogs.filter(log => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length;

    return {
      totalSessions,
      avgImprovement,
      bestSession,
      thisWeek
    };
  };

  const stats = getInterventionStats();

  // Start a new intervention
  const startIntervention = (interventionId: string) => {
    const intervention = interventionTypes.find(i => i.id === interventionId);
    if (!intervention) return;

    const newLog: InterventionLog = {
      id: Date.now(),
      type: intervention.name,
      duration: intervention.duration,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      score_before: vagalToneScore,
      score_after: 0,
      improvement: 0
    };

    // Simulate intervention completion
    setTimeout(() => {
      const improvement = Math.floor(Math.random() * 10) + 5; // 5-15 pts
      newLog.score_after = vagalToneScore + improvement;
      newLog.improvement = improvement;
      setInterventionLogs([newLog, ...interventionLogs]);
    }, 3000);
  };

  return (
    <div className="p-8 space-y-8">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
          <Activity className="w-12 h-12 mr-4 text-cyan-300" />
          Wellness Interventions
        </h2>
        <p className="text-2xl text-cyan-300/80">
          Evidence-based protocols to optimize your myVagal Tone™ score
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30 backdrop-blur">
            <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalSessions}</div>
            <div className="text-white/80">Total Sessions</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 backdrop-blur">
            <div className="text-4xl font-bold text-green-400 mb-2">+{stats.avgImprovement.toFixed(1)}</div>
            <div className="text-white/80">Avg Improvement</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 backdrop-blur">
            <div className="text-4xl font-bold text-purple-400 mb-2">+{stats.bestSession.improvement}</div>
            <div className="text-white/80">Best Session</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 backdrop-blur">
            <div className="text-4xl font-bold text-orange-400 mb-2">{stats.thisWeek}</div>
            <div className="text-white/80">This Week</div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SECTION 1: PROVIDER PROTOCOLS (Priority) */}
      {/* ================================================================== */}

      {providerProtocols.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-3xl font-bold text-white">Your Provider's Protocol</h3>
                <p className="text-sm text-gray-400">Custom interventions from your healthcare team</p>
              </div>
            </div>
            <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-bold">
              ⭐ PRIORITY
            </div>
          </div>

          <div className="space-y-4">
            {providerProtocols.map(protocol => {
              const isExpanded = expandedProtocols.has(protocol.id);

              return (
                <div
                  key={protocol.id}
                  className={`rounded-2xl border-2 transition-all ${protocol.status === 'active'
                      ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/50'
                      : 'bg-gray-800/30 border-gray-500/30'
                    }`}
                >
                  {/* Protocol Header - Always Visible */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-blue-300 mb-2">
                          From: {protocol.providerName}, {protocol.providerTitle}
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">{protocol.protocolName}</h4>
                        <p className="text-gray-300">{protocol.description}</p>
                      </div>
                      <div className={`${protocol.status === 'active' ? 'bg-green-500/20 text-green-300' :
                          protocol.status === 'completed' ? 'bg-gray-500/20 text-gray-300' :
                            'bg-yellow-500/20 text-yellow-300'
                        } px-4 py-2 rounded-full text-sm font-bold uppercase ml-4`}>
                        {protocol.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Duration</div>
                        <div className="text-white font-bold">{protocol.duration}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Started</div>
                        <div className="text-white font-bold">
                          {protocol.startDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleProtocol(protocol.id)}
                      className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-3 rounded-lg transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">
                        {isExpanded ? 'Hide' : 'View'} Protocol Details
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-6">
                      {/* Interventions List */}
                      <div>
                        <div className="text-sm text-blue-300 font-semibold mb-3">Prescribed Interventions:</div>
                        <div className="space-y-2">
                          {protocol.interventions.map((intervention, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <span className="text-white">{intervention}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Provider Notes */}
                      {protocol.notes && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <div className="text-sm text-blue-300 font-semibold mb-2">Provider Notes:</div>
                          <p className="text-white">{protocol.notes}</p>
                        </div>
                      )}

                      {/* Follow-up */}
                      {protocol.followUpScheduled && (
                        <div className="flex items-center gap-2 text-cyan-300 bg-cyan-500/10 rounded-lg p-3">
                          <Clock className="w-5 h-5" />
                          <span>Follow-up scheduled: {protocol.followUpScheduled.toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Actions */}
                      {protocol.status === 'active' && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => startIntervention(protocol.interventions[0])}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                          >
                            <Play className="w-5 h-5" />
                            Start Session
                          </button>
                          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all">
                            Contact Provider
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* SECTION 2: QUICK-START INTERVENTIONS */}
      {/* ================================================================== */}

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">Quick-Start Interventions</h3>
            <p className="text-gray-400">Click any intervention to begin an immediate session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interventionTypes.map((intervention) => (
            <div
              key={intervention.id}
              className={`rounded-2xl p-6 border-2 transition-all cursor-pointer ${intervention.active
                  ? `bg-gradient-to-br ${intervention.color} border-white/50 shadow-2xl`
                  : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              onClick={() => startIntervention(intervention.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${intervention.active ? 'bg-white/20' : 'bg-white/10'}`}>
                    <intervention.icon className={`w-6 h-6 ${intervention.active ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-xl ${intervention.active ? 'text-white' : 'text-gray-300'}`}>
                      {intervention.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span className={intervention.active ? 'text-white/80' : 'text-gray-400'}>
                        {intervention.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {intervention.active ? (
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-bold animate-pulse">ACTIVE</span>
                  </div>
                ) : (
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:from-cyan-600 hover:to-blue-600 transition-all">
                    <Play className="w-4 h-4 inline mr-1" />
                    Start
                  </button>
                )}
              </div>

              <p className={`text-sm mb-4 ${intervention.active ? 'text-white/90' : 'text-gray-400'}`}>
                {intervention.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg p-3 ${intervention.active ? 'bg-white/10' : 'bg-white/5'}`}>
                  <div className={`text-sm mb-1 ${intervention.active ? 'text-white/70' : 'text-gray-500'}`}>
                    Effectiveness
                  </div>
                  <div className={`font-bold ${intervention.active ? 'text-white' : 'text-gray-300'}`}>
                    {intervention.effectiveness}%
                  </div>
                </div>
                <div className={`rounded-lg p-3 ${intervention.active ? 'bg-white/10' : 'bg-white/5'}`}>
                  <div className={`text-sm mb-1 ${intervention.active ? 'text-white/70' : 'text-gray-500'}`}>
                    Vagal Impact
                  </div>
                  <div className={`font-bold ${intervention.active ? 'text-cyan-300' : 'text-gray-300'}`}>
                    {intervention.vagal_impact}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 3: AI RECOMMENDATIONS (Supplementary/Fallback) */}
      {/* ================================================================== */}

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-3xl font-bold text-white">
                {hasActiveProviderProtocol ? 'Supplementary' : 'AI-Generated'} Recommendations
              </h3>
              <p className="text-gray-400">
                {hasActiveProviderProtocol
                  ? 'Additional evidence-based interventions to complement your provider protocol'
                  : 'Personalized interventions based on your myVagal Tone™ score'
                }
              </p>
            </div>
          </div>

          {hasActiveProviderProtocol && (
            <button
              onClick={() => setShowAIRecommendations(!showAIRecommendations)}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              {showAIRecommendations ? 'Hide' : 'Show'} Recommendations
            </button>
          )}
        </div>

        {/* Warning Banner */}
        {hasActiveProviderProtocol && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <strong>Note:</strong> You have an active protocol from your healthcare provider.
                These AI recommendations are supplementary. Always prioritize your provider's guidance
                and consult them before adding new interventions.
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations Panel */}
        {(!hasActiveProviderProtocol || showAIRecommendations) && (
          <InterventionGuidancePanel myVagalTone={myVagalTone} />
        )}
      </section>

      {/* ================================================================== */}
      {/* SECTION 4: NO PROVIDER PROTOCOL CTA */}
      {/* ================================================================== */}

      {providerProtocols.length === 0 && (
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/50 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Stethoscope className="w-12 h-12 text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Get Personalized Clinical Protocols
                </h3>
                <p className="text-gray-300 mb-6">
                  Connect with certified healthcare providers using ProfessionalFi to receive
                  custom intervention protocols tailored to your specific biomarker data and health goals.
                  Clinical protocols take priority over AI recommendations and provide professional oversight.
                </p>
                <div className="flex gap-4">
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Find a Provider
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* SECTION 5: RECENT SESSIONS LOG */}
      {/* ================================================================== */}

      {interventionLogs.length > 0 && (
        <section>
          <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-cyan-400" />
            Recent Sessions
          </h3>

          <div className="space-y-3">
            {interventionLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-5 border border-gray-700/30 backdrop-blur hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-bold text-white text-xl">{log.type}</span>
                      <span className="text-sm text-white/60">{log.duration}</span>
                      {log.improvement > 10 && (
                        <span title="Great improvement!">
                          <Award className="w-5 h-5 text-yellow-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/70">
                      {log.date} at {log.time}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-xs text-white/60 mb-1">Before</div>
                      <div className="text-xl font-bold text-white">{log.score_before.toFixed(1)}</div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    <div className="text-center">
                      <div className="text-xs text-white/60 mb-1">After</div>
                      <div className="text-xl font-bold text-green-400">{log.score_after.toFixed(1)}</div>
                    </div>
                    <div className="text-center bg-green-500/20 px-4 py-2 rounded-lg border border-green-400/30">
                      <div className="text-xs text-green-300 mb-1">Improvement</div>
                      <div className="text-2xl font-bold text-green-400">+{log.improvement}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* SECTION 6: EMPTY STATE */}
      {/* ================================================================== */}

      {interventionLogs.length === 0 && (
        <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
          <Activity className="w-20 h-20 mx-auto mb-6 text-cyan-400" />
          <h3 className="text-2xl font-bold text-white mb-4">Start Your First Intervention</h3>
          <p className="text-white/70 text-lg mb-6">
            Click any intervention above to begin tracking your wellness journey
          </p>
          <div className="flex justify-center space-x-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-white/80">Evidence-based protocols</span>
          </div>
          <div className="flex justify-center space-x-4 mt-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-white/80">Real-time effectiveness tracking</span>
          </div>
          <div className="flex justify-center space-x-4 mt-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-white/80">Personalized recommendations</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterventionsTab;
