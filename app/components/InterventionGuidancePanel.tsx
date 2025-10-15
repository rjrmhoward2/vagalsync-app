/**
 * VagalSync V15.0 Ultimate - Intervention Guidance Panel Component
 * 
 * Beautiful, detailed intervention recommendations display
 * Integrates with myVagal Tone scoring system
 */

'use client';

import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Brain,
  Moon,
  Zap,
  Snowflake,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';

import {
  generateInterventionRecommendations,
  calculateBiologicalWindows,
  getRecommendationColor,
  getCategoryIcon,
  InterventionRecommendation,
  BiologicalWindow
} from '../utils/interventionGuidance';

import { MyVagalToneScore } from '../types/biomarker.types';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface InterventionGuidancePanelProps {
  myVagalTone: MyVagalToneScore | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InterventionGuidancePanel({ myVagalTone }: InterventionGuidancePanelProps) {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([0])); // First card expanded by default
  const [showBiologicalWindows, setShowBiologicalWindows] = useState(false);

  const recommendations = generateInterventionRecommendations(myVagalTone);
  const biologicalWindows = calculateBiologicalWindows();

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      critical: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'CRITICAL' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-300', label: 'HIGH PRIORITY' },
      medium: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'RECOMMENDED' },
      low: { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'OPTIONAL' }
    };
    const c = config[priority as keyof typeof config];
    return <span className={`${c.bg} ${c.text} px-3 py-1 rounded-full text-xs font-bold`}>{c.label}</span>;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const config = {
      easy: { icon: '✅', label: 'Easy', color: 'text-green-300' },
      moderate: { icon: '⚠️', label: 'Moderate', color: 'text-yellow-300' },
      advanced: { icon: '🔥', label: 'Advanced', color: 'text-red-300' }
    };
    const d = config[difficulty as keyof typeof config];
    return <span className={`${d.color} text-xs flex items-center gap-1`}>{d.icon} {d.label}</span>;
  };

  const getCostBadge = (cost: string) => {
    const config = {
      free: { label: 'Free', color: 'text-green-300' },
      low: { label: '$', color: 'text-blue-300' },
      medium: { label: '$$', color: 'text-yellow-300' },
      high: { label: '$$$', color: 'text-orange-300' }
    };
    const c = config[cost as keyof typeof config];
    return <span className={`${c.color} text-xs font-bold`}>{c.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Personalized Intervention Guidance</h2>
            <p className="text-purple-300 text-sm">Evidence-based protocols tailored to your myVagal Tone™ score</p>
          </div>
        </div>
        
        {myVagalTone && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-purple-500/30">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-xs text-gray-400">Current Score</div>
              <div className="text-2xl font-bold text-white">{myVagalTone.score}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">{myVagalTone.biomarkerCount} biomarkers tracked</div>
              <div className="text-sm text-purple-300">
                {recommendations.length} personalized recommendations generated
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Biological Windows Toggle */}
      <button
        onClick={() => setShowBiologicalWindows(!showBiologicalWindows)}
        className="w-full bg-white/10 hover:bg-white/15 rounded-lg p-4 border border-white/10 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div className="text-left">
            <div className="text-white font-medium">Optimal Timing Windows</div>
            <div className="text-sm text-gray-400">Circadian-aligned intervention scheduling</div>
          </div>
        </div>
        {showBiologicalWindows ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {/* Biological Windows */}
      {showBiologicalWindows && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {biologicalWindows.map((window, idx) => (
            <div key={idx} className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="text-cyan-300 font-bold mb-2">{window.type}</div>
              <div className="text-sm text-white mb-2">
                {window.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                {window.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
              <div className="text-xs text-cyan-400 mb-3">
                {window.effectiveness_multiplier}x effectiveness | {window.confidence}% confidence
              </div>
              <div className="text-xs text-gray-300 mb-2">{window.description}</div>
              <div className="space-y-1">
                {window.recommended_interventions.map((intervention, i) => (
                  <div key={i} className="text-xs text-white/70 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{intervention}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedCards.has(index);
          
          return (
            <div
              key={index}
              className="bg-white/10 backdrop-blur border border-white/10 rounded-xl overflow-hidden transition-all hover:bg-white/15"
            >
              {/* Header - Always Visible */}
              <button
                onClick={() => toggleCard(index)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCategoryIcon(rec.category)}</span>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">{rec.category}</div>
                      <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                    </div>
                  </div>
                  {isExpanded ? 
                    <ChevronUp className="w-6 h-6 text-gray-400" /> : 
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  }
                </div>

                <p className="text-gray-300 mb-4">{rec.description}</p>

                <div className="flex flex-wrap gap-3">
                  {getPriorityBadge(rec.priority)}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity className="w-4 h-4" />
                    <span>{rec.vagal_impact}% vagal impact</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{rec.time_to_benefit}</span>
                  </div>
                  {getDifficultyBadge(rec.difficulty)}
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {getCostBadge(rec.cost)}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-6 border-t border-white/10 pt-6">
                  {/* Scientific Basis */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-300">Scientific Evidence</span>
                    </div>
                    <p className="text-sm text-gray-300 italic">{rec.scientific_basis}</p>
                  </div>

                  {/* Implementation Steps */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-300">Implementation Steps</span>
                    </div>
                    <div className="space-y-2">
                      {rec.implementation_steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                          <span className="bg-green-500/20 text-green-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplements */}
                  {rec.supplements && rec.supplements.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-300">Recommended Supplements</span>
                      </div>
                      <div className="space-y-3">
                        {rec.supplements.map((supp, i) => (
                          <div key={i} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-bold text-white">{supp.name}</div>
                              {supp.cost_per_month && (
                                <div className="text-xs text-yellow-300">{supp.cost_per_month}/mo</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-300 space-y-1">
                              <div><span className="text-yellow-400 font-semibold">Dosage:</span> {supp.dosage}</div>
                              <div><span className="text-yellow-400 font-semibold">Timing:</span> {supp.timing}</div>
                              <div className="text-xs text-gray-400 italic mt-2">{supp.research}</div>
                              <div className="text-xs text-green-300 mt-2">
                                <span className="font-semibold">Safety:</span> {supp.safety}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contraindications */}
                  {rec.contraindications && rec.contraindications.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-semibold text-red-300">Important Considerations</span>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
                        {rec.contraindications.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-200">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Provider Discussion */}
                  {rec.provider_discussion && rec.provider_discussion.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-300">Discuss with Healthcare Provider</span>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 space-y-2">
                        {rec.provider_discussion.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-purple-200">
                            <ExternalLink className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <strong>Wellness Disclaimer:</strong> These recommendations are for general wellness purposes only and do not constitute medical advice. 
            Always consult with a qualified healthcare provider before starting any new supplement, exercise, or intervention program, 
            especially if you have pre-existing health conditions or are taking medications.
          </div>
        </div>
      </div>
    </div>
  );
}
