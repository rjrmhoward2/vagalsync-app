// VagalSync V15.0 - Biological Timing Intelligence Engine (WORKING VERSION)
// Patent 10: Biological Window Detection Implementation
// FIXED: All imports match existing project structure

import { syncMiddleware, SyncConfig } from './syncMiddleware';
import { loadBiomarkerEntries } from './storageService';
import type { BiomarkerEntry } from '../types/biomarker.types';

// ============================================================================
// BIOLOGICAL TIMING CONSTANTS
// ============================================================================

const CIRCADIAN_PHASES = {
  CORTISOL_AWAKENING_RESPONSE: { start: 0, end: 60 },
  MORNING_PEAK: { start: 60, end: 240 },
  MIDDAY_PLATEAU: { start: 240, end: 480 },
  AFTERNOON_DIP: { start: 480, end: 600 },
  EVENING_WIND_DOWN: { start: 600, end: 840 },
  MELATONIN_ONSET: { start: 840, end: 960 },
  DEEP_SLEEP_WINDOW: { start: 960, end: 1200 }
};

const ULTRADIAN_CYCLE_MINUTES = 90;

// ============================================================================
// TYPES
// ============================================================================

export interface BiologicalState {
  timestamp: Date;
  circadianPhase: keyof typeof CIRCADIAN_PHASES;
  ultradianCyclePosition: number; // 0-1
  autonomicBalance: 'sympathetic' | 'parasympathetic' | 'balanced';
  predictedHRV: number;
  predictedReadiness: number;
  optimalInterventionWindow: boolean;
  riskFactors: string[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  timing: 'now' | 'in_30min' | 'in_1hour' | 'in_2hours' | 'tomorrow';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  type: 'intervention' | 'prevention' | 'optimization';
  action: string;
  rationale: string;
  expectedImpact: number;
}

export interface PredictiveMetrics {
  hrv24h: Array<{ time: string; value: number }>;
  readiness24h: Array<{ time: string; value: number }>;
  optimalWindows: Array<{ start: string; end: string; type: string }>;
  riskAlerts: Array<{ severity: string; message: string; eta: string }>;
}

// ============================================================================
// BIOLOGICAL TIMING ENGINE CLASS
// ============================================================================

class BiologicalTimingEngine {
  
  private wakeTime: Date | null = null;
  private hrvHistory: number[] = [];
  
  constructor() {
    this.loadSettings();
  }
  
  // =========================================================================
  // CURRENT STATE ANALYSIS
  // =========================================================================
  
  getCurrentState(): BiologicalState {
    const now = new Date();
    const minutesSinceWake = this.getMinutesSinceWake();
    
    // Determine circadian phase
    const phase = this.getCurrentCircadianPhase(minutesSinceWake);
    
    // Calculate ultradian cycle position
    const ultradianPosition = (minutesSinceWake % ULTRADIAN_CYCLE_MINUTES) / ULTRADIAN_CYCLE_MINUTES;
    
    // Estimate autonomic balance
    const autonomicBalance = this.estimateAutonomicBalance(phase, ultradianPosition);
    
    // Predict HRV
    const predictedHRV = this.predictHRV();
    
    // Calculate readiness
    const predictedReadiness = this.calculateReadiness();
    
    // Check if in optimal intervention window
    const optimalInterventionWindow = this.isOptimalInterventionWindow(phase, ultradianPosition);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors();
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      phase,
      autonomicBalance,
      optimalInterventionWindow,
      riskFactors
    );
    
    return {
      timestamp: now,
      circadianPhase: phase,
      ultradianCyclePosition: ultradianPosition,
      autonomicBalance,
      predictedHRV,
      predictedReadiness,
      optimalInterventionWindow,
      riskFactors,
      recommendations
    };
  }
  
  // =========================================================================
  // PREDICTIVE ANALYTICS
  // =========================================================================
  
  get24HourForecast(): PredictiveMetrics {
    const now = new Date();
    const hrv24h: Array<{ time: string; value: number }> = [];
    const readiness24h: Array<{ time: string; value: number }> = [];
    const optimalWindows: Array<{ start: string; end: string; type: string }> = [];
    
    // Generate hourly forecasts for next 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const futureTime = new Date(now.getTime() + hour * 60 * 60 * 1000);
      const minutesSinceWake = this.getMinutesSinceWake() + (hour * 60);
      const phase = this.getCurrentCircadianPhase(minutesSinceWake);
      
      // Predict HRV for this hour
      const baseHRV = 70;
      const circadianModifier = this.getCircadianModifier(phase);
      const predictedHRV = baseHRV * circadianModifier;
      
      hrv24h.push({
        time: futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: Math.round(predictedHRV)
      });
      
      // Predict readiness
      const readiness = Math.min(100, predictedHRV * 1.2);
      readiness24h.push({
        time: futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: Math.round(readiness)
      });
      
      // Identify optimal windows
      if (phase === 'MORNING_PEAK' || phase === 'EVENING_WIND_DOWN') {
        optimalWindows.push({
          start: futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: new Date(futureTime.getTime() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: phase === 'MORNING_PEAK' ? 'Exercise' : 'Recovery'
        });
      }
    }
    
    // Generate risk alerts
    const riskAlerts = this.generateRiskAlerts();
    
    return {
      hrv24h,
      readiness24h,
      optimalWindows,
      riskAlerts
    };
  }
  
  // =========================================================================
  // HELPER METHODS
  // =========================================================================
  
  private getMinutesSinceWake(): number {
    if (!this.wakeTime) {
      // Default: assume wake time was 7 AM today
      const today = new Date();
      this.wakeTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0, 0);
    }
    
    const now = new Date();
    return Math.floor((now.getTime() - this.wakeTime.getTime()) / (1000 * 60));
  }
  
  private getCurrentCircadianPhase(minutesSinceWake: number): keyof typeof CIRCADIAN_PHASES {
    for (const [phase, window] of Object.entries(CIRCADIAN_PHASES)) {
      if (minutesSinceWake >= window.start && minutesSinceWake < window.end) {
        return phase as keyof typeof CIRCADIAN_PHASES;
      }
    }
    return 'DEEP_SLEEP_WINDOW';
  }
  
  private estimateAutonomicBalance(
    phase: keyof typeof CIRCADIAN_PHASES,
    ultradianPosition: number
  ): 'sympathetic' | 'parasympathetic' | 'balanced' {
    // Morning/afternoon = sympathetic
    if (phase === 'MORNING_PEAK' || phase === 'MIDDAY_PLATEAU') {
      return 'sympathetic';
    }
    
    // Evening/night = parasympathetic
    if (phase === 'EVENING_WIND_DOWN' || phase === 'MELATONIN_ONSET') {
      return 'parasympathetic';
    }
    
    // Ultradian peak = sympathetic, trough = parasympathetic
    if (ultradianPosition < 0.3) return 'parasympathetic';
    if (ultradianPosition > 0.7) return 'parasympathetic';
    
    return 'balanced';
  }
  
  private predictHRV(): number {
    // Use historical average if available
    if (this.hrvHistory.length > 0) {
      const avg = this.hrvHistory.reduce((a, b) => a + b, 0) / this.hrvHistory.length;
      return Math.round(avg);
    }
    
    // Otherwise use typical baseline
    return 70;
  }
  
  private calculateReadiness(): number {
    const hrv = this.predictHRV();
    const phase = this.getCurrentCircadianPhase(this.getMinutesSinceWake());
    
    let readiness = hrv * 1.2; // Base readiness from HRV
    
    // Adjust for circadian phase
    if (phase === 'MORNING_PEAK') readiness *= 1.1;
    if (phase === 'AFTERNOON_DIP') readiness *= 0.9;
    
    return Math.min(100, Math.round(readiness));
  }
  
  private isOptimalInterventionWindow(
    phase: keyof typeof CIRCADIAN_PHASES,
    ultradianPosition: number
  ): boolean {
    // Morning peak is great for interventions
    if (phase === 'MORNING_PEAK') return true;
    
    // Ultradian peaks are good windows
    if (ultradianPosition > 0.4 && ultradianPosition < 0.6) return true;
    
    return false;
  }
  
  private identifyRiskFactors(): string[] {
    const risks: string[] = [];
    
    const hrv = this.predictHRV();
    const minutesSinceWake = this.getMinutesSinceWake();
    
    // Low HRV warning
    if (hrv < 50) {
      risks.push('Low HRV detected - elevated stress or poor recovery');
    }
    
    // Extended wake time warning
    if (minutesSinceWake > 960) {
      risks.push('Extended wake time - sleep recommended soon');
    }
    
    return risks;
  }
  
  private generateRecommendations(
    phase: keyof typeof CIRCADIAN_PHASES,
    autonomicBalance: string,
    optimalWindow: boolean,
    riskFactors: string[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Optimal window recommendations
    if (optimalWindow) {
      recommendations.push({
        timing: 'now',
        urgency: 'high',
        type: 'optimization',
        action: 'Perform breathing exercise',
        rationale: 'You are in an optimal biological window',
        expectedImpact: 85
      });
    }
    
    // Phase-specific recommendations
    if (phase === 'MORNING_PEAK') {
      recommendations.push({
        timing: 'now',
        urgency: 'medium',
        type: 'optimization',
        action: 'Plan important tasks',
        rationale: 'Peak cognitive performance window',
        expectedImpact: 75
      });
    }
    
    if (phase === 'AFTERNOON_DIP') {
      recommendations.push({
        timing: 'now',
        urgency: 'low',
        type: 'prevention',
        action: 'Take 20-minute nap',
        rationale: 'Natural energy dip - nap can restore alertness',
        expectedImpact: 65
      });
    }
    
    // Risk-based recommendations
    if (riskFactors.length > 0) {
      recommendations.push({
        timing: 'now',
        urgency: 'critical',
        type: 'prevention',
        action: 'Prioritize recovery',
        rationale: riskFactors.join('; '),
        expectedImpact: 90
      });
    }
    
    return recommendations;
  }
  
  private getCircadianModifier(phase: keyof typeof CIRCADIAN_PHASES): number {
    const modifiers: Record<string, number> = {
      CORTISOL_AWAKENING_RESPONSE: 0.8,
      MORNING_PEAK: 1.2,
      MIDDAY_PLATEAU: 1.0,
      AFTERNOON_DIP: 0.85,
      EVENING_WIND_DOWN: 0.95,
      MELATONIN_ONSET: 1.1,
      DEEP_SLEEP_WINDOW: 1.3
    };
    return modifiers[phase] || 1.0;
  }
  
  private generateRiskAlerts(): Array<{ severity: string; message: string; eta: string }> {
    const alerts: Array<{ severity: string; message: string; eta: string }> = [];
    
    // Check for upcoming circadian misalignment
    const minutesSinceWake = this.getMinutesSinceWake();
    
    if (minutesSinceWake > 900 && minutesSinceWake < 960) {
      alerts.push({
        severity: 'medium',
        message: 'Sleep window approaching',
        eta: '1 hour'
      });
    }
    
    return alerts;
  }
  
  private loadSettings() {
    // SSR Safety: Only access localStorage in browser
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('vagalsync_timing_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      if (settings.wakeTime) {
        this.wakeTime = new Date(settings.wakeTime);
      }
    }
  }
  
  // =========================================================================
  // PUBLIC API
  // =========================================================================
  
  setWakeTime(time: Date) {
    this.wakeTime = time;
    
    // SSR Safety: Only access localStorage in browser
    if (typeof window !== 'undefined') {
      localStorage.setItem('vagalsync_timing_settings', JSON.stringify({
        wakeTime: time.toISOString()
      }));
    }
  }
  
  async updateFromBiomarkers() {
    const entries = await loadBiomarkerEntries();
    
    // Extract HRV data
    const hrvEntries = entries.filter(e => e.biomarkerId === 'hrv');
    this.hrvHistory = hrvEntries.map(e => e.value).slice(-30); // Last 30 readings
  }
}

// Export singleton instance
export const biologicalTimingEngine = new BiologicalTimingEngine();
