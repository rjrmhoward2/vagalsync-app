/**
 * VagalSync V15.0 Ultimate - Biomarker Type Definitions
 * 
 * This file contains all TypeScript interfaces for the biomarker tracking system.
 * These types ensure type safety across the entire biomarker feature.
 * 
 * Patent References:
 * - Patent #1: myVagal Tone™ Scoring (0-100 stress resilience score)
 * - Patent #3: Accuracy Weighting System (laboratory vs consumer devices)
 */

// ============================================================================
// BIOMARKER CATEGORIES
// ============================================================================

/**
 * Six main categories of biomarkers we track
 * Each category has specific biomarkers with optimal ranges
 */
export type BiomarkerCategory = 
  | 'stress_hormones'    // Cortisol, DHEA, etc.
  | 'inflammatory'       // CRP, Homocysteine, etc.
  | 'metabolic'         // Glucose, HbA1c, Insulin, etc.
  | 'cardiovascular'    // LDL, HDL, Triglycerides, etc.
  | 'neurochemical'     // Serotonin, Dopamine, GABA, etc.
  | 'nutritional';      // Vitamin D, Magnesium, Omega-3, etc.

// ============================================================================
// ACCURACY WEIGHTING (PATENT #3)
// ============================================================================

/**
 * Measurement source types with accuracy factors
 * 
 * Laboratory & Medical Device = 1.0 (100% weight)
 * Validated Consumer = 0.98 (98% weight) 
 * Standard Consumer = 0.92 (92% weight)
 */
export type AccuracySource = 
  | 'laboratory'          // Professional lab test (most accurate)
  | 'medical_device'      // FDA-cleared medical device
  | 'validated_consumer'  // Consumer device with clinical validation
  | 'standard_consumer';  // Standard consumer wearable

/**
 * Accuracy factor applied to biomarker impacts
 */
export interface AccuracyWeight {
  factor: number;        // Multiplier: 0.92 to 1.0
  label: string;         // Display name
  description: string;   // Explanation for user
}

// ============================================================================
// BIOMARKER DEFINITIONS
// ============================================================================

/**
 * Core biomarker metadata from our database
 * Each of the 24 biomarkers has this structure
 */
export interface BiomarkerDefinition {
  id: string;                    // Unique identifier (e.g., "cortisol_am")
  name: string;                  // Display name (e.g., "Cortisol AM")
  unit: string;                  // Measurement unit (e.g., "μg/dL")
  category: BiomarkerCategory;   // Which of 6 categories
  optimalRange: string;          // Optimal range for wellness (e.g., "10-16")
  normalRange: string;           // Clinical normal range (e.g., "6.2-19.4")
  description: string;           // Brief explanation
  clinicalSignificance: string;  // Why this biomarker matters
  impactOnVagalTone: number;     // Base impact: +8 optimal, -10 suboptimal
  icon?: string;                 // Optional emoji or icon
}

// ============================================================================
// BIOMARKER ENTRIES (USER DATA)
// ============================================================================

/**
 * A single biomarker measurement entered by the user
 */
export interface BiomarkerEntry {
  id: string;                    // Unique entry ID
  biomarkerId: string;           // References BiomarkerDefinition.id
  value: number;                 // Measured value
  unit: string;                  // Unit of measurement
  timestamp: Date;               // When measured
  accuracySource: AccuracySource; // Where measured (affects weighting)
  notes?: string;                // Optional user notes
  inOptimalRange: boolean;       // Is value in optimal range?
  impact: number;                // Weighted impact on myVagal Tone
}

// ============================================================================
// MYVAGAL TONE™ SCORING (PATENT #1)
// ============================================================================

/**
 * myVagal Tone™ Score Calculation Result
 * 
 * Formula:
 * - Base score: 67
 * - Add/subtract weighted impacts from all biomarkers
 * - Clamp result between 0-100
 */
export interface MyVagalToneScore {
  score: number;                    // Final score (0-100)
  baseScore: number;                // Starting point (67)
  totalImpact: number;              // Sum of all biomarker impacts
  biomarkerCount: number;           // How many biomarkers contributed
  lastUpdated: Date;                // When last calculated
  breakdown: BiomarkerImpact[];     // Individual biomarker contributions
}

/**
 * Individual biomarker's contribution to myVagal Tone
 */
export interface BiomarkerImpact {
  biomarkerId: string;              // Which biomarker
  biomarkerName: string;            // Display name
  value: number;                    // Measured value
  inOptimalRange: boolean;          // Is optimal?
  baseImpact: number;               // Before weighting (+8 or -10)
  accuracyWeight: number;           // Accuracy multiplier (0.92-1.0)
  weightedImpact: number;           // Final impact after weighting
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Historical trend data for a specific biomarker
 */
export interface BiomarkerTrend {
  biomarkerId: string;              // Which biomarker
  entries: BiomarkerEntry[];        // Historical measurements
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  averageValue: number;             // Mean value
  latestValue: number;              // Most recent measurement
  changePercent: number;            // % change from first to last
  optimalPercentage: number;        // % of measurements in optimal range
}

// ============================================================================
// AI INSIGHTS
// ============================================================================

/**
 * AI-generated insights about biomarkers
 * Can be single biomarker analysis or correlation detection
 */
export interface AIInsight {
  id: string;                       // Unique insight ID
  type: AIInsightType;              // What kind of insight
  title: string;                    // Short headline
  content: string;                  // Full explanation
  biomarkerIds: string[];           // Which biomarker(s) involved
  confidence: number;               // AI confidence (0.0-1.0)
  timestamp: Date;                  // When generated
  expandable: boolean;              // Can user expand for more details?
  metadata?: {
    recommendations?: string[];     // Actionable suggestions
    interventions?: string[];       // Specific actions to take
    status?: 'critical' | 'warning' | 'optimal' | 'info';
    impact?: number;                // Predicted impact on wellness
  };
}

/**
 * Types of AI insights we generate
 */
export type AIInsightType = 
  | 'biomarker_analysis'   // Single biomarker interpretation
  | 'trend_analysis'       // Prediction based on history
  | 'correlation'          // Relationships between biomarkers
  | 'recommendation';      // Evidence-based intervention

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * State for the biomarker entry modal
 */
export interface BiomarkerEntryModalState {
  isOpen: boolean;
  selectedBiomarker: BiomarkerDefinition | null;
  mode: 'add' | 'edit';
  existingEntry?: BiomarkerEntry;
}

/**
 * State for biomarker filtering/sorting
 */
export interface BiomarkerFilters {
  category: BiomarkerCategory | 'all';
  searchQuery: string;
  showOnlyOutOfRange: boolean;
  sortBy: 'name' | 'recent' | 'impact';
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

/**
 * Data structure for exporting biomarker data
 */
export interface BiomarkerExport {
  version: string;                  // VagalSync version
  exportDate: Date;                 // When exported
  userId?: string;                  // Optional user identifier
  entries: BiomarkerEntry[];        // All biomarker entries
  myVagalToneHistory: MyVagalToneScore[]; // Historical scores
  format: 'json' | 'csv';           // Export format
}

// ============================================================================
// WELLNESS COMPLIANCE
// ============================================================================

/**
 * Disclaimer text that appears on every biomarker page
 */
export const WELLNESS_DISCLAIMER = 
  "Wellness Tracking Only: This biomarker tracking is for wellness and personal health " +
  "optimization purposes only. It is not intended for medical diagnosis or treatment. " +
  "Always consult with qualified healthcare professionals for medical advice.";
