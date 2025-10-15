/**
 * VagalSync V15.0 Ultimate - Biomarker Calculations
 * 
 * This file implements the patented algorithms for biomarker analysis:
 * - Patent #1: myVagal Tone™ Scoring (0-100 stress resilience score)
 * - Patent #3: Accuracy Weighting System (multi-source biomarker integration)
 * 
 * CRITICAL: These algorithms are patent-protected intellectual property.
 * The exact formulas must be maintained as specified.
 */

import { 
  BiomarkerEntry, 
  MyVagalToneScore, 
  BiomarkerImpact,
  BiomarkerTrend,
  AccuracySource 
} from '../types/biomarker.types';
import { getBiomarkerById, ACCURACY_WEIGHTS } from './biomarkerDatabase';

// ============================================================================
// PATENT #1: MYVAGAL TONE™ CALCULATION
// ============================================================================

/**
 * Calculate myVagal Tone™ score from biomarker entries
 * 
 * PATENT FORMULA:
 * 1. Start with base score of 67
 * 2. Add weighted impact from each biomarker
 * 3. Clamp final result between 0-100
 * 
 * @param entries - All biomarker entries to include in calculation
 * @returns Complete myVagal Tone score with breakdown
 */
export function calculateMyVagalTone(entries: BiomarkerEntry[]): MyVagalToneScore {
  const BASE_SCORE = 67; // Patent-specified starting point
  
  // Calculate individual impacts
  const breakdown: BiomarkerImpact[] = entries.map(entry => 
    calculateBiomarkerImpact(entry)
  );
  
  // Sum all weighted impacts
  const totalImpact = breakdown.reduce((sum, b) => sum + b.weightedImpact, 0);
  
  // Apply patent formula: baseScore + totalImpact, clamped to 0-100
  const rawScore = BASE_SCORE + totalImpact;
  const finalScore = Math.max(0, Math.min(100, rawScore));
  
  return {
    score: Math.round(finalScore),
    baseScore: BASE_SCORE,
    totalImpact: Math.round(totalImpact * 10) / 10, // Round to 1 decimal
    biomarkerCount: entries.length,
    lastUpdated: new Date(),
    breakdown
  };
}

/**
 * Calculate a single biomarker's weighted impact on myVagal Tone
 * 
 * COMBINES:
 * - Patent #1: Base impact calculation (+8 optimal, -10 suboptimal)
 * - Patent #3: Accuracy weighting (0.92 to 1.0 multiplier)
 * 
 * @param entry - Single biomarker measurement
 * @returns Impact breakdown showing all calculation steps
 */
export function calculateBiomarkerImpact(entry: BiomarkerEntry): BiomarkerImpact {
  const biomarker = getBiomarkerById(entry.biomarkerId);
  
  if (!biomarker) {
    throw new Error(`Biomarker not found: ${entry.biomarkerId}`);
  }
  
  // Determine if value is in optimal range
  const inOptimalRange = isInOptimalRange(entry.value, biomarker.optimalRange);
  
  // Patent #1: Base impact
  // +8 if optimal, -10 if suboptimal
  const baseImpact = inOptimalRange ? 8 : -10;
  
  // Patent #3: Get accuracy weight (it's an object with factor property)
  const accuracyWeightObj = ACCURACY_WEIGHTS[entry.accuracySource];
  const accuracyWeight = accuracyWeightObj.factor;
  
  // Final weighted impact
  const weightedImpact = baseImpact * accuracyWeight;
  
  return {
    biomarkerId: entry.biomarkerId,
    biomarkerName: biomarker.name,
    value: entry.value,
    inOptimalRange,
    baseImpact,
    accuracyWeight,
    weightedImpact: Math.round(weightedImpact * 100) / 100 // Round to 2 decimals
  };
}

// ============================================================================
// OPTIMAL RANGE CHECKING
// ============================================================================

/**
 * Check if a biomarker value is within its optimal range
 * 
 * Handles different range formats:
 * - Simple ranges: "10-20"
 * - Greater than: ">50"
 * - Less than: "<100"
 * 
 * @param value - The measured value
 * @param rangeString - The optimal range (e.g. "10-20", ">50", "<100")
 * @returns true if value is in optimal range
 */
export function isInOptimalRange(value: number, rangeString: string): boolean {
  try {
    // Handle "greater than" ranges (e.g. ">50")
    if (rangeString.startsWith('>')) {
      const threshold = parseFloat(rangeString.substring(1));
      return value > threshold;
    }
    
    // Handle "less than" ranges (e.g. "<100")
    if (rangeString.startsWith('<')) {
      const threshold = parseFloat(rangeString.substring(1));
      return value < threshold;
    }
    
    // Handle standard range (e.g. "10-20")
    const { min, max } = parseOptimalRange(rangeString);
    return value >= min && value <= max;
  } catch (error) {
    // If we can't parse range, assume not in range (safe default)
    console.warn(`Unable to parse optimal range: ${rangeString}`);
    return false;
  }
}

/**
 * Parse an optimal range string into min/max values
 * 
 * @param rangeString - Range in format "10-20"
 * @returns Object with min and max values
 */
export function parseOptimalRange(rangeString: string): { min: number; max: number } {
  const parts = rangeString.split('-').map(p => parseFloat(p.trim()));
  
  if (parts.length !== 2 || parts.some(isNaN)) {
    throw new Error(`Invalid range format: ${rangeString}`);
  }
  
  return {
    min: parts[0],
    max: parts[1]
  };
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Analyze trend for a specific biomarker over time
 * 
 * Calculates:
 * - Direction (improving/declining/stable)
 * - Average value
 * - Percent change
 * - Optimal percentage (how often it's in range)
 * 
 * @param biomarkerId - Which biomarker to analyze
 * @param entries - Historical entries for this biomarker
 * @returns Complete trend analysis
 */
export function analyzeBiomarkerTrend(
  biomarkerId: string, 
  entries: BiomarkerEntry[]
): BiomarkerTrend {
  // Filter and sort entries for this biomarker
  const biomarkerEntries = entries
    .filter(e => e.biomarkerId === biomarkerId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Need at least 2 data points for trend
  if (biomarkerEntries.length < 2) {
    return {
      biomarkerId,
      entries: biomarkerEntries,
      trend: 'insufficient_data',
      averageValue: biomarkerEntries[0]?.value || 0,
      latestValue: biomarkerEntries[0]?.value || 0,
      changePercent: 0,
      optimalPercentage: 0
    };
  }
  
  // Calculate statistics
  const values = biomarkerEntries.map(e => e.value);
  const averageValue = values.reduce((sum, v) => sum + v, 0) / values.length;
  const latestValue = values[values.length - 1];
  const firstValue = values[0];
  
  // Calculate percent change from first to last
  const changePercent = ((latestValue - firstValue) / firstValue) * 100;
  
  // Calculate what percentage of measurements were in optimal range
  const optimalCount = biomarkerEntries.filter(e => e.inOptimalRange).length;
  const optimalPercentage = (optimalCount / biomarkerEntries.length) * 100;
  
  // Determine trend direction
  let trend: BiomarkerTrend['trend'];
  const biomarker = getBiomarkerById(biomarkerId);
  
  if (!biomarker) {
    trend = 'insufficient_data';
  } else {
    // Check if we're moving toward or away from optimal
    const latestOptimal = isInOptimalRange(latestValue, biomarker.optimalRange);
    const firstOptimal = isInOptimalRange(firstValue, biomarker.optimalRange);
    
    if (Math.abs(changePercent) < 5) {
      trend = 'stable'; // Less than 5% change
    } else if (latestOptimal || (!firstOptimal && latestOptimal)) {
      trend = 'improving'; // In optimal range or moving toward it
    } else if (!latestOptimal || (firstOptimal && !latestOptimal)) {
      trend = 'declining'; // Out of optimal or moving away
    } else {
      trend = 'stable';
    }
  }
  
  return {
    biomarkerId,
    entries: biomarkerEntries,
    trend,
    averageValue: Math.round(averageValue * 100) / 100,
    latestValue,
    changePercent: Math.round(changePercent * 10) / 10,
    optimalPercentage: Math.round(optimalPercentage)
  };
}

// ============================================================================
// CORRELATION DETECTION (PATENT #6)
// ============================================================================

/**
 * Detect important correlations between biomarkers
 * 
 * These patterns are clinically significant:
 * 1. High Cortisol:DHEA ratio (>15) = chronic stress
 * 2. High CRP + High Glucose = metabolic inflammation
 * 3. Low Vitamin D + High CRP = deficiency-related inflammation
 * 
 * @param entries - All biomarker entries
 * @returns Array of detected correlation patterns
 */
export function detectCorrelations(entries: BiomarkerEntry[]): string[] {
  const correlations: string[] = [];
  
  // Get latest values for key biomarkers
  const getLatestValue = (biomarkerId: string): number | null => {
    const biomarkerEntries = entries
      .filter(e => e.biomarkerId === biomarkerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return biomarkerEntries[0]?.value || null;
  };
  
  // CORRELATION 1: Cortisol:DHEA Ratio
  const cortisolDheaRatio = getLatestValue('cortisol_dhea_ratio');
  if (cortisolDheaRatio !== null && cortisolDheaRatio > 15) {
    correlations.push('high_stress_activation');
  }
  
  // CORRELATION 2: CRP + Glucose (Metabolic Inflammation)
  const crp = getLatestValue('crp');
  const glucose = getLatestValue('fasting_glucose');
  if (crp !== null && glucose !== null && crp > 3 && glucose > 100) {
    correlations.push('metabolic_inflammation');
  }
  
  // CORRELATION 3: Vitamin D + CRP (Deficiency Inflammation)
  const vitaminD = getLatestValue('vitamin_d');
  if (vitaminD !== null && crp !== null && vitaminD < 30 && crp > 3) {
    correlations.push('vitamin_d_inflammation');
  }
  
  // CORRELATION 4: High Cortisol AM + Low DHEA
  const cortisolAm = getLatestValue('cortisol_am');
  const dhea = getLatestValue('dhea_s');
  if (cortisolAm !== null && dhea !== null && cortisolAm > 16 && dhea < 280) {
    correlations.push('stress_hormone_imbalance');
  }
  
  // CORRELATION 5: High Insulin + High Triglycerides
  const insulin = getLatestValue('fasting_insulin');
  const triglycerides = getLatestValue('triglycerides');
  if (insulin !== null && triglycerides !== null && insulin > 10 && triglycerides > 150) {
    correlations.push('insulin_resistance_pattern');
  }
  
  return correlations;
}

// ============================================================================
// SCORE INTERPRETATION
// ============================================================================

/**
 * Get interpretation text for a myVagal Tone score
 * 
 * @param score - myVagal Tone score (0-100)
 * @returns Object with status, label, and description
 */
export function interpretMyVagalTone(score: number): {
  status: 'critical' | 'warning' | 'good' | 'optimal';
  label: string;
  description: string;
  color: string;
} {
  if (score >= 80) {
    return {
      status: 'optimal',
      label: 'Excellent Resilience',
      description: 'Your biomarkers indicate strong stress resilience and optimal wellness. Keep up your current practices!',
      color: 'text-green-400'
    };
  } else if (score >= 60) {
    return {
      status: 'good',
      label: 'Good Resilience',
      description: 'Your biomarkers show solid stress resilience. Small improvements could optimize your wellness further.',
      color: 'text-blue-400'
    };
  } else if (score >= 40) {
    return {
      status: 'warning',
      label: 'Moderate Concerns',
      description: 'Some biomarkers suggest reduced resilience. Consider addressing lifestyle factors affecting your wellness.',
      color: 'text-yellow-400'
    };
  } else {
    return {
      status: 'critical',
      label: 'Attention Needed',
      description: 'Multiple biomarkers indicate challenges with stress resilience. Prioritize wellness interventions and consult healthcare providers.',
      color: 'text-red-400'
    };
  }
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format a biomarker value for display
 * 
 * @param value - Numeric value
 * @param unit - Unit of measurement
 * @returns Formatted string (e.g. "12.5 µg/dL")
 */
export function formatBiomarkerValue(value: number, unit: string): string {
  // Round to appropriate precision based on value magnitude
  let precision = 1;
  if (value < 1) {
    precision = 2;
  } else if (value > 100) {
    precision = 0;
  }
  
  const roundedValue = value.toFixed(precision);
  return `${roundedValue} ${unit}`;
}
