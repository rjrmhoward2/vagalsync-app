'use client'

import HelpMenu from './components/shared/HelpMenu'

// ============================================================================
// TYPE IMPORTS
// ============================================================================
import { InterventionLog } from './types/intervention.types';

// ============================================================================
// COMPONENT IMPORTS
// ============================================================================
import InterventionsTab from './InterventionsTab';
import AnalyticsTab from './AnalyticsTab';
import SettingsTab from './SettingsTab';
import SocialTab from './SocialTab';
import TrendChart from './components/TrendChart';

// ============================================================================
// REACT
// ============================================================================
import React, { useState, useEffect } from 'react';

// ============================================================================
// NEW TAB COMPONENTS (From Integration)
// ============================================================================
import DeviceConnectionTab from './components/devices/DeviceConnectionTab';
import PredictiveAnalyticsTab from './components/predictions/PredictiveAnalyticsTab';
import GeneticUploadTab from './components/genetic/GeneticUploadTab';

// ============================================================================
// LUCIDE ICONS - Single import for PredictionIcon alias
// ============================================================================
import { TrendingUp as PredictionIcon } from 'lucide-react';

// ============================================================================
// LUCIDE ICONS - Main import (includes Shield, Wifi, and everything else)
// ============================================================================
import {
  Heart, Activity, Thermometer, Droplets, Brain, Smartphone, Watch,
  Headphones, Zap, Plus, X, Play, Pause, BarChart3, TrendingUp, Award,
  Clock, Target, CheckCircle, Beaker, MessageCircle, Calendar, AlertCircle,
  Lightbulb, Settings, Shield, Info, ExternalLink, Mic, MicOff, Share2,
  Eye, Glasses, Users, Sparkles, Sun, Moon, Wind, Volume2, VolumeX,
  Battery, Wifi, Camera, Maximize2, Minimize2, ShoppingCart, TrendingDown,
  Zap as Lightning, BookOpen, DollarSign, Package, Minus
} from 'lucide-react';

// ============================================================================
// BIOMARKER COMPONENTS
// ============================================================================
import BiomarkerTab from './components/biomarkers/BiomarkerTab';
import { FlaskConical } from 'lucide-react';

// ============================================================================
// SERVICES
// ============================================================================
import { getCurrentMyVagalTone } from './services/storageService';

// ============================================================================
// MARKETPLACE
// ============================================================================
import MarketplaceTab from './components/marketplace/MarketplaceTab';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Metric {
  value: number | string;
  enabled: boolean;
  source: 'device' | 'lab';
  confidence: number;
  timestamp?: Date;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Metric {
  value: number | string;
  enabled: boolean;
  source: 'device' | 'lab';
  confidence: number;
  timestamp?: Date;
}

interface Metrics {
  [key: string]: Metric;
}

interface Device {
  id: string;
  name: string;
  icon: any;
  metrics: string[];
  accuracy: number;
  connected: boolean;
  color: string;
  revolutionary: boolean;
  price?: number;
  affiliate_link?: string;
}

interface BiologicalWindow {
  type: string;
  start: Date;
  end: Date;
  effectiveness_multiplier: number;
  confidence: number;
  recommended_interventions: string[];
}

interface AIRecommendation {
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  effectiveness_score: number;
  vagal_impact: number;
  time_to_benefit: string;
  scientific_basis: string;
  implementation_steps: string[];
  contraindications?: string[];
  supplements?: Array<{
    name: string;
    dosage: string;
    timing: string;
    research: string;
    safety: string;
  }>;
  provider_discussion?: string[];
}

interface MarketplaceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  condition: 'new' | 'used' | 'refurbished';
  seller_rating: number;
  vagal_impact_score: number;
  user_reviews: number;
  effectiveness_data?: {
    avg_improvement: number;
    sample_size: number;
  };
  affiliate_link?: string;
  image?: string;
}

interface PredictiveInsight {
  type: 'opportunity' | 'warning' | 'optimization';
  message: string;
  confidence: number;
  action_items: string[];
  potential_improvement: number;
}

interface BreathingPattern {
  id: 'box' | 'resonance' | '478' | 'coherence';
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  cycles: number;
  effectiveness: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VagalSyncV15UltimateWellnessApp: React.FC = () => {

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Core States
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [vagalToneScore, setVagalToneScore] = useState<number>(0);
  const [previousScore, setPreviousScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // AI & Prediction States
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [biologicalWindows, setBiologicalWindows] = useState<BiologicalWindow[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);

  // Marketplace States
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('all');
  const [userListings, setUserListings] = useState<MarketplaceItem[]>([]);

  // UI States
  const [claudeRecommendation, setClaudeRecommendation] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(false);
  const [arMode, setArMode] = useState<boolean>(false);
  const [socialMode, setSocialMode] = useState<boolean>(false);
  const [aiCoachActive, setAiCoachActive] = useState<boolean>(true);
  const [breathingExercise, setBreathingExercise] = useState<boolean>(false);
  const [breathingPattern, setBreathingPattern] = useState<'box' | 'resonance' | '478' | 'coherence'>('box');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter'>('inhale');
  const [interventionLogs, setInterventionLogs] = useState<InterventionLog[]>([]);
  const [batteryLevel, setBatteryLevel] = useState<number>(87);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [floatingWidget, setFloatingWidget] = useState<boolean>(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState<boolean>(false);

  // Speech synthesis helper
  const speak = (text: string) => {
    if ('speechSynthesis' in window && voiceGuidance) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ============================================================================
  // STEP 3: ADD STATE FOR TREND DATA
  // ============================================================================

  // Add these state variables near the top of your component (around line 100)

  const [trendData, setTrendData] = useState({
    score: [
      { date: 'Mon', score: 68 },
      { date: 'Tue', score: 70 },
      { date: 'Wed', score: 69 },
      { date: 'Thu', score: 72 },
      { date: 'Fri', score: 75 },
      { date: 'Sat', score: 73 },
      { date: 'Sun', score: 50 } // Will be updated with current score
    ],
    hrv: [
      { date: 'Mon', hrv: 45 },
      { date: 'Tue', hrv: 48 },
      { date: 'Wed', hrv: 47 },
      { date: 'Thu', hrv: 51 },
      { date: 'Fri', hrv: 54 },
      { date: 'Sat', hrv: 52 },
      { date: 'Sun', hrv: 50 }
    ],
    sleep: [
      { date: 'Mon', sleep: 72 },
      { date: 'Tue', sleep: 75 },
      { date: 'Wed', sleep: 70 },
      { date: 'Thu', sleep: 78 },
      { date: 'Fri', sleep: 80 },
      { date: 'Sat', sleep: 76 },
      { date: 'Sun', sleep: 75 }
    ]
  });
  // Social & Achievement States
  const [socialStreak, setSocialStreak] = useState<number>(7);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<'free' | 'silver' | 'gold' | 'platinum'>('free');

  // Breathing patterns
  const breathingPatterns: Record<string, BreathingPattern> = {
    box: {
      id: 'box',
      name: 'Box Breathing',
      description: 'Navy SEAL technique - equal intervals',
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdAfter: 4,
      cycles: 5,
      effectiveness: 85
    },
    resonance: {
      id: 'resonance',
      name: 'Resonance Breathing',
      description: 'Optimal HRV enhancement - 5.5 breaths/min',
      inhale: 5,
      hold: 0,
      exhale: 6,
      holdAfter: 0,
      cycles: 6,
      effectiveness: 95
    },
    '478': {
      id: '478',
      name: '4-7-8 Breathing',
      description: 'Dr. Weil method - rapid relaxation',
      inhale: 4,
      hold: 7,
      exhale: 8,
      holdAfter: 0,
      cycles: 4,
      effectiveness: 90
    },
    coherence: {
      id: 'coherence',
      name: 'Cardiac Coherence',
      description: 'HeartMath technique - emotional balance',
      inhale: 5,
      hold: 0,
      exhale: 5,
      holdAfter: 0,
      cycles: 10,
      effectiveness: 92
    }
  };

  // Comprehensive Biomarker State
  const [metrics, setMetrics] = useState<Metrics>({
    // Cardiovascular
    heartRateVariability: { value: 0, enabled: false, source: 'device', confidence: 0 },
    restingHeartRate: { value: 0, enabled: false, source: 'device', confidence: 0 },
    bloodPressure: { value: '0/0', enabled: false, source: 'device', confidence: 0 },
    cardiacCoherence: { value: 0, enabled: false, source: 'device', confidence: 0 },

    // Respiratory
    breathingRate: { value: 0, enabled: false, source: 'device', confidence: 0 },
    oxygenSaturation: { value: 0, enabled: false, source: 'device', confidence: 0 },
    respiratoryVariability: { value: 0, enabled: false, source: 'device', confidence: 0 },

    // Sleep
    sleepQuality: { value: 0, enabled: false, source: 'device', confidence: 0 },
    deepSleepPercentage: { value: 0, enabled: false, source: 'device', confidence: 0 },
    remSleepPercentage: { value: 0, enabled: false, source: 'device', confidence: 0 },
    sleepLatency: { value: 0, enabled: false, source: 'device', confidence: 0 },

    // Activity
    recoveryScore: { value: 0, enabled: false, source: 'device', confidence: 0 },
    steps: { value: 0, enabled: false, source: 'device', confidence: 0 },
    activeMinutes: { value: 0, enabled: false, source: 'device', confidence: 0 },
    exerciseIntensity: { value: 0, enabled: false, source: 'device', confidence: 0 },
    caloriesBurned: { value: 0, enabled: false, source: 'device', confidence: 0 },

    // Stress & ANS
    stressLevel: { value: 0, enabled: false, source: 'device', confidence: 0 },
    sympatheticActivity: { value: 0, enabled: false, source: 'device', confidence: 0 },
    parasympatheticActivity: { value: 0, enabled: false, source: 'device', confidence: 0 },
    autonomicBalance: { value: 0, enabled: false, source: 'device', confidence: 0 },

    // Hormones (Lab)
    cortisol: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    cortisolAwakeningResponse: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    dheas: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    testosterone: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    estradiol: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    progesterone: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    thyroidTsh: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    thyroidT3: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    thyroidT4: { value: 0, enabled: false, source: 'lab', confidence: 0 },

    // Inflammation (Lab)
    crp: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    interleukin6: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    tnfAlpha: { value: 0, enabled: false, source: 'lab', confidence: 0 },

    // Metabolic (Lab)
    glucose: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    insulin: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    hbA1c: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    lactate: { value: 0, enabled: false, source: 'lab', confidence: 0 },
    ketones: { value: 0, enabled: false, source: 'lab', confidence: 0 }
  });

  // ============================================================================
  // AVAILABLE DEVICES DATABASE
  // ============================================================================

  const availableDevices: Device[] = [
    {
      id: 'apple-watch',
      name: 'Apple Watch',
      icon: Watch,
      metrics: ['heartRateVariability', 'restingHeartRate', 'bloodPressure', 'oxygenSaturation', 'sleepQuality', 'steps', 'activeMinutes', 'caloriesBurned'],
      accuracy: 95,
      connected: false,
      color: 'from-gray-600 to-gray-800',
      revolutionary: true,
      price: 399,
      affiliate_link: 'https://apple.com/watch'
    },
    {
      id: 'oura-ring',
      name: 'Oura Ring',
      icon: Target,
      metrics: ['heartRateVariability', 'restingHeartRate', 'sleepQuality', 'deepSleepPercentage', 'remSleepPercentage', 'recoveryScore', 'stressLevel'],
      accuracy: 98,
      connected: false,
      color: 'from-purple-600 to-blue-600',
      revolutionary: true,
      price: 299,
      affiliate_link: 'https://ouraring.com'
    },
    {
      id: 'whoop',
      name: 'Whoop Strap',
      icon: Activity,
      metrics: ['heartRateVariability', 'recoveryScore', 'stressLevel', 'sleepQuality', 'exerciseIntensity'],
      accuracy: 97,
      connected: false,
      color: 'from-red-600 to-pink-600',
      revolutionary: true,
      price: 30,
      affiliate_link: 'https://whoop.com'
    },
    {
      id: 'garmin-forerunner',
      name: 'Garmin Forerunner',
      icon: Watch,
      metrics: ['heartRateVariability', 'restingHeartRate', 'stressLevel', 'recoveryScore', 'oxygenSaturation', 'steps', 'activeMinutes'],
      accuracy: 94,
      connected: false,
      color: 'from-blue-700 to-cyan-700',
      revolutionary: false,
      price: 349,
      affiliate_link: 'https://garmin.com'
    },
    {
      id: 'fitbit-sense',
      name: 'Fitbit Sense',
      icon: Activity,
      metrics: ['heartRateVariability', 'restingHeartRate', 'stressLevel', 'sleepQuality', 'steps', 'oxygenSaturation'],
      accuracy: 91,
      connected: false,
      color: 'from-indigo-600 to-purple-600',
      revolutionary: false,
      price: 299,
      affiliate_link: 'https://fitbit.com'
    },
    {
      id: 'polar-h10',
      name: 'Polar H10',
      icon: Heart,
      metrics: ['heartRateVariability', 'restingHeartRate', 'exerciseIntensity'],
      accuracy: 99,
      connected: false,
      color: 'from-red-700 to-pink-700',
      revolutionary: false,
      price: 89,
      affiliate_link: 'https://polar.com'
    },
    {
      id: 'samsung-galaxy-watch',
      name: 'Samsung Galaxy Watch',
      icon: Watch,
      metrics: ['heartRateVariability', 'restingHeartRate', 'sleepQuality', 'stressLevel', 'steps', 'bloodPressure'],
      accuracy: 92,
      connected: false,
      color: 'from-slate-600 to-gray-700',
      revolutionary: false,
      price: 279,
      affiliate_link: 'https://samsung.com'
    },
    {
      id: 'muse-headband',
      name: 'Muse Headband',
      icon: Headphones,
      metrics: ['stressLevel', 'breathingRate', 'heartRateVariability'],
      accuracy: 88,
      connected: false,
      color: 'from-teal-600 to-cyan-600',
      revolutionary: true,
      price: 249,
      affiliate_link: 'https://choosemuse.com'
    },
    {
      id: 'apollo-neuro',
      name: 'Apollo Neuro',
      icon: Zap,
      metrics: ['stressLevel', 'heartRateVariability', 'autonomicBalance', 'parasympatheticActivity'],
      accuracy: 92,
      connected: false,
      color: 'from-blue-500 to-cyan-500',
      revolutionary: true,
      price: 349,
      affiliate_link: 'https://apolloneuro.com'
    },
    {
      id: 'pulsetto',
      name: 'Pulsetto VNS',
      icon: Heart,
      metrics: ['heartRateVariability', 'parasympatheticActivity', 'stressLevel', 'autonomicBalance'],
      accuracy: 90,
      connected: false,
      color: 'from-green-500 to-emerald-600',
      revolutionary: true,
      price: 269,
      affiliate_link: 'https://pulsetto.tech'
    },
    {
      id: 'withings-scanwatch',
      name: 'Withings ScanWatch',
      icon: Watch,
      metrics: ['heartRateVariability', 'restingHeartRate', 'oxygenSaturation', 'sleepQuality', 'steps'],
      accuracy: 93,
      connected: false,
      color: 'from-gray-700 to-slate-800',
      revolutionary: false,
      price: 279,
      affiliate_link: 'https://withings.com'
    },
    {
      id: 'dexcom-g7',
      name: 'Dexcom G7 CGM',
      icon: Droplets,
      metrics: ['glucose'],
      accuracy: 100,
      connected: false,
      color: 'from-orange-600 to-red-600',
      revolutionary: true,
      price: 0,
      affiliate_link: 'https://dexcom.com'
    },
    {
      id: 'freestyle-libre',
      name: 'FreeStyle Libre',
      icon: Droplets,
      metrics: ['glucose'],
      accuracy: 98,
      connected: false,
      color: 'from-yellow-600 to-orange-600',
      revolutionary: true,
      price: 0,
      affiliate_link: 'https://freestylelibre.us'
    },
    {
      id: 'smart-glasses',
      name: 'AR Smart Glasses',
      icon: Glasses,
      metrics: ['heartRateVariability', 'stressLevel', 'breathingRate'],
      accuracy: 85,
      connected: false,
      color: 'from-cyan-500 to-blue-600',
      revolutionary: true,
      price: 299,
      affiliate_link: '#'
    }
  ];

  // Sample marketplace items
  const sampleMarketplaceItems: MarketplaceItem[] = [
    {
      id: 'item-1',
      name: 'Oura Ring Gen 3',
      category: 'wearables',
      price: 299,
      condition: 'new',
      seller_rating: 4.8,
      vagal_impact_score: 92,
      user_reviews: 1247,
      effectiveness_data: {
        avg_improvement: 18,
        sample_size: 523
      },
      affiliate_link: 'https://ouraring.com'
    },
    {
      id: 'item-2',
      name: 'Apollo Neuro',
      category: 'neuromodulation',
      price: 349,
      condition: 'new',
      seller_rating: 4.6,
      vagal_impact_score: 85,
      user_reviews: 892,
      effectiveness_data: {
        avg_improvement: 15,
        sample_size: 412
      },
      affiliate_link: 'https://apolloneuro.com'
    }
  ];

  // Navigation tabs
  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'biomarkers', label: 'Biomarkers', icon: FlaskConical },
    { id: 'devices', label: 'Devices', icon: Wifi },              // 🆕 ADD THIS
    { id: 'predictions', label: 'Predictions', icon: PredictionIcon }, // 🆕 ADD THIS
    { id: 'genetics', label: 'Genetics', icon: Shield },          // 🆕 ADD THIS
    { id: 'interventions', label: 'Interventions', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'social', label: 'Community', icon: Users },
    { id: 'plans', label: 'Plans', icon: Award }
  ];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'from-green-500/20 to-emerald-500/20';
    if (score >= 60) return 'from-cyan-500/20 to-blue-500/20';
    if (score >= 40) return 'from-yellow-500/20 to-orange-500/20';
    return 'from-orange-500/20 to-red-500/20';
  };

  const getTrendIcon = () => {
    const diff = Math.round(vagalToneScore) - Math.round(previousScore);
    if (Math.abs(diff) < 1) return <Minus className="w-4 h-4" />;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const getStatusText = (score: number): string => {
    if (score >= 80) return 'Elite Resilience';
    if (score >= 70) return 'Optimal';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical - Intervention Required';
  };

  const getStatusColor = (score: number): string => {
    if (score >= 80) return 'text-cyan-300';
    if (score >= 70) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50/10';
      case 'high': return 'border-l-orange-500 bg-orange-50/10';
      case 'medium': return 'border-l-blue-500 bg-blue-50/10';
      case 'low': return 'border-l-green-500 bg-green-50/10';
      default: return 'border-l-gray-500 bg-gray-50/10';
    }
  };

  // ============================================================================
  // VAGAL TONE CALCULATION
  // ============================================================================

  const calculateVagalTone = (): number => {
    let score = 50; // Base score
    let weights = 0;

    // Source-based confidence weighting
    const sourceWeights = {
      device: 0.8,
      lab: 1.0
    };

    // HRV contribution (25% weight)
    if (metrics.heartRateVariability.enabled) {
      const hrv = Number(metrics.heartRateVariability.value);
      const weight = sourceWeights[metrics.heartRateVariability.source] * 0.25;
      score += (hrv > 60 ? 10 : hrv > 50 ? 7 : hrv > 40 ? 3 : hrv > 30 ? -3 : -7) * weight;
      weights += weight;
    }

    // Resting HR contribution (15%)
    if (metrics.restingHeartRate.enabled) {
      const rhr = Number(metrics.restingHeartRate.value);
      const weight = sourceWeights[metrics.restingHeartRate.source] * 0.15;
      score += (rhr < 55 ? 8 : rhr < 65 ? 5 : rhr < 75 ? 0 : rhr < 85 ? -5 : -10) * weight;
      weights += weight;
    }

    // Sleep quality (20%)
    if (metrics.sleepQuality.enabled) {
      const sleep = Number(metrics.sleepQuality.value);
      const weight = sourceWeights[metrics.sleepQuality.source] * 0.20;
      score += (sleep > 80 ? 10 : sleep > 70 ? 6 : sleep > 60 ? 2 : sleep > 50 ? -2 : -6) * weight;
      weights += weight;
    }

    // Stress levels (15%)
    if (metrics.stressLevel.enabled) {
      const stress = Number(metrics.stressLevel.value);
      const weight = sourceWeights[metrics.stressLevel.source] * 0.15;
      score += (stress < 25 ? 8 : stress < 40 ? 4 : stress < 55 ? 0 : stress < 70 ? -4 : -8) * weight;
      weights += weight;
    }

    // Cortisol (15% if available)
    if (metrics.cortisol.enabled) {
      const cortisol = Number(metrics.cortisol.value);
      const weight = sourceWeights[metrics.cortisol.source] * 0.15;
      score += (cortisol < 10 ? 8 : cortisol < 15 ? 5 : cortisol < 20 ? 0 : cortisol < 25 ? -3 : -8) * weight;
      weights += weight;
    }

    // Metabolic contribution (10%)
    if (metrics.glucose.enabled) {
      const glucose = Number(metrics.glucose.value);
      const weight = sourceWeights[metrics.glucose.source] * 0.10;
      score += (glucose < 95 ? 5 : glucose < 105 ? 2 : glucose < 115 ? -2 : -5) * weight;
      weights += weight;
    }

    // Intervention bonus
    if (breathingExercise) score += 5;
    if (arMode) score += 3;

    // Normalize and cap
    return Math.max(0, Math.min(100, score));
  };

  // ============================================================================
  // DEVICE CONNECTION HANDLER
  // ============================================================================

  const toggleDevice = (deviceId: string) => {
    if (selectedDevices.includes(deviceId)) {
      setSelectedDevices(selectedDevices.filter(d => d !== deviceId));
    } else {
      if (userLevel === 'free' && selectedDevices.length >= 3) {
        setShowUpgradePrompt(true);
        return;
      }
      setSelectedDevices([...selectedDevices, deviceId]);

      // Simulate device metrics being enabled
      const device = availableDevices.find(d => d.id === deviceId);
      if (device) {
        const updatedMetrics = { ...metrics };
        device.metrics.forEach(metricKey => {
          if (updatedMetrics[metricKey]) {
            updatedMetrics[metricKey].enabled = true;
            updatedMetrics[metricKey].confidence = device.accuracy;
          }
        });
        setMetrics(updatedMetrics);
      }
    }
  };

  // ============================================================================
  // AI RECOMMENDATIONS GENERATOR
  // ============================================================================

  const generateAIRecommendations = (): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = [];
    const score = vagalToneScore;

    // Critical interventions for low scores
    if (score < 50) {
      recommendations.push({
        category: 'Critical Intervention',
        priority: 'critical',
        title: 'Immediate Stress Reduction Protocol',
        description: 'Your myVagal Tone indicates significant autonomic dysregulation requiring immediate intervention.',
        effectiveness_score: 92,
        vagal_impact: 85,
        time_to_benefit: '2-4 weeks',
        scientific_basis: 'Meta-analysis of 47 RCTs shows multi-modal interventions improve HRV by 15-25% (JAMA, 2023)',
        implementation_steps: [
          'Begin daily 10-minute box breathing (4-4-4-4 pattern)',
          'Use VNS device (Apollo/Pulsetto) for 30 minutes daily',
          'Ensure 7-9 hours of sleep with consistent schedule',
          'Consider comprehensive lab testing to identify root causes'
        ],
        contraindications: ['Active cardiac arrhythmias', 'Uncontrolled hypertension'],
        supplements: [
          {
            name: 'Magnesium Glycinate',
            dosage: '400mg',
            timing: 'Before bed',
            research: 'Improves HRV and parasympathetic tone (Nutrients, 2022)',
            safety: 'Generally well-tolerated; reduce dose if GI upset occurs'
          }
        ],
        provider_discussion: [
          'Current stress triggers and lifestyle factors',
          'Sleep quality and sleep disorders screening',
          'Medication review for autonomic effects'
        ]
      });
    }

    // Optimization recommendations for moderate scores
    if (score >= 50 && score < 70) {
      recommendations.push({
        category: 'Optimization Protocol',
        priority: 'high',
        title: 'Advanced Autonomic Training',
        description: 'Your foundation is solid - time to optimize with evidence-based protocols.',
        effectiveness_score: 88,
        vagal_impact: 70,
        time_to_benefit: '4-8 weeks',
        scientific_basis: 'Structured autonomic training shows 1.8x HRV improvement vs. control (Circulation, 2024)',
        implementation_steps: [
          'Progressive resonance breathing (5.5 breaths/min)',
          'Cold exposure protocol (30-sec cold shower endings)',
          'Heart rate variability biofeedback training',
          'Optimize circadian rhythm with consistent wake/sleep times'
        ]
      });
    }

    // Biological window timing
    if (score > 0) {
      recommendations.push({
        category: 'Timing Optimization',
        priority: score < 60 ? 'high' : 'medium',
        title: 'Biological Window Synchronization',
        description: 'Timing interventions to your biological windows can multiply effectiveness by 1.5-5x.',
        effectiveness_score: 78,
        vagal_impact: 55,
        time_to_benefit: '4-8 weeks',
        scientific_basis: 'Circadian-optimized interventions show 1.5-2.1x effectiveness multiplier (Chronobiology International, 2024)',
        implementation_steps: [
          'Use VagalSync biological window notifications',
          'Schedule high-intensity work during cortisol peaks (7-9 AM)',
          'Reserve evenings (9-11 PM) for recovery practices',
          'Track outcome differences with timing optimization'
        ]
      });
    }

    // Universal recommendation
    recommendations.push({
      category: 'Foundational Practice',
      priority: score < 50 ? 'high' : 'medium',
      title: 'Evidence-Based Breathwork Protocol',
      description: 'Diaphragmatic breathing with extended exhales directly stimulates vagal pathways.',
      effectiveness_score: 95,
      vagal_impact: 80,
      time_to_benefit: '2-7 days',
      scientific_basis: 'Controlled breathing activates vagus nerve and increases HRV within minutes (Front. Neurosci., 2023)',
      implementation_steps: [
        'Practice 5-10 minutes daily, ideally morning and evening',
        'Inhale through nose for 4 counts',
        'Hold for 4 counts',
        'Exhale through mouth for 6-8 counts',
        'Use VagalSync breathing guide feature for real-time pacing'
      ]
    });

    return recommendations;
  };

  // ============================================================================
  // BIOLOGICAL WINDOWS CALCULATOR
  // ============================================================================

  const calculateBiologicalWindows = (): BiologicalWindow[] => {
    const now = new Date();
    const windows: BiologicalWindow[] = [];

    // Morning cortisol peak (7-9 AM)
    const morningStart = new Date(now);
    morningStart.setHours(7, 0, 0, 0);
    const morningEnd = new Date(now);
    morningEnd.setHours(9, 0, 0, 0);

    windows.push({
      type: 'High Energy Window',
      start: morningStart,
      end: morningEnd,
      effectiveness_multiplier: 1.8,
      confidence: 92,
      recommended_interventions: ['High-intensity exercise', 'Cognitive tasks', 'Important decisions']
    });

    // Evening recovery (9-11 PM)
    const eveningStart = new Date(now);
    eveningStart.setHours(21, 0, 0, 0);
    const eveningEnd = new Date(now);
    eveningEnd.setHours(23, 0, 0, 0);

    windows.push({
      type: 'Recovery Window',
      start: eveningStart,
      end: eveningEnd,
      effectiveness_multiplier: 2.3,
      confidence: 88,
      recommended_interventions: ['Breathing exercises', 'Meditation', 'VNS therapy', 'Light stretching']
    });

    return windows;
  };

  // ============================================================================
  // PREDICTIVE INSIGHTS GENERATOR
  // ============================================================================

  const generatePredictiveInsights = (): PredictiveInsight[] => {
    const insights: PredictiveInsight[] = [];
    const score = vagalToneScore;

    if (score < 50 && metrics.sleepQuality.enabled && Number(metrics.sleepQuality.value) < 70) {
      insights.push({
        type: 'warning',
        message: 'Sleep quality is compromising your autonomic recovery',
        confidence: 87,
        action_items: [
          'Establish consistent sleep/wake schedule',
          'Reduce screen time 2 hours before bed',
          'Consider sleep study if issues persist'
        ],
        potential_improvement: 12
      });
    }

    if (score >= 50 && score < 70) {
      insights.push({
        type: 'opportunity',
        message: 'You are in optimization range - strategic interventions could push you to elite status',
        confidence: 82,
        action_items: [
          'Add cold exposure protocol',
          'Upgrade to Gold plan for AI coaching',
          'Track biological windows for 2 weeks'
        ],
        potential_improvement: 15
      });
    }

    return insights;
  };

  // ============================================================================
  // DEMO MODE
  // ============================================================================

  const enableDemoMode = () => {
    setDemoMode(true);
    setUserLevel('gold');
    setSelectedDevices(['apple-watch', 'oura-ring', 'apollo-neuro']);

    const demoData: Metrics = {
      heartRateVariability: { value: 58, enabled: true, source: 'device', confidence: 95 },
      restingHeartRate: { value: 56, enabled: true, source: 'device', confidence: 95 },
      sleepQuality: { value: 82, enabled: true, source: 'device', confidence: 92 },
      deepSleepPercentage: { value: 18, enabled: true, source: 'device', confidence: 92 },
      stressLevel: { value: 32, enabled: true, source: 'device', confidence: 90 },
      recoveryScore: { value: 78, enabled: true, source: 'device', confidence: 93 },
      cortisol: { value: 14, enabled: true, source: 'lab', confidence: 100 },
      glucose: { value: 88, enabled: true, source: 'device', confidence: 98 },
      steps: { value: 9200, enabled: true, source: 'device', confidence: 95 },
      oxygenSaturation: { value: 98, enabled: true, source: 'device', confidence: 97 },
      autonomicBalance: { value: 72, enabled: true, source: 'device', confidence: 88 },
      parasympatheticActivity: { value: 68, enabled: true, source: 'device', confidence: 85 },
      bloodPressure: { value: '118/76', enabled: false, source: 'device', confidence: 0 },
      cardiacCoherence: { value: 0, enabled: false, source: 'device', confidence: 0 },
      breathingRate: { value: 0, enabled: false, source: 'device', confidence: 0 },
      respiratoryVariability: { value: 0, enabled: false, source: 'device', confidence: 0 },
      remSleepPercentage: { value: 0, enabled: false, source: 'device', confidence: 0 },
      sleepLatency: { value: 0, enabled: false, source: 'device', confidence: 0 },
      activeMinutes: { value: 0, enabled: false, source: 'device', confidence: 0 },
      exerciseIntensity: { value: 0, enabled: false, source: 'device', confidence: 0 },
      caloriesBurned: { value: 0, enabled: false, source: 'device', confidence: 0 },
      sympatheticActivity: { value: 0, enabled: false, source: 'device', confidence: 0 },
      cortisolAwakeningResponse: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      dheas: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      testosterone: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      estradiol: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      progesterone: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      thyroidTsh: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      thyroidT3: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      thyroidT4: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      crp: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      interleukin6: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      tnfAlpha: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      insulin: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      hbA1c: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      lactate: { value: 0, enabled: false, source: 'lab', confidence: 0 },
      ketones: { value: 0, enabled: false, source: 'lab', confidence: 0 }
    };

    setMetrics(prev => ({ ...prev, ...demoData }));
    setAiCoachActive(true);
    setMarketplaceItems(sampleMarketplaceItems);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Update today's score in trend data
    setTrendData(prev => ({
      ...prev,
      score: prev.score.map((d, idx) =>
        idx === prev.score.length - 1
          ? { ...d, score: Math.round(vagalToneScore) }
          : d
      ),
      hrv: metrics.heartRateVariability.enabled
        ? prev.hrv.map((d, idx) =>
          idx === prev.hrv.length - 1
            ? { ...d, hrv: Number(metrics.heartRateVariability.value) }
            : d
        )
        : prev.hrv,
      sleep: metrics.sleepQuality.enabled
        ? prev.sleep.map((d, idx) =>
          idx === prev.sleep.length - 1
            ? { ...d, sleep: Number(metrics.sleepQuality.value) }
            : d
        )
        : prev.sleep
    }));
  }, [vagalToneScore, metrics]);

  useEffect(() => {
    // Check for biomarker data first
    const biomarkerScore = getCurrentMyVagalTone();

    // Only use demo calculation if NO biomarker data exists at all
    if (!biomarkerScore) {
      const score = calculateVagalTone();
      setVagalToneScore(Math.round(score));
    }

    // Generate AI insights when score changes
    if (vagalToneScore > 0) {
      setAiRecommendations(generateAIRecommendations());
      setPredictiveInsights(generatePredictiveInsights());
      setBiologicalWindows(calculateBiologicalWindows());
    }
  }, [metrics, breathingExercise, arMode, selectedDevices]);

  useEffect(() => {
    // Refresh score every 3 seconds to sync with biomarker updates
    const interval = setInterval(() => {
      const biomarkerScore = getCurrentMyVagalTone();
      if (biomarkerScore) {
        setPreviousScore(vagalToneScore);
        setVagalToneScore(Math.round(biomarkerScore.score));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [vagalToneScore]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Voice-guided breathing exercise
  useEffect(() => {
    if (!breathingExercise || !voiceGuidance) return;

    const pattern = breathingPatterns[breathingPattern];
    let cycleCount = 0;
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      if (cycleCount >= pattern.cycles) {
        setBreathingExercise(false);
        speak('Breathing exercise complete. Well done!');
        return;
      }

      // Inhale phase
      setBreathingPhase('inhale');
      speak(`Inhale for ${pattern.inhale} seconds`);

      const timeout1 = setTimeout(() => {
        // Hold phase (if applicable)
        if (pattern.hold > 0) {
          setBreathingPhase('hold');
          speak(`Hold for ${pattern.hold} seconds`);

          const timeout2 = setTimeout(() => {
            // Exhale phase
            setBreathingPhase('exhale');
            speak(`Exhale for ${pattern.exhale} seconds`);

            const timeout3 = setTimeout(() => {
              // Hold after exhale (if applicable)
              if (pattern.holdAfter > 0) {
                setBreathingPhase('holdAfter');
                speak(`Hold for ${pattern.holdAfter} seconds`);

                const timeout4 = setTimeout(() => {
                  cycleCount++;
                  runCycle();
                }, pattern.holdAfter * 1000);
                timeouts.push(timeout4);
              } else {
                cycleCount++;
                runCycle();
              }
            }, pattern.exhale * 1000);
            timeouts.push(timeout3);
          }, pattern.hold * 1000);
          timeouts.push(timeout2);
        } else {
          // No hold - go straight to exhale
          setBreathingPhase('exhale');
          speak(`Exhale for ${pattern.exhale} seconds`);

          const timeout2 = setTimeout(() => {
            cycleCount++;
            runCycle();
          }, pattern.exhale * 1000);
          timeouts.push(timeout2);
        }
      }, pattern.inhale * 1000);
      timeouts.push(timeout1);
    };

    // Start the first cycle
    speak(`Starting ${pattern.name}. Let's begin.`);
    const startTimeout = setTimeout(runCycle, 2000);
    timeouts.push(startTimeout);

    return () => {
      // Clear all timeouts when component unmounts or exercise stops
      timeouts.forEach(timeout => clearTimeout(timeout));
      window.speechSynthesis.cancel();
    };
  }, [breathingExercise, breathingPattern, voiceGuidance]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderDashboard = () => (
    <div className="space-y-8 p-8">
      {/* Hero Score Display */}
      <div className="text-center mb-12">
        <div className="relative">
          <div className={`text-9xl font-bold ${getStatusColor(vagalToneScore)} mb-4 transition-all ${breathingExercise ? 'animate-pulse' : ''}`}>
            {Math.round(vagalToneScore)}
          </div>
          <div className="text-3xl text-white/80 mb-2">{getStatusText(vagalToneScore)}</div>
          <div className="text-lg text-cyan-300/70">myVagal Tone™ Score</div>

          {vagalToneScore > 0 && (
            <div className="mt-6 space-y-4">
              {/* Voice Guidance Toggle */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    setVoiceGuidance(!voiceGuidance);
                    if (!voiceGuidance) {
                      speak('Voice guidance enabled');
                    }
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${voiceGuidance
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>{voiceGuidance ? 'Voice Guidance ON' : 'Voice Guidance OFF'}</span>
                </button>
              </div>

              {/* Breathing Pattern Selector */}
              <div className="flex justify-center gap-3 mb-4">
                {Object.values(breathingPatterns).map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setBreathingPattern(pattern.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${breathingPattern === pattern.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                  >
                    {pattern.name}
                    <div className="text-xs opacity-70">{pattern.effectiveness}% effective</div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    const newState = !breathingExercise;
                    setBreathingExercise(newState);
                    if (!newState) {
                      // Stopping - cancel voice immediately
                      window.speechSynthesis.cancel();
                      speak('Breathing exercise stopped');
                    } else if (voiceGuidance) {
                      speak(`Starting ${breathingPatterns[breathingPattern].name}`);
                    }
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${breathingExercise
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    } text-white`}
                >
                  {breathingExercise ? (
                    <>
                      <X className="w-5 h-5" />
                      <span>Stop Exercise</span>
                    </>
                  ) : (
                    <>
                      <Wind className="w-5 h-5" />
                      <span>Start {breathingPatterns[breathingPattern].name}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setArMode(!arMode)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all text-white font-medium"
                >
                  <Eye className="w-5 h-5" />
                  <span>{arMode ? 'Disable' : 'Enable'} AR</span>
                </button>
              </div>

              {/* Pattern Info */}
              {breathingExercise && (
                <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-400/30 max-w-2xl mx-auto">
                  <h4 className="font-bold text-white mb-2">{breathingPatterns[breathingPattern].name}</h4>
                  <p className="text-white/70 text-sm mb-4">{breathingPatterns[breathingPattern].description}</p>

                  {/* Current Phase Indicator */}
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold mb-2 ${breathingPhase === 'inhale' ? 'text-cyan-400' :
                        breathingPhase === 'hold' ? 'text-purple-400' :
                          breathingPhase === 'exhale' ? 'text-blue-400' :
                            'text-green-400'
                        }`}>
                        {breathingPhase === 'inhale' ? '↑ INHALE' :
                          breathingPhase === 'hold' ? '⊙ HOLD' :
                            breathingPhase === 'exhale' ? '↓ EXHALE' :
                              '⊙ HOLD'}
                      </div>
                      <div className="text-white/60 text-sm">Current Phase</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-cyan-400">{breathingPatterns[breathingPattern].inhale}s</div>
                      <div className="text-xs text-white/60">Inhale</div>
                    </div>
                    {breathingPatterns[breathingPattern].hold > 0 && (
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{breathingPatterns[breathingPattern].hold}s</div>
                        <div className="text-xs text-white/60">Hold</div>
                      </div>
                    )}
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{breathingPatterns[breathingPattern].exhale}s</div>
                      <div className="text-xs text-white/60">Exhale</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{breathingPatterns[breathingPattern].cycles}</div>
                      <div className="text-xs text-white/60">Cycles</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Biological Windows */}
      {biologicalWindows.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-3xl p-8 border border-yellow-500/30 backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Sun className="w-7 h-7 mr-3 text-yellow-400" />
            Active Biological Windows
          </h3>
          <div className="space-y-4">
            {biologicalWindows.map((window, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{window.type}</span>
                  <span className="text-yellow-400 font-bold">{window.effectiveness_multiplier}x Effectiveness</span>
                </div>
                <div className="text-sm text-white/70 mb-3">
                  {window.start.toLocaleTimeString()} - {window.end.toLocaleTimeString()} | Confidence: {window.confidence}%
                </div>
                <div className="flex flex-wrap gap-2">
                  {window.recommended_interventions.map((intervention, i) => (
                    <span key={i} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                      {intervention}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictive Insights */}
      {predictiveInsights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Lightbulb className="w-7 h-7 mr-3 text-yellow-400" />
            Predictive Insights
          </h3>

          <div className="space-y-4">
            {predictiveInsights.map((insight, idx) => (
              <div key={idx} className={`rounded-2xl p-6 border ${insight.type === 'opportunity' ? 'bg-green-500/10 border-green-400/30' :
                insight.type === 'warning' ? 'bg-red-500/10 border-red-400/30' :
                  'bg-blue-500/10 border-blue-400/30'
                }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <AlertCircle className={`w-5 h-5 mr-2 ${insight.type === 'opportunity' ? 'text-green-400' :
                        insight.type === 'warning' ? 'text-red-400' :
                          'text-blue-400'
                        }`} />
                      <span className="font-bold text-white">{insight.message}</span>
                    </div>
                    <div className="text-sm text-white/70 mb-3">
                      Confidence: {insight.confidence}% | Potential Impact: {insight.potential_improvement > 0 ? '+' : ''}{insight.potential_improvement} points
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm font-semibold text-white mb-2">Action Items:</div>
                  <ul className="space-y-1 text-sm text-white/80">
                    {insight.action_items.map((action, i) => (
                      <li key={i}>• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Devices */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-600/30 backdrop-blur-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Wifi className="w-7 h-7 mr-3 text-green-400" />
          Connected Devices
          <span className="ml-3 text-sm text-white/60">({selectedDevices.length} active)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDevices.map(device => {
            const isConnected = selectedDevices.includes(device.id);
            return (
              <div
                key={device.id}
                onClick={() => toggleDevice(device.id)}
                className={`cursor-pointer rounded-2xl p-6 transition-all transform hover:scale-105 ${isConnected
                  ? `bg-gradient-to-br ${device.color} border-2 border-white/30`
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <device.icon className={`w-8 h-8 ${isConnected ? 'text-white' : 'text-gray-400'}`} />
                  <div className={`text-sm font-bold ${isConnected ? 'text-white' : 'text-gray-400'}`}>
                    {device.accuracy}% Accurate
                  </div>
                </div>

                <h4 className={`font-bold text-lg mb-2 ${isConnected ? 'text-white' : 'text-gray-300'}`}>
                  {device.name}
                </h4>

                <div className={`text-sm mb-3 ${isConnected ? 'text-white/80' : 'text-gray-400'}`}>
                  {device.metrics.length} biomarkers tracked
                </div>

                {device.price && (
                  <div className={`text-lg font-bold ${isConnected ? 'text-cyan-300' : 'text-gray-400'}`}>
                    ${device.price}
                  </div>
                )}

                {isConnected && (
                  <div className="mt-3 flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Connected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {!demoMode && selectedDevices.length === 0 && (
        <div className="text-center">
          <button
            onClick={enableDemoMode}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl"
          >
            <Sparkles className="w-6 h-6 inline mr-2" />
            Enable Demo Mode
          </button>
        </div>
      )}
    </div>
  );

  const renderAIRecommendations = () => (
    <div className="p-8 space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
          <Brain className="w-12 h-12 mr-4 text-cyan-300" />
          AI Wellness Recommendations
          <Sparkles className="w-10 h-10 ml-4 text-yellow-400" />
        </h2>
        <p className="text-2xl text-cyan-300/80">
          Evidence-based protocols personalized to your myVagal Tone™ score of {Math.round(vagalToneScore)}
        </p>
      </div>

      {aiRecommendations.length === 0 ? (
        <div className="bg-white/10 rounded-3xl p-12 text-center backdrop-blur-xl border border-white/20">
          <Brain className="w-20 h-20 mx-auto mb-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white mb-4">Connect Devices to Unlock AI Insights</h3>
          <p className="text-white/70 text-lg mb-6">
            VagalSync AI analyzes your biomarkers to provide personalized wellness recommendations
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Connect Your First Device
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {aiRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 border-l-4 cursor-pointer transition-all hover:scale-[1.02] ${getRecommendationColor(rec.priority)}`}
              onClick={() => setSelectedRecommendation(rec)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold mr-3 ${rec.priority === 'critical' ? 'bg-red-500 text-white' :
                      rec.priority === 'high' ? 'bg-orange-500 text-white' :
                        rec.priority === 'medium' ? 'bg-blue-500 text-white' :
                          'bg-green-500 text-white'
                      }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-white/70 text-sm">{rec.category}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{rec.title}</h3>
                  <p className="text-white/80 text-lg mb-4">{rec.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-cyan-400 font-bold text-2xl">{rec.effectiveness_score}%</div>
                      <div className="text-white/60 text-sm">Effectiveness</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-purple-400 font-bold text-2xl">{rec.vagal_impact}%</div>
                      <div className="text-white/60 text-sm">Vagal Impact</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-green-400 font-bold text-xl">{rec.time_to_benefit}</div>
                      <div className="text-white/60 text-sm">Time to Benefit</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="text-sm font-semibold text-white mb-2">🔬 Scientific Basis:</div>
                <p className="text-white/70 text-sm">{rec.scientific_basis}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm font-semibold text-white mb-3">📋 Implementation Steps:</div>
                <ul className="space-y-2">
                  {rec.implementation_steps.map((step, i) => (
                    <li key={i} className="text-white/80 text-sm flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {rec.supplements && rec.supplements.length > 0 && (
                <div className="bg-purple-500/10 rounded-xl p-4 mt-4 border border-purple-400/30">
                  <div className="text-sm font-semibold text-white mb-3">💊 Supplement Information:</div>
                  <div className="space-y-3">
                    {rec.supplements.map((supp, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <div className="font-bold text-white mb-1">{supp.name}</div>
                        <div className="text-sm text-white/70 space-y-1">
                          <div><strong>Dosage:</strong> {supp.dosage}</div>
                          <div><strong>Timing:</strong> {supp.timing}</div>
                          <div><strong>Research:</strong> {supp.research}</div>
                          <div><strong>Safety:</strong> {supp.safety}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubscriptionPlans = () => (
    <div className="p-8">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4">
          Choose Your Wellness Journey
        </h2>
        <p className="text-2xl text-cyan-300/80">
          Unlock features as you grow - upgrade anytime based on your devices and goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* FREE - Get Started */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 backdrop-blur border border-gray-600/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-xl text-white">Free</h4>
            <span className="px-3 py-1 bg-gray-600/30 rounded-full text-xs font-bold text-white">
              STARTER
            </span>
          </div>
          <p className="text-5xl font-bold mb-2 text-white">$0</p>
          <p className="text-white/60 text-sm mb-6">Forever free</p>
          <ul className="space-y-3 text-white/90 mb-8 text-sm">
            <li className="flex items-start">
              <span className="text-green-400 mr-2 font-bold">✓</span>
              <span>Manual biomarker entry</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 font-bold">✓</span>
              <span>Basic myVagal Tone™</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 font-bold">✓</span>
              <span>7-day history</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 font-bold">✓</span>
              <span>Community access</span>
            </li>
            <li className="flex items-start opacity-50">
              <span className="text-gray-500 mr-2 font-bold">✗</span>
              <span>No device auto-sync</span>
            </li>
            <li className="flex items-start opacity-50">
              <span className="text-gray-500 mr-2 font-bold">✗</span>
              <span>No predictions</span>
            </li>
          </ul>
          <button className="w-full bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20">
            Current Plan
          </button>
        </div>

        {/* SILVER - Most Popular */}
        <div className="bg-gradient-to-br from-blue-800/50 to-cyan-900/50 rounded-2xl p-8 backdrop-blur border-2 border-cyan-400/50 relative transform md:scale-105 shadow-2xl">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-xs font-bold text-white shadow-lg">
            MOST POPULAR
          </div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-2xl text-white">Silver</h4>
            <span className="px-3 py-1 bg-cyan-500/30 rounded-full text-xs font-bold text-white">
              BEST VALUE
            </span>
          </div>
          <p className="text-5xl font-bold mb-2 text-white">$49</p>
          <p className="text-cyan-300 text-sm mb-6">Per month</p>
          <ul className="space-y-3 text-white/95 mb-8 text-sm">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2 font-bold text-lg">✓</span>
              <span><strong>Everything in Free</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2 font-bold text-lg">✓</span>
              <span><strong>Auto-sync</strong> all devices</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2 font-bold text-lg">✓</span>
              <span><strong>24-hour predictions</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2 font-bold text-lg">✓</span>
              <span><strong>Optimal timing</strong> alerts</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2 font-bold text-lg">✓</span>
              <span>Unlimited history</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2 font-bold text-lg">✓</span>
              <span>Priority support</span>
            </li>
            <li className="flex items-start opacity-50">
              <span className="text-gray-400 mr-2 font-bold">✗</span>
              <span>No genetic insights</span>
            </li>
          </ul>
          <button
            onClick={() => alert('Stripe checkout: $49/month')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg"
          >
            Upgrade to Silver
          </button>
          <p className="text-center text-cyan-300/80 text-xs mt-3">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>

        {/* GOLD - Professional */}
        <div className="bg-gradient-to-br from-yellow-800/40 to-orange-900/40 rounded-2xl p-8 backdrop-blur border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-xl text-white">Gold</h4>
            <span className="px-3 py-1 bg-yellow-500/30 rounded-full text-xs font-bold text-white">
              ADVANCED
            </span>
          </div>
          <p className="text-5xl font-bold mb-2 text-white">$99</p>
          <p className="text-yellow-300 text-sm mb-6">Per month</p>
          <ul className="space-y-3 text-white/90 mb-8 text-sm">
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2 font-bold">✓</span>
              <span><strong>Everything in Silver</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2 font-bold">✓</span>
              <span><strong>Genetic insights</strong> (23andMe)</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2 font-bold">✓</span>
              <span><strong>3-layer scoring</strong> (Bio/Gene/Epi)</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2 font-bold">✓</span>
              <span>Advanced analytics</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2 font-bold">✓</span>
              <span>Custom protocols</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2 font-bold">✓</span>
              <span>API access</span>
            </li>
            <li className="flex items-start opacity-50">
              <span className="text-gray-400 mr-2 font-bold">✗</span>
              <span>No 1-on-1 coaching</span>
            </li>
          </ul>
          <button
            onClick={() => alert('Stripe checkout: $99/month')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            Upgrade to Gold
          </button>
        </div>

        {/* PLATINUM - Ultimate */}
        <div className="bg-gradient-to-br from-purple-800/40 to-pink-900/40 rounded-2xl p-8 backdrop-blur border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-xl text-white">Platinum</h4>
            <span className="px-3 py-1 bg-purple-500/30 rounded-full text-xs font-bold text-white">
              ULTIMATE
            </span>
          </div>
          <p className="text-5xl font-bold mb-2 text-white">$299</p>
          <p className="text-purple-300 text-sm mb-6">Per month</p>
          <ul className="space-y-3 text-white/90 mb-8 text-sm">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2 font-bold">✓</span>
              <span><strong>Everything in Gold</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2 font-bold">✓</span>
              <span><strong>1-on-1 expert coaching</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2 font-bold">✓</span>
              <span><strong>White-glove onboarding</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2 font-bold">✓</span>
              <span>Custom protocol design</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2 font-bold">✓</span>
              <span>Priority lab analysis</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2 font-bold">✓</span>
              <span>Quarterly health reviews</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2 font-bold">✓</span>
              <span>VIP support (24/7)</span>
            </li>
          </ul>
          <button
            onClick={() => alert('Stripe checkout: $299/month - Premium coaching included!')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Upgrade to Platinum
          </button>
        </div>
      </div>

      {/* Value Proposition Footer */}
      <div className="mt-12 text-center max-w-3xl mx-auto">
        <p className="text-white/80 text-lg mb-4">
          🎯 <strong className="text-cyan-300">87% of Silver users</strong> say VagalSync is their most valuable health tool
        </p>
        <p className="text-white/60 text-sm">
          All plans include 30-day money-back guarantee • Cancel anytime • No contracts
        </p>
      </div>
    </div>
  );


  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Top Navigation Bar */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full p-2">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">VagalSync</h1>
              <div className="text-xs text-cyan-300">V15.0 Ultimate</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* myVagal Tone Score Badge - PERSISTENT */}
            {vagalToneScore > 0 && (
              <div className={`bg-gradient-to-r ${getScoreBgColor(vagalToneScore)} rounded-full px-4 py-2 border border-white/20 backdrop-blur cursor-pointer hover:scale-105 transition-all`}
                onClick={() => setActiveTab('biomarkers')}
                title="Click to view biomarker details">
                <div className="flex items-center space-x-2">
                  <Activity className={`w-5 h-5 ${getScoreColor(vagalToneScore)}`} />
                  <div>
                    <div className={`text-2xl font-bold ${getScoreColor(vagalToneScore)} leading-tight`}>
                      {Math.round(vagalToneScore)}
                    </div>
                    <div className="text-xs text-white/60">myVagal Tone™</div>
                  </div>
                  <div className="ml-1">
                    {getTrendIcon()}
                  </div>
                </div>
              </div>
            )}

            {/* Battery & Connection Status */}
            <div className="flex items-center space-x-3 text-white/70">
              <div className="flex items-center">
                <Battery className="w-5 h-5 mr-1" />
                <span className="text-sm">{batteryLevel}%</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            </div>

            {/* Voice Control */}
            <button
              onClick={() => setVoiceActive(!voiceActive)}
              className={`p-2 rounded-full transition-all ${voiceActive ? 'bg-red-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {voiceActive ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>

            {/* ⭐ Help menu ⭐ */}
            <HelpMenu
              context={activeTab as any}
              className="text-white/70 hover:text-white"
            />

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'text-cyan-300 border-b-2 border-cyan-400'
                  : 'text-white/60 hover:text-white/80'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <>
            {renderDashboard()}

            {/* Trends Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 7-Day myVagal Tone Trend */}
              <TrendChart
                data={trendData.score}
                metric="score"
                title="7-Day myVagal Tone™ Trend"
                showGrid={true}
              />

              {/* HRV Trend (if available) */}
              {metrics.heartRateVariability.enabled ? (
                <TrendChart
                  data={trendData.hrv}
                  metric="hrv"
                  title="7-Day HRV Trend"
                  showGrid={true}
                />
              ) : (
                <TrendChart
                  data={trendData.sleep}
                  metric="sleep"
                  title="7-Day Sleep Quality Trend"
                  showGrid={true}
                />
              )}
            </div>

            {/* Weekly Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Weekly Average */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <div className="text-sm text-gray-400">Weekly Avg</div>
                </div>
                <div className="text-3xl font-bold text-blue-400">
                  {Math.round(
                    trendData.score.reduce((sum, d) => sum + d.score, 0) /
                    trendData.score.length
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">myVagal Tone™</div>
              </div>

              {/* Best Day */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="text-sm text-gray-400">Best Day</div>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {Math.max(...trendData.score.map(d => d.score))}
                </div>
                <div className="text-xs text-gray-500 mt-1">Peak Score</div>
              </div>

              {/* Weekly Improvement */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <div className="text-sm text-gray-400">Improvement</div>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {Math.round(vagalToneScore - trendData.score[0].score) >= 0 ? '+' : ''}
                  {Math.round(vagalToneScore - trendData.score[0].score)}
                </div>
                <div className="text-xs text-gray-500 mt-1">vs. Monday</div>
              </div>

              {/* Current Streak */}
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <div className="text-sm text-gray-400">Streak</div>
                </div>
                <div className="text-3xl font-bold text-orange-400">
                  {socialStreak}
                </div>
                <div className="text-xs text-gray-500 mt-1">days active</div>
              </div>
            </div>

            {/* Progress Insights */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-6 border border-white/10 backdrop-blur mb-8">
              <h3 className="text-xl font-bold text-white mb-4">📊 Weekly Insights</h3>
              <div className="space-y-3">
                {/* Trend Direction */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                  <div>
                    <div className="text-white font-medium">
                      {Math.round(vagalToneScore - trendData.score[0].score) > 0
                        ? '📈 Upward Trend'
                        : Math.round(vagalToneScore - trendData.score[0].score) < 0
                          ? '📉 Declining Trend'
                          : '➡️ Stable Trend'}
                    </div>
                    <div className="text-sm text-gray-400">
                      Your score has {
                        Math.round(vagalToneScore - trendData.score[0].score) > 0
                          ? `improved by ${Math.round(vagalToneScore - trendData.score[0].score)} points`
                          : Math.round(vagalToneScore - trendData.score[0].score) < 0
                            ? `declined by ${Math.abs(Math.round(vagalToneScore - trendData.score[0].score))} points`
                            : 'remained stable'
                      } this week
                    </div>
                  </div>
                </div>

                {/* Consistency */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                  <div>
                    <div className="text-sm text-gray-400">
                      {socialStreak >= 7
                        ? `You've tracked for ${socialStreak} days straight!`
                        : `Keep going! ${7 - socialStreak} more days for a weekly streak`}
                    </div>
                  </div>
                </div>

                {/* Next Goal */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
                  <div>
                    <div className="text-white font-medium">🎯 Next Milestone</div>
                    <div className="text-sm text-gray-400">
                      {vagalToneScore < 70
                        ? `${Math.round(70 - vagalToneScore)} points to reach "Optimal" status`
                        : vagalToneScore < 80
                          ? `${Math.round(80 - vagalToneScore)} points to reach "Elite Resilience"`
                          : `You've achieved Elite Resilience! Maintain this level.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ai' && renderAIRecommendations()}

        {activeTab === 'biomarkers' && <BiomarkerTab />}

        {activeTab === 'interventions' && (
          <InterventionsTab
            breathingExercise={breathingExercise}
            setBreathingExercise={setBreathingExercise}
            arMode={arMode}
            setArMode={setArMode}
            vagalToneScore={Math.round(vagalToneScore)}
            interventionLogs={interventionLogs}
            setInterventionLogs={setInterventionLogs}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            metrics={metrics}
            interventionLogs={interventionLogs}
            selectedDevices={selectedDevices}
            socialStreak={socialStreak}
          />
        )}

        {activeTab === 'marketplace' && (
          marketplaceItems.length === 0 && !demoMode ? (
            <div className="p-8">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 mr-4 text-cyan-300" />
                  VagalSync Marketplace
                  <Sparkles className="w-10 h-10 ml-4 text-yellow-400" />
                </h2>
                <p className="text-2xl text-cyan-300/80">
                  Evidence-based devices and tools to optimize your wellness journey
                </p>
              </div>

              <div className="bg-white/10 rounded-3xl p-12 text-center backdrop-blur-xl border border-white/20">
                <Package className="w-20 h-20 mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl font-bold text-white mb-4">Marketplace Coming Soon</h3>
                <p className="text-white/70 text-lg mb-6">
                  Personalized product recommendations based on your biomarker data
                </p>

                <div className="bg-cyan-500/10 rounded-xl p-6 max-w-2xl mx-auto mb-6">
                  <h4 className="font-bold text-cyan-300 mb-3">🔬 How It Works</h4>
                  <ul className="text-left text-white/70 space-y-2">
                    <li>• Add biomarker data to get personalized recommendations</li>
                    <li>• AI analyzes your myVagal Tone™ score</li>
                    <li>• See devices that can improve your specific biomarkers</li>
                    <li>• Compare effectiveness data from real users</li>
                  </ul>
                </div>

                <button
                  onClick={enableDemoMode}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center space-x-2"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Enable Demo Mode</span>
                </button>
              </div>
            </div>
          ) : (
            <MarketplaceTab />
          )
        )}

        {activeTab === 'social' && (
          <SocialTab
            vagalToneScore={Math.round(vagalToneScore)}
            socialStreak={socialStreak}
            achievements={achievements}
            interventionLogs={interventionLogs}
            selectedDevices={selectedDevices}
            userLevel={userLevel}
          />
        )}

        {activeTab === 'devices' && <DeviceConnectionTab />}

        {activeTab === 'predictions' && <PredictiveAnalyticsTab />}

        {activeTab === 'genetics' && <GeneticUploadTab />}

        {activeTab === 'plans' && renderSubscriptionPlans()}

        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Floating Action Button */}
      {vagalToneScore > 0 && (
        <button
          onClick={() => alert('AI Coach coming soon!')}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg transition-all"
        >
          <Brain className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl max-w-2xl w-full p-8 border border-purple-400/30 shadow-2xl">
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white mb-4">Unlock More Devices</h2>
              <p className="text-xl text-white/80 mb-8">
                Free plan limited to 3 devices. Upgrade to Silver ($49/mo) or Gold ($99/mo) to connect unlimited devices and unlock AI-powered insights!
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowUpgradePrompt(false);
                    setActiveTab('plans');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  View Plans
                </button>
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-black/30 backdrop-blur-xl border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">VagalSync V15.0</h3>
              <p className="text-white/60 text-sm">
                Evidence-based wellness optimization platform. Not a medical device - for wellness and educational purposes only.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Science</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Patents</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
            <p>© 2025 VagalSync, Inc. | 11 Patents Pending (605 Claims) | Not FDA Approved - Wellness Use Only</p>
            <p className="mt-2">Version 15.0.0-ULTIMATE | Subscription-Based Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VagalSyncV15UltimateWellnessApp;