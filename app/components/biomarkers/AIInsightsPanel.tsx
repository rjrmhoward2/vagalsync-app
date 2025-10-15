/**
 * VagalSync V15.0 Ultimate - AI Insights Panel
 * 
 * Generates AI-powered insights based on biomarker patterns.
 * 
 * Features:
 * - Pattern #6: Multi-dimensional pattern recognition (Patent #6)
 * - Detects correlations (e.g., high cortisol + low DHEA = burnout)
 * - Personalized recommendations
 * - Evidence-based interventions
 * - Expandable insight cards
 * 
 * NOTE: This is Phase 1 (rule-based). Phase 2 will integrate Claude API for dynamic insights.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { 
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react';

import { BiomarkerEntry, AIInsight } from '../../types/biomarker.types';
import { detectCorrelations } from '../../utils/calculations';
import { getBiomarkerById } from '../../utils/biomarkerDatabase';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface AIInsightsPanelProps {
  entries: BiomarkerEntry[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AIInsightsPanel({ entries }: AIInsightsPanelProps) {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Generate insights from biomarker data
  const insights = useMemo(() => {
    return generateInsights(entries);
  }, [entries]);

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Group insights by type
  const criticalInsights = insights.filter(i => i.metadata?.status === 'critical');
  const warningInsights = insights.filter(i => i.metadata?.status === 'warning');
  const optimalInsights = insights.filter(i => i.metadata?.status === 'optimal');
  const infoInsights = insights.filter(i => !i.metadata?.status || i.metadata.status === 'info');

  // Get icon for insight type
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'biomarker_analysis':
        return Activity;
      case 'trend_analysis':
        return TrendingUp;
      case 'correlation':
        return Brain;
      case 'recommendation':
        return Lightbulb;
      default:
        return Info;
    }
  };

  // Get styling for status
  const getStatusStyling = (status?: string) => {
    switch (status) {
      case 'critical':
        return {
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-400/30',
          textColor: 'text-red-300',
          iconColor: 'text-red-400',
          icon: AlertTriangle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-400/30',
          textColor: 'text-yellow-300',
          iconColor: 'text-yellow-400',
          icon: AlertTriangle
        };
      case 'optimal':
        return {
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-400/30',
          textColor: 'text-emerald-300',
          iconColor: 'text-emerald-400',
          icon: CheckCircle
        };
      default:
        return {
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-400/30',
          textColor: 'text-blue-300',
          iconColor: 'text-blue-400',
          icon: Info
        };
    }
  };

  // Render insight card
  const renderInsight = (insight: AIInsight) => {
    const isExpanded = expandedInsights.has(insight.id);
    const styling = getStatusStyling(insight.metadata?.status);
    const StatusIcon = styling.icon;
    const TypeIcon = getInsightIcon(insight.type);

    return (
      <div
        key={insight.id}
        className={`${styling.bgColor} border ${styling.borderColor} rounded-xl overflow-hidden transition-all`}
      >
        {/* Header - Always visible */}
        <button
          onClick={() => toggleInsight(insight.id)}
          className="w-full p-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <StatusIcon className={`w-5 h-5 ${styling.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <TypeIcon className="w-4 h-4 text-white/60" />
                <h4 className={`font-bold ${styling.textColor}`}>
                  {insight.title}
                </h4>
              </div>
              <p className="text-white/80 text-sm line-clamp-2">
                {insight.content}
              </p>
              
              {/* Confidence badge */}
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-white/10 rounded-full px-2 py-1 text-xs text-white/60">
                  {Math.round(insight.confidence * 100)}% confidence
                </div>
                {insight.metadata?.impact && (
                  <div className="bg-white/10 rounded-full px-2 py-1 text-xs text-white/60">
                    Impact: {insight.metadata.impact > 0 ? '+' : ''}{insight.metadata.impact}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/10">
            {/* Biomarkers involved */}
            {insight.biomarkerIds.length > 0 && (
              <div>
                <h5 className="text-white/60 text-xs font-medium mb-2 mt-3">RELATED BIOMARKERS</h5>
                <div className="flex flex-wrap gap-2">
                  {insight.biomarkerIds.map(bioId => {
                    const biomarker = getBiomarkerById(bioId);
                    return biomarker ? (
                      <span
                        key={bioId}
                        className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/80"
                      >
                        {biomarker.icon} {biomarker.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insight.metadata?.recommendations && insight.metadata.recommendations.length > 0 && (
              <div>
                <h5 className="text-white/60 text-xs font-medium mb-2">RECOMMENDATIONS</h5>
                <ul className="space-y-2">
                  {insight.metadata.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-white/80 text-sm">
                      <Target className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interventions */}
            {insight.metadata?.interventions && insight.metadata.interventions.length > 0 && (
              <div>
                <h5 className="text-white/60 text-xs font-medium mb-2">SUGGESTED INTERVENTIONS</h5>
                <ul className="space-y-2">
                  {insight.metadata.interventions.map((intervention, index) => (
                    <li key={index} className="flex items-start gap-2 text-white/80 text-sm">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{intervention}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (entries.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <Brain className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">
          Add biomarker measurements to receive personalized AI insights.
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <p className="text-white/80 font-medium mb-2">
          Looking good! No concerning patterns detected.
        </p>
        <p className="text-white/60 text-sm">
          Continue tracking your biomarkers to maintain optimal wellness.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{insights.length}</div>
          <div className="text-white/60 text-xs">Total Insights</div>
        </div>
        {criticalInsights.length > 0 && (
          <div className="bg-red-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{criticalInsights.length}</div>
            <div className="text-red-300 text-xs">Critical</div>
          </div>
        )}
        {warningInsights.length > 0 && (
          <div className="bg-yellow-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{warningInsights.length}</div>
            <div className="text-yellow-300 text-xs">Warnings</div>
          </div>
        )}
        {optimalInsights.length > 0 && (
          <div className="bg-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{optimalInsights.length}</div>
            <div className="text-emerald-300 text-xs">Optimal</div>
          </div>
        )}
      </div>

      {/* Critical Insights */}
      {criticalInsights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-red-400 font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Critical Attention Needed
          </h3>
          {criticalInsights.map(renderInsight)}
        </div>
      )}

      {/* Warning Insights */}
      {warningInsights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-yellow-400 font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Areas for Improvement
          </h3>
          {warningInsights.map(renderInsight)}
        </div>
      )}

      {/* Optimal Insights */}
      {optimalInsights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Strengths to Maintain
          </h3>
          {optimalInsights.map(renderInsight)}
        </div>
      )}

      {/* Info Insights */}
      {infoInsights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-blue-400 font-bold flex items-center gap-2">
            <Info className="w-5 h-5" />
            Additional Insights
          </h3>
          {infoInsights.map(renderInsight)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INSIGHT GENERATION ENGINE
// ============================================================================

/**
 * Generate AI insights from biomarker entries
 * This is Phase 1 (rule-based). Phase 2 will use Claude API for dynamic insights.
 */
function generateInsights(entries: BiomarkerEntry[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Get latest value for each biomarker
  const latestValues = new Map<string, BiomarkerEntry>();
  entries.forEach(entry => {
    const existing = latestValues.get(entry.biomarkerId);
    if (!existing || new Date(entry.timestamp) > new Date(existing.timestamp)) {
      latestValues.set(entry.biomarkerId, entry);
    }
  });

  // 1. Analyze individual biomarkers
  latestValues.forEach(entry => {
    if (!entry.inOptimalRange) {
      const biomarker = getBiomarkerById(entry.biomarkerId);
      if (biomarker) {
        insights.push({
          id: `biomarker_${entry.id}`,
          type: 'biomarker_analysis',
          title: `${biomarker.name} is outside optimal range`,
          content: `Your ${biomarker.name} (${entry.value} ${biomarker.unit}) is outside the optimal range of ${biomarker.optimalRange} ${biomarker.unit}. ${biomarker.clinicalSignificance}`,
          biomarkerIds: [entry.biomarkerId],
          confidence: 0.95,
          timestamp: new Date(),
          expandable: true,
          metadata: {
            status: entry.value > parseFloat(biomarker.optimalRange.split('-')[1] || '999') ? 'warning' : 'warning',
            recommendations: getRecommendationsForBiomarker(biomarker.id, entry.value)
          }
        });
      }
    }
  });

  // 2. Detect correlations (Patent #6)
  const correlations = detectCorrelations(entries);
  
  correlations.forEach(correlation => {
    const correlationInsights = getCorrelationInsight(correlation, entries);
    if (correlationInsights) {
      insights.push(correlationInsights);
    }
  });

  // 3. Generate trend insights (if enough data)
  const biomarkersWithHistory = Array.from(
    new Set(entries.map(e => e.biomarkerId))
  ).filter(bioId => {
    const bioEntries = entries.filter(e => e.biomarkerId === bioId);
    return bioEntries.length >= 3;
  });

  // Limit to avoid too many insights
  return insights.slice(0, 10);
}

/**
 * Get recommendations for a specific biomarker
 */
function getRecommendationsForBiomarker(biomarkerId: string, value: number): string[] {
  const recommendations: Record<string, string[]> = {
    cortisol_am: [
      'Practice stress-reduction techniques (meditation, deep breathing)',
      'Ensure 7-9 hours of quality sleep',
      'Consider adaptogenic herbs (consult healthcare provider)',
      'Limit caffeine intake, especially in afternoon/evening'
    ],
    crp: [
      'Follow an anti-inflammatory diet (Mediterranean style)',
      'Increase omega-3 fatty acids (fish, flaxseed)',
      'Regular moderate exercise (30 min daily)',
      'Maintain healthy weight'
    ],
    fasting_glucose: [
      'Reduce refined carbohydrates and added sugars',
      'Increase fiber intake (vegetables, whole grains)',
      'Practice time-restricted eating',
      'Regular physical activity after meals'
    ],
    vitamin_d: [
      'Increase sun exposure (15-20 min daily, safe hours)',
      'Consider vitamin D3 supplementation (consult provider)',
      'Consume vitamin D-rich foods (fatty fish, egg yolks)',
      'Retest in 3 months to track progress'
    ]
  };

  return recommendations[biomarkerId] || [
    'Consult with a healthcare provider for personalized guidance',
    'Track this biomarker regularly to monitor changes',
    'Consider lifestyle factors that may influence this marker'
  ];
}

/**
 * Get insight for detected correlation
 */
function getCorrelationInsight(correlation: string, entries: BiomarkerEntry[]): AIInsight | null {
  switch (correlation) {
    case 'high_stress_activation':
      return {
        id: 'correlation_stress',
        type: 'correlation',
        title: 'Chronic Stress Activation Detected',
        content: 'Your Cortisol:DHEA ratio is elevated (>15), indicating chronic stress activation and HPA axis dysregulation. This pattern is associated with burnout and reduced stress resilience.',
        biomarkerIds: ['cortisol_dhea_ratio', 'cortisol_am', 'dhea_s'],
        confidence: 0.9,
        timestamp: new Date(),
        expandable: true,
        metadata: {
          status: 'critical',
          recommendations: [
            'Prioritize stress management and recovery',
            'Ensure adequate sleep (7-9 hours)',
            'Consider professional support for chronic stress'
          ],
          interventions: [
            'Daily meditation or mindfulness practice (20+ min)',
            'Adaptogenic herbs (ashwagandha, rhodiola)',
            'Vagal nerve stimulation techniques',
            'Regular nature exposure and social connection'
          ],
          impact: -15
        }
      };

    case 'metabolic_inflammation':
      return {
        id: 'correlation_metabolic',
        type: 'correlation',
        title: 'Metabolic Inflammation Pattern',
        content: 'Elevated CRP combined with high glucose suggests metabolic inflammation. This pattern increases risk for insulin resistance and cardiovascular disease.',
        biomarkerIds: ['crp', 'fasting_glucose'],
        confidence: 0.85,
        timestamp: new Date(),
        expandable: true,
        metadata: {
          status: 'warning',
          recommendations: [
            'Adopt anti-inflammatory diet',
            'Increase physical activity',
            'Focus on blood sugar regulation'
          ],
          interventions: [
            'Mediterranean diet pattern',
            '30+ minutes daily moderate exercise',
            'Omega-3 supplementation (2-3g EPA/DHA daily)',
            'Reduce processed foods and added sugars'
          ],
          impact: -12
        }
      };

    case 'vitamin_d_inflammation':
      return {
        id: 'correlation_vitamin_d',
        type: 'correlation',
        title: 'Vitamin D Deficiency with Inflammation',
        content: 'Low vitamin D combined with elevated CRP. Vitamin D deficiency can contribute to increased inflammation and immune dysfunction.',
        biomarkerIds: ['vitamin_d', 'crp'],
        confidence: 0.8,
        timestamp: new Date(),
        expandable: true,
        metadata: {
          status: 'warning',
          recommendations: [
            'Optimize vitamin D levels (target 40-60 ng/mL)',
            'Increase safe sun exposure',
            'Consider supplementation'
          ],
          interventions: [
            'Vitamin D3 supplementation (dosage per healthcare provider)',
            '15-20 minutes daily sun exposure (safe hours)',
            'Vitamin D-rich foods (fatty fish, egg yolks)',
            'Retest in 3 months'
          ],
          impact: -8
        }
      };

    default:
      return null;
  }
}
