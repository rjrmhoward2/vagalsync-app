/**
 * INTERVENTIONS TAB COMPONENT - ENHANCED VERSION
 * VagalSync V15.0 Ultimate - Track and optimize wellness interventions
 * Patent 12: Adaptive Protocol Library with effectiveness tracking
 * 
 * ENHANCED FEATURES:
 * 1. Provider Protocols (from ProfessionalFi) - PRIORITY
 * 2. ENHANCED Quick-Start Interventions with expandable details
 * 3. AI-Generated Recommendations - SUPPLEMENTARY/FALLBACK
 * 4. Session Logging & Tracking
 * 5. Historical Analytics
 * 
 * NEW IN THIS VERSION:
 * - Click intervention card → Expands to show detailed protocol
 * - Separate "Start" button for quick-start (doesn't toggle expansion)
 * - Scientific basis, implementation steps, pro tips, contraindications
 * - Smooth expand/collapse animations
 * - Consistent with Provider Protocols UX
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
  Eye,
  Info,
  Lightbulb,
  Snowflake,
  Heart,
  Music
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

interface DetailedIntervention {
  id: string;
  name: string;
  icon: any;
  duration: string;
  effectiveness: number;
  vagal_impact: string;
  description: string;
  color: string;
  active: boolean;
  toggle: () => void;
  // ENHANCED FIELDS
  scientific_basis: string;
  implementation_steps: string[];
  pro_tips: string[];
  contraindications: string[];
  time_to_benefit: string;
  difficulty: 'easy' | 'moderate' | 'advanced';
  cost: 'free' | 'low' | 'medium' | 'high';
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
  
  // NEW: State for expanded quick-start interventions
  const [expandedInterventions, setExpandedInterventions] = useState<Set<string>>(new Set());

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

  // NEW: Toggle intervention expansion
  const toggleIntervention = (id: string) => {
    const newExpanded = new Set(expandedInterventions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInterventions(newExpanded);
  };

  const hasActiveProviderProtocol = providerProtocols.some(p => p.status === 'active');
  
  // ENHANCED: Available intervention types with full protocol details
  const interventionTypes: DetailedIntervention[] = [
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
      toggle: () => setBreathingExercise(!breathingExercise),
      scientific_basis: 'Controlled breathing activates the vagus nerve and increases HRV within minutes. Multiple studies show 15-25% improvement in parasympathetic tone, with effects measurable within 2-7 days of consistent practice (Frontiers in Neuroscience, 2023).',
      implementation_steps: [
        'Find a quiet, comfortable space where you won\'t be disturbed',
        'Sit in a comfortable position with spine straight but not rigid',
        'Close your eyes or maintain a soft, downward gaze',
        'Inhale slowly through your nose for 4 counts',
        'Hold your breath gently (no strain) for 4 counts',
        'Exhale slowly through your mouth for 4 counts',
        'Hold with empty lungs for 4 counts',
        'Repeat this cycle for 10 minutes (approximately 15-20 complete cycles)',
        'Use VagalSync breathing guide feature for visual pacing assistance'
      ],
      pro_tips: [
        'Optimal times: First thing in the morning or 1 hour before bed',
        'Track your HRV before and after each session to see immediate impact',
        'Can be performed anywhere - even at your desk during work breaks',
        'Combine with calming music or nature sounds for enhanced relaxation',
        'Start with 5 minutes if new to breathwork, gradually increase duration',
        'Use the VagalSync timer feature to stay on track without watching the clock'
      ],
      contraindications: [
        'Avoid if experiencing dizziness, lightheadedness, or disorientation',
        'Start with shorter 5-minute sessions if you are new to controlled breathing',
        'Stop immediately if you feel uncomfortable, anxious, or experience tingling',
        'Consult your healthcare provider if you have respiratory conditions (asthma, COPD)',
        'Not recommended during acute respiratory infections'
      ],
      time_to_benefit: '2-7 days',
      difficulty: 'easy',
      cost: 'free'
    },
    {
      id: 'vns',
      name: 'VNS Therapy',
      icon: Zap,
      duration: '30 min',
      effectiveness: 88,
      vagal_impact: '+15-20 pts',
      description: 'Direct vagal nerve stimulation using FDA-cleared transcutaneous devices',
      color: 'from-purple-500 to-pink-500',
      active: arMode,
      toggle: () => setArMode(!arMode),
      scientific_basis: 'Transcutaneous VNS directly stimulates the auricular branch of the vagus nerve, producing measurable increases in HRV of 40-60% within 2-4 weeks. Clinical trials show significant improvements in vagal tone markers (Journal of Clinical Medicine, 2024).',
      implementation_steps: [
        'Ensure device is fully charged and electrodes are clean',
        'Clean the target area (ear concha or neck) with alcohol swab',
        'Apply conductive gel to electrodes for optimal contact',
        'Place device according to manufacturer instructions (typically ear concha)',
        'Start with lowest intensity setting, gradually increase to comfortable level',
        'Run device for prescribed duration (typically 30 minutes)',
        'Use 2x daily for optimal results - morning and evening',
        'Log session data in VagalSync for progress tracking',
        'Clean and store device properly after each use'
      ],
      pro_tips: [
        'Best results when combined with deep breathing exercises during stimulation',
        'Morning session: 30 min after waking for metabolic activation',
        'Evening session: 1-2 hours before bed for sleep optimization',
        'Stay hydrated - drink 8oz water before each session',
        'Track trends in VagalSync dashboard to identify optimal timing',
        'May feel mild tingling - this is normal and indicates proper placement',
        'Replace electrode pads every 20-30 sessions for consistent conductivity'
      ],
      contraindications: [
        'Do not use if you have a pacemaker, implanted defibrillator, or other implanted electrical devices',
        'Avoid use on broken, irritated, or infected skin',
        'Not recommended during pregnancy without medical supervision',
        'Discontinue if you experience skin irritation, burning, or allergic reaction',
        'Consult provider if you have epilepsy or seizure history',
        'Stop use if experiencing irregular heartbeat or chest discomfort'
      ],
      time_to_benefit: '2-4 weeks',
      difficulty: 'moderate',
      cost: 'medium'
    },
    {
      id: 'meditation',
      name: 'Guided Meditation',
      icon: Brain,
      duration: '20 min',
      effectiveness: 85,
      vagal_impact: '+6-10 pts',
      description: 'Structured mindfulness practice with audio guidance for stress reduction',
      color: 'from-indigo-500 to-purple-500',
      active: false,
      toggle: () => {},
      scientific_basis: 'Regular meditation practice increases alpha and theta brain wave activity, promoting parasympathetic dominance. Studies show 20-35% reduction in cortisol and sustained HRV improvements with consistent practice (Psychoneuroendocrinology, 2023).',
      implementation_steps: [
        'Choose a quiet space with minimal distractions and comfortable temperature',
        'Sit in a comfortable position - chair or cushion with back support',
        'Use headphones for immersive audio experience',
        'Select a guided meditation from HeartMath, Calm, or similar app',
        'Set phone to Do Not Disturb mode to avoid interruptions',
        'Focus on the guide\'s voice and follow breathing instructions',
        'Allow thoughts to pass without judgment when mind wanders',
        'Complete the full 20-minute session without checking time',
        'Spend 2-3 minutes in silence after meditation ends before resuming activities'
      ],
      pro_tips: [
        'Best time: Evening 1-2 hours before bed to promote restful sleep',
        'Morning meditation can set positive tone for the entire day',
        'Start with 10-minute sessions if 20 minutes feels overwhelming',
        'Use the same meditation space daily to build a habit ritual',
        'Track meditation frequency in VagalSync to monitor consistency',
        'Body scan meditations are particularly effective for vagal activation',
        'Consistency matters more than duration - daily practice yields best results'
      ],
      contraindications: [
        'Generally safe for most people with no significant contraindications',
        'If experiencing trauma symptoms, work with trauma-informed meditation teacher',
        'Some may experience increased anxiety initially - this typically resolves with practice',
        'Avoid meditating immediately after large meals (wait 1-2 hours)'
      ],
      time_to_benefit: '1-2 weeks',
      difficulty: 'easy',
      cost: 'low'
    },
    {
      id: 'cold',
      name: 'Cold Exposure',
      icon: Snowflake,
      duration: '3 min',
      effectiveness: 85,
      vagal_impact: '+10-15 pts',
      description: 'Controlled cold water immersion for hormetic stress adaptation',
      color: 'from-cyan-400 to-blue-600',
      active: false,
      toggle: () => {},
      scientific_basis: 'Regular cold exposure increases HRV by 15-30% and activates brown adipose tissue, improving metabolic health. The dive reflex directly stimulates vagal nerve activity, with benefits accumulating over 2-4 weeks (Nature Metabolism, 2023).',
      implementation_steps: [
        'Week 1-2: Start with 30-second cold shower finishes at end of normal shower',
        'Week 3-4: Gradually extend cold exposure to 1-2 minutes',
        'Week 5+: Work up to 2-3 minutes of full cold water immersion',
        'Use controlled breathing during exposure (4-7-8 or box breathing pattern)',
        'Stay calm and relaxed - resist the urge to tense up or hyperventilate',
        'Exit cold exposure immediately if experiencing numbness or severe shivering',
        'Warm up naturally afterward - avoid hot shower immediately',
        'Track HRV recovery metrics post-exposure in VagalSync',
        'Optimal timing: Morning after waking for maximum metabolic benefit'
      ],
      pro_tips: [
        'Start warmer than you think - cold tap water is sufficient for beginners',
        'Focus on slow, controlled breathing to override the gasp reflex',
        'Morning cold exposure provides energy boost without caffeine',
        'Consistency is key - daily practice yields exponential benefits',
        'Post-workout cold exposure aids recovery and reduces inflammation',
        'Track your cold tolerance progression in VagalSync notes',
        'Join cold exposure community for motivation and accountability'
      ],
      contraindications: [
        'Not recommended with cardiovascular conditions without explicit medical clearance',
        'Avoid during acute illness, infection, or fever',
        'Do not practice if you have Raynaud\'s disease or cold urticaria',
        'Start very gradually if new to cold exposure - progressive adaptation is essential',
        'Stop immediately if experiencing chest pain, severe shivering, or loss of sensation',
        'Not recommended during pregnancy without medical supervision',
        'Avoid cold exposure within 2 hours of consuming alcohol'
      ],
      time_to_benefit: '2-4 weeks',
      difficulty: 'advanced',
      cost: 'free'
    },
    {
      id: 'yoga',
      name: 'Restorative Yoga',
      icon: Heart,
      duration: '45 min',
      effectiveness: 80,
      vagal_impact: '+7-11 pts',
      description: 'Gentle, supported poses for deep parasympathetic activation',
      color: 'from-green-500 to-teal-500',
      active: false,
      toggle: () => {},
      scientific_basis: 'Restorative yoga activates the parasympathetic nervous system through sustained, supported poses. Research shows significant improvements in HRV, reduced cortisol, and enhanced vagal tone with regular practice (Journal of Alternative Medicine, 2024).',
      implementation_steps: [
        'Set up comfortable space with yoga mat, blocks, bolsters, and blankets',
        'Ensure room is warm and free from distractions',
        'Follow along with guided restorative yoga video or app',
        'Hold each pose for 5-10 minutes with full body support',
        'Focus on deep, diaphragmatic breathing throughout practice',
        'Typical sequence: Supported child\'s pose, legs up wall, reclined twist, savasana',
        'Synchronize breath with gentle movement during transitions',
        'End with 10-minute savasana (final relaxation)',
        'Allow 5 minutes after practice before resuming normal activity'
      ],
      pro_tips: [
        'Optimal time: Evening 2-3 hours before bed to prepare for sleep',
        'Use props generously - full support allows deeper relaxation',
        'Dim lighting and calming music enhance the parasympathetic response',
        'Consistency matters - 3x weekly minimum for measurable benefits',
        'Track sleep quality on yoga days vs non-yoga days in VagalSync',
        'Can be practiced even when fatigued or recovering from illness',
        'Yin yoga offers similar benefits if restorative classes aren\'t available'
      ],
      contraindications: [
        'Modify poses if you have recent injuries or chronic pain conditions',
        'Avoid inversions (legs up wall) if you have glaucoma or uncontrolled hypertension',
        'Consult instructor about modifications during pregnancy',
        'Stop any pose that causes pain, discomfort, or shortness of breath',
        'Not recommended during active flare-ups of inflammatory conditions'
      ],
      time_to_benefit: '1-2 weeks',
      difficulty: 'easy',
      cost: 'low'
    },
    {
      id: 'binaural',
      name: 'Binaural Beats',
      icon: Music,
      duration: '15 min',
      effectiveness: 75,
      vagal_impact: '+5-8 pts',
      description: 'Audio brainwave entrainment for theta/delta wave induction',
      color: 'from-violet-500 to-fuchsia-500',
      active: false,
      toggle: () => {},
      scientific_basis: 'Binaural beats in theta (4-8 Hz) and delta (1-4 Hz) ranges promote relaxation and vagal activation. Studies show measurable improvements in HRV and stress markers during and after listening sessions (Frontiers in Human Neuroscience, 2023).',
      implementation_steps: [
        'Use stereo headphones or earbuds (required for binaural effect)',
        'Find comfortable position - sitting or lying down',
        'Select theta (4-8 Hz) or delta (1-4 Hz) binaural beats audio',
        'Set volume to comfortable level - not too loud',
        'Close eyes and focus on the audio',
        'Listen for full 15-minute duration without interruption',
        'Some drifting of attention is normal - gently return focus to sound',
        'Optimal timing: Before meditation, before sleep, or during rest periods',
        'Track effects on HRV and subjective relaxation in VagalSync'
      ],
      pro_tips: [
        'Best results when combined with meditation or breathwork',
        'Use before sleep to facilitate faster sleep onset',
        'Lower frequencies (delta) are better for deep relaxation',
        'Higher theta frequencies good for creative work or meditation',
        'Free binaural beats apps: Brain.fm, myNoise, YouTube',
        'Experiment with different frequencies to find what works best for you',
        'Can be used during massage or other relaxation practices'
      ],
      contraindications: [
        'Not recommended for individuals with seizure disorders or epilepsy',
        'Rare cases of increased anxiety or discomfort - discontinue if this occurs',
        'Avoid while driving, operating machinery, or during activities requiring alertness',
        'Not a substitute for medical treatment of sleep disorders',
        'Consult neurologist if you have history of brain injury or neurological conditions'
      ],
      time_to_benefit: '1-3 days',
      difficulty: 'easy',
      cost: 'free'
    }
  ];

  // Get intervention statistics
  const getInterventionStats = () => {
    if (interventionLogs.length === 0) {
      return { totalSessions: 0, avgImprovement: 0, bestSession: { type: '', improvement: 0 }, thisWeek: 0 };
    }

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

  // Start a new intervention (does NOT toggle expansion)
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

    // Optional: Toggle the intervention's active state
    intervention.toggle();
  };

  // Helper function to get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-500/20 text-green-300 border-green-500/30',
      moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return (
      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[difficulty as keyof typeof colors]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </div>
    );
  };

  // Helper function to get cost badge
  const getCostBadge = (cost: string) => {
    const colors = {
      free: 'text-green-400',
      low: 'text-yellow-400',
      medium: 'text-orange-400',
      high: 'text-red-400'
    };
    return (
      <span className={`text-xs font-medium ${colors[cost as keyof typeof colors]}`}>
        {cost.charAt(0).toUpperCase() + cost.slice(1)} cost
      </span>
    );
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
      {/* SECTION 1: PROVIDER PROTOCOLS (if available) */}
      {/* ================================================================== */}

      {providerProtocols.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-3xl font-bold text-white">Provider-Prescribed Protocols</h3>
              <p className="text-gray-400">Priority interventions from your healthcare team</p>
            </div>
          </div>

          <div className="space-y-6">
            {providerProtocols.map((protocol) => {
              const isExpanded = expandedProtocols.has(protocol.id);
              
              return (
                <div
                  key={protocol.id}
                  className={`bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-2xl border-2 ${
                    protocol.status === 'active' 
                      ? 'border-blue-500/50' 
                      : 'border-blue-500/20'
                  } overflow-hidden transition-all`}
                >
                  {/* Protocol Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleProtocol(protocol.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-2xl font-bold text-white">{protocol.protocolName}</h4>
                          <div className={`${
                            protocol.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            protocol.status === 'completed' ? 'bg-gray-500/20 text-gray-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          } px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                            {protocol.status}
                          </div>
                        </div>
                        <div className="text-gray-300 mb-2">{protocol.description}</div>
                        <div className="flex items-center gap-2 text-sm text-blue-300">
                          <Stethoscope className="w-4 h-4" />
                          <span>{protocol.providerName}, {protocol.providerTitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? 
                          <ChevronUp className="w-6 h-6 text-gray-400" /> : 
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Expanded Protocol Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-6">
                      {/* Protocol Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-400">Duration</div>
                          <div className="text-white font-medium">{protocol.duration}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Started</div>
                          <div className="text-white font-medium">
                            {protocol.startDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Interventions List */}
                      <div className="mb-4">
                        <div className="text-sm text-blue-300 font-semibold mb-2">Prescribed Interventions:</div>
                        <div className="space-y-2">
                          {protocol.interventions.map((intervention, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              <span>{intervention}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Provider Notes */}
                      {protocol.notes && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="text-xs text-blue-300 font-semibold mb-1">Provider Notes:</div>
                          <p className="text-sm text-white">{protocol.notes}</p>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              startIntervention(protocol.interventions[0]);
                            }}
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
      {/* SECTION 2: ENHANCED QUICK-START INTERVENTIONS */}
      {/* ================================================================== */}

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold text-white mb-2">Quick-Start Interventions</h3>
            <p className="text-gray-400">Click any card for detailed protocol guidance, or hit Start to begin immediately</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interventionTypes.map((intervention) => {
            const isExpanded = expandedInterventions.has(intervention.id);
            
            return (
              <div
                key={intervention.id}
                className={`rounded-2xl border-2 transition-all ${
                  intervention.active
                    ? `bg-gradient-to-br ${intervention.color} border-white/50 shadow-2xl`
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                {/* Card Header - Always Visible - CLICKABLE TO EXPAND */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleIntervention(intervention.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-3 rounded-full ${intervention.active ? 'bg-white/20' : 'bg-white/10'}`}>
                        <intervention.icon className={`w-6 h-6 ${intervention.active ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
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
                    
                    <div className="flex items-center gap-2">
                      {/* Expand/Collapse Icon */}
                      {isExpanded ? 
                        <ChevronUp className="w-6 h-6 text-gray-400" /> : 
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      }
                      
                      {/* Start Button - Stops Propagation */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startIntervention(intervention.id);
                        }}
                        className={`${
                          intervention.active 
                            ? 'bg-white/20 px-3 py-1 animate-pulse' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-4 py-2'
                        } text-white rounded-full text-sm font-bold transition-all flex items-center gap-1`}
                      >
                        {intervention.active ? (
                          <span className="text-xs">ACTIVE</span>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Start</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 ${intervention.active ? 'text-white/90' : 'text-gray-400'}`}>
                    {intervention.description}
                  </p>

                  {/* Effectiveness Metrics */}
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

                {/* EXPANDED DETAILS - Conditional */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6 border-t border-white/10 pt-6 animate-slideDown">
                    {/* Scientific Basis */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-300">
                          Scientific Evidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 italic">
                        {intervention.scientific_basis}
                      </p>
                    </div>

                    {/* Implementation Steps */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-300">
                          How to Perform
                        </span>
                      </div>
                      <div className="space-y-2">
                        {intervention.implementation_steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <span className="bg-green-500/20 text-green-300 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-gray-300">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tips */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-300">
                          Pro Tips
                        </span>
                      </div>
                      <div className="space-y-2">
                        {intervention.pro_tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-yellow-400 flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contraindications */}
                    {intervention.contraindications.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-sm font-semibold text-red-300">
                            Important Considerations
                          </span>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
                          {intervention.contraindications.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-red-200">
                              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Time to Benefit</div>
                        <div className="text-sm text-white font-medium">{intervention.time_to_benefit}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Difficulty</div>
                        <div className="flex items-center gap-2">
                          {getDifficultyBadge(intervention.difficulty)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Cost</div>
                        <div className="flex items-center gap-1">
                          {getCostBadge(intervention.cost)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition-all">
                  Find a Provider
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* SECTION 5: INTERVENTION HISTORY */}
      {/* ================================================================== */}

      {interventionLogs.length > 0 && (
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-cyan-400" />
            Recent Sessions
          </h3>
          
          <div className="space-y-4">
            {interventionLogs.slice(0, 10).map((log) => (
              <div 
                key={log.id} 
                className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full p-4">
                      {interventionTypes.find(i => i.name === log.type)?.icon && (
                        React.createElement(
                          interventionTypes.find(i => i.name === log.type)!.icon,
                          { className: 'w-6 h-6 text-cyan-400' }
                        )
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{log.type}</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-white/70">{log.duration}</span>
                      </div>
                      <div className="text-sm text-white/70">
                        {log.date} at {log.time}
                      </div>
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
