// VagalSync V15.0 - Enhanced myVagal Tone™ Calculator
// Now with Genetic + Epigenetic Integration!

import { BiomarkerEntry } from '../types/biomarker.types';
import { getBiomarkerById } from './biomarkerDatabase';
import { 
  getGeneticEpigeneticBiomarkerById,
  hasHighRiskGenetics 
} from './geneticEpigeneticDatabase';

// ============================================================================
// ENHANCED myVagal Tone CALCULATION (Patents #1 + #3 + #10)
// ============================================================================

export interface EnhancedMyVagalToneScore {
  overallScore: number; // 0-100
  biochemicalScore: number; // Traditional biomarkers
  geneticScore: number; // Genetic risk factors
  epigeneticScore: number; // Modifiable epigenetic markers
  confidence: number; // 0-1, based on data completeness
  breakdown: {
    category: string;
    score: number;
    weight: number;
    contribution: number;
  }[];
  geneticRisks: string[];
  epigeneticOpportunities: string[];
  personalizedRecommendations: string[];
}

/**
 * Calculate ENHANCED myVagal Tone™ with Genetic + Epigenetic Integration
 * 
 * Formula:
 * Overall Score = (Biochemical × 0.50) + (Genetic × 0.20) + (Epigenetic × 0.30)
 * 
 * This integrates:
 * - Traditional biochemical biomarkers (cortisol, CRP, etc.)
 * - Genetic SNPs (MTHFR, COMT, APOE, etc.) from 23andMe
 * - Epigenetic markers (methylation age, telomere length, HDAC, etc.)
 * - Gene expression (NF-κB, FOXO3, mTOR, AMPK, etc.)
 */
export function calculateEnhancedMyVagalTone(
  biochemicalEntries: BiomarkerEntry[],
  geneticData?: Record<string, string>, // SNP genotypes from 23andMe
  epigeneticData?: Record<string, number> // Methylation age, telomere length, etc.
): EnhancedMyVagalToneScore {
  
  // ========================================================================
  // 1. BIOCHEMICAL SCORE (Traditional Biomarkers)
  // ========================================================================
  
  const biochemicalScore = calculateBiochemicalScore(biochemicalEntries);
  
  // ========================================================================
  // 2. GENETIC SCORE (SNPs from 23andMe)
  // ========================================================================
  
  const geneticScore = geneticData 
    ? calculateGeneticScore(geneticData)
    : { score: 75, risks: [], hasData: false }; // Neutral if no data
  
  // ========================================================================
  // 3. EPIGENETIC SCORE (Modifiable Markers)
  // ========================================================================
  
  const epigeneticScore = epigeneticData
    ? calculateEpigeneticScore(epigeneticData)
    : { score: 75, opportunities: [], hasData: false }; // Neutral if no data
  
  // ========================================================================
  // 4. WEIGHTED INTEGRATION
  // ========================================================================
  
  const weights = {
    biochemical: 0.50, // Traditional biomarkers still most weight
    genetic: 0.20,     // Genetic risk factors (non-modifiable)
    epigenetic: 0.30   // Epigenetic expression (modifiable!)
  };
  
  // If missing genetic/epigenetic data, redistribute weight to biochemical
  let adjustedWeights = { ...weights };
  if (!geneticData && !epigeneticData) {
    adjustedWeights.biochemical = 1.0;
    adjustedWeights.genetic = 0;
    adjustedWeights.epigenetic = 0;
  } else if (!geneticData) {
    adjustedWeights.biochemical = 0.60;
    adjustedWeights.genetic = 0;
    adjustedWeights.epigenetic = 0.40;
  } else if (!epigeneticData) {
    adjustedWeights.biochemical = 0.65;
    adjustedWeights.genetic = 0.35;
    adjustedWeights.epigenetic = 0;
  }
  
  const overallScore = Math.round(
    biochemicalScore.score * adjustedWeights.biochemical +
    geneticScore.score * adjustedWeights.genetic +
    epigeneticScore.score * adjustedWeights.epigenetic
  );
  
  // ========================================================================
  // 5. CONFIDENCE CALCULATION
  // ========================================================================
  
  const dataCompleteness = {
    biochemical: biochemicalEntries.length >= 8 ? 1.0 : biochemicalEntries.length / 8,
    genetic: geneticData ? 1.0 : 0,
    epigenetic: epigeneticData ? 1.0 : 0
  };
  
  const confidence = 
    (dataCompleteness.biochemical * 0.50) +
    (dataCompleteness.genetic * 0.20) +
    (dataCompleteness.epigenetic * 0.30);
  
  // ========================================================================
  // 6. PERSONALIZED RECOMMENDATIONS
  // ========================================================================
  
  const recommendations = generatePersonalizedRecommendations(
    biochemicalScore.interventions || [],
    geneticScore.risks,
    epigeneticScore.opportunities
  );
  
  return {
    overallScore,
    biochemicalScore: biochemicalScore.score,
    geneticScore: geneticScore.score,
    epigeneticScore: epigeneticScore.score,
    confidence,
    breakdown: [
      {
        category: 'Biochemical',
        score: biochemicalScore.score,
        weight: adjustedWeights.biochemical,
        contribution: biochemicalScore.score * adjustedWeights.biochemical
      },
      {
        category: 'Genetic',
        score: geneticScore.score,
        weight: adjustedWeights.genetic,
        contribution: geneticScore.score * adjustedWeights.genetic
      },
      {
        category: 'Epigenetic',
        score: epigeneticScore.score,
        weight: adjustedWeights.epigenetic,
        contribution: epigeneticScore.score * adjustedWeights.epigenetic
      }
    ],
    geneticRisks: geneticScore.risks,
    epigeneticOpportunities: epigeneticScore.opportunities,
    personalizedRecommendations: recommendations
  };
}

// ============================================================================
// BIOCHEMICAL SCORE (Existing Logic)
// ============================================================================

function calculateBiochemicalScore(entries: BiomarkerEntry[]): {
  score: number;
  interventions: string[];
} {
  if (entries.length === 0) {
    return { score: 50, interventions: [] };
  }
  
  // Calculate weighted average based on existing myVagal Tone algorithm
  let totalWeightedScore = 0;
  let totalWeight = 0;
  const interventions: string[] = [];
  
  entries.forEach(entry => {
    const biomarker = getBiomarkerById(entry.biomarkerId);
    if (!biomarker) return;
    
    const weight = biomarker.myVagalToneWeight || 0;
    const inOptimal = entry.inOptimalRange ? 100 : 50;
    
    totalWeightedScore += inOptimal * weight;
    totalWeight += weight;
    
    if (!entry.inOptimalRange && biomarker.interventions) {
      interventions.push(...biomarker.interventions);
    }
  });
  
  const score = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 50;
  
  return { score, interventions: [...new Set(interventions)] };
}

// ============================================================================
// GENETIC SCORE (23andMe SNP Data)
// ============================================================================

function calculateGeneticScore(snpData: Record<string, string>): {
  score: number;
  risks: string[];
  hasData: boolean;
} {
  let score = 100; // Start at 100, deduct for risk variants
  const risks: string[] = [];
  
  // MTHFR C677T
  if (snpData.mthfr_c677t === 'TT') {
    score -= 15; // Homozygous = significant methylation impairment
    risks.push('MTHFR TT: Severely impaired methylation - requires methylfolate');
  } else if (snpData.mthfr_c677t === 'CT') {
    score -= 8; // Heterozygous = moderate impairment
    risks.push('MTHFR CT: Moderately impaired methylation - consider methylfolate');
  }
  
  // COMT Val158Met
  if (snpData.comt_v158m === 'Met/Met') {
    score -= 10; // Worrier variant = stress-sensitive
    risks.push('COMT Met/Met: Stress-sensitive - prioritize recovery and avoid stimulants');
  } else if (snpData.comt_v158m === 'Val/Met') {
    score -= 5; // Heterozygous = balanced
    risks.push('COMT Val/Met: Balanced stress response - optimize based on context');
  }
  
  // APOE ε4
  if (snpData.apoe_e4 === 'ε4/ε4') {
    score -= 20; // Two copies = high Alzheimer's risk
    risks.push('APOE ε4/ε4: High AD risk - aggressive cardiovascular and cognitive optimization required');
  } else if (snpData.apoe_e4 === 'ε3/ε4') {
    score -= 12; // One copy = moderate risk
    risks.push('APOE ε3/ε4: Moderate AD risk - optimize cardiovascular and cognitive health');
  }
  
  // VDR Fok1
  if (snpData.vdr_fok1 === 'ff') {
    score -= 8; // Less efficient vitamin D receptor
    risks.push('VDR ff: Less efficient vitamin D receptor - target levels >50 ng/mL');
  } else if (snpData.vdr_fok1 === 'Ff') {
    score -= 4;
    risks.push('VDR Ff: Moderate vitamin D efficiency - maintain optimal levels');
  }
  
  // SLC6A4 (5-HTTLPR)
  if (snpData.slc6a4_5httlpr === 'S/S') {
    score -= 10; // Short variant = stress-sensitive
    risks.push('SLC6A4 S/S: Stress-sensitive serotonin transport - prioritize stress management');
  } else if (snpData.slc6a4_5httlpr === 'L/S') {
    score -= 5;
    risks.push('SLC6A4 L/S: Moderate stress sensitivity - balance stress and recovery');
  }
  
  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));
  
  return { score, risks, hasData: true };
}

// ============================================================================
// EPIGENETIC SCORE (Modifiable Markers)
// ============================================================================

function calculateEpigeneticScore(data: Record<string, number>): {
  score: number;
  opportunities: string[];
  hasData: boolean;
} {
  let totalScore = 0;
  let markerCount = 0;
  const opportunities: string[] = [];
  
  // DNA Methylation Age (most important)
  if (data.dna_methylation_age && data.chronological_age) {
    const ageDiff = data.dna_methylation_age - data.chronological_age;
    let ageScore = 100;
    
    if (ageDiff <= -5) {
      ageScore = 100; // 5+ years younger = excellent
    } else if (ageDiff <= 0) {
      ageScore = 90; // At or below chronological = good
    } else if (ageDiff <= 5) {
      ageScore = 75; // Up to 5 years older = okay
      opportunities.push('Methylation age elevated - optimize fasting, exercise, stress management');
    } else {
      ageScore = 50; // >5 years older = needs intervention
      opportunities.push('Methylation age significantly elevated - aggressive lifestyle optimization needed');
    }
    
    totalScore += ageScore * 0.35; // 35% weight
    markerCount += 0.35;
  }
  
  // Telomere Length
  if (data.telomere_length) {
    let telomereScore = 100;
    
    if (data.telomere_length >= 9) {
      telomereScore = 100; // Excellent
    } else if (data.telomere_length >= 7) {
      telomereScore = 85; // Good
    } else if (data.telomere_length >= 5) {
      telomereScore = 70; // Okay
      opportunities.push('Telomeres shortening - increase omega-3, exercise, meditation');
    } else {
      telomereScore = 50; // Short
      opportunities.push('Short telomeres - aggressive intervention: HIIT, meditation, omega-3, consider TA-65');
    }
    
    totalScore += telomereScore * 0.25; // 25% weight
    markerCount += 0.25;
  }
  
  // HDAC Activity
  if (data.hdac_activity) {
    let hdacScore = 100;
    
    if (data.hdac_activity >= 1500 && data.hdac_activity <= 2500) {
      hdacScore = 100; // Optimal range
    } else if (data.hdac_activity >= 1000 && data.hdac_activity <= 3000) {
      hdacScore = 85; // Normal range
    } else {
      hdacScore = 65; // Out of range
      opportunities.push('HDAC dysregulation - sulforaphane, butyrate, resveratrol, fasting');
    }
    
    totalScore += hdacScore * 0.15; // 15% weight
    markerCount += 0.15;
  }
  
  // Nrf2 Activation
  if (data.nrf2_activation) {
    let nrf2Score = 100;
    
    if (data.nrf2_activation >= 1.5 && data.nrf2_activation <= 3.0) {
      nrf2Score = 100; // Optimal
    } else if (data.nrf2_activation >= 1.0 && data.nrf2_activation <= 2.0) {
      nrf2Score = 80; // Normal
      opportunities.push('Nrf2 suboptimal - sulforaphane (broccoli sprouts) most effective');
    } else {
      nrf2Score = 60; // Low
      opportunities.push('Low Nrf2 - sulforaphane, curcumin, EGCG, intermittent fasting');
    }
    
    totalScore += nrf2Score * 0.15; // 15% weight
    markerCount += 0.15;
  }
  
  // NAD+:NADH Ratio
  if (data.nad_nadh_ratio) {
    let nadScore = 100;
    
    if (data.nad_nadh_ratio >= 7 && data.nad_nadh_ratio <= 15) {
      nadScore = 100; // Optimal
    } else if (data.nad_nadh_ratio >= 3 && data.nad_nadh_ratio <= 10) {
      nadScore = 80; // Normal
      opportunities.push('NAD+ suboptimal - NMN/NR supplementation, fasting, exercise');
    } else {
      nadScore = 55; // Low
      opportunities.push('Low NAD+ - critical for aging: NMN 500-1000mg, fasting, avoid alcohol');
    }
    
    totalScore += nadScore * 0.10; // 10% weight
    markerCount += 0.10;
  }
  
  // Calculate final score
  const score = markerCount > 0 ? Math.round(totalScore / markerCount) : 75;
  
  return { score, opportunities, hasData: true };
}

// ============================================================================
// PERSONALIZED RECOMMENDATIONS
// ============================================================================

function generatePersonalizedRecommendations(
  biochemicalInterventions: string[],
  geneticRisks: string[],
  epigeneticOpportunities: string[]
): string[] {
  const recommendations: string[] = [];
  
  // Priority 1: Genetic-specific interventions
  if (geneticRisks.some(r => r.includes('MTHFR'))) {
    recommendations.push('🧬 GENETIC PRIORITY: Methylfolate (L-5-MTHF) 400-800mcg daily + Methylcobalamin B12');
  }
  
  if (geneticRisks.some(r => r.includes('APOE'))) {
    recommendations.push('🧬 GENETIC PRIORITY: Aggressive cardiovascular optimization - Mediterranean diet, omega-3 2-4g, exercise 150+ min/week');
  }
  
  if (geneticRisks.some(r => r.includes('COMT Met/Met'))) {
    recommendations.push('🧬 GENETIC PRIORITY: Stress-sensitive genotype - prioritize recovery, magnesium, avoid stimulants');
  }
  
  // Priority 2: Epigenetic optimization opportunities
  if (epigeneticOpportunities.some(o => o.includes('Methylation age'))) {
    recommendations.push('🔄 EPIGENETIC OPPORTUNITY: Reverse biological aging - intermittent fasting, exercise, sleep 7-9h, stress management');
  }
  
  if (epigeneticOpportunities.some(o => o.includes('NAD+'))) {
    recommendations.push('🔄 EPIGENETIC OPPORTUNITY: Boost NAD+ for longevity - NMN 500-1000mg or NR 300-900mg daily');
  }
  
  if (epigeneticOpportunities.some(o => o.includes('Nrf2'))) {
    recommendations.push('🔄 EPIGENETIC OPPORTUNITY: Activate antioxidant genes - sulforaphane from broccoli sprouts most potent');
  }
  
  // Priority 3: Top biochemical interventions
  const topBiochemical = biochemicalInterventions.slice(0, 3);
  topBiochemical.forEach(intervention => {
    if (!recommendations.some(r => r.toLowerCase().includes(intervention.toLowerCase()))) {
      recommendations.push(`⚗️ BIOCHEMICAL: ${intervention}`);
    }
  });
  
  return recommendations.slice(0, 8); // Top 8 recommendations
}

// ============================================================================
// EXPORT
// ============================================================================

export {
  calculateEnhancedMyVagalTone,
  calculateBiochemicalScore,
  calculateGeneticScore,
  calculateEpigeneticScore
};
