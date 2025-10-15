/**
 * VagalSync V15.0 Ultimate - Intervention Type Definitions
 * 
 * Type definitions for the interventions tracking system
 */

// ============================================================================
// INTERVENTION LOG
// ============================================================================

/**
 * A single intervention session log entry
 */
export interface InterventionLog {
  id: number;
  type: string;
  duration: string;
  date: string;
  time: string;
  score_before: number;
  score_after: number;
  improvement: number;
  notes?: string;
}

// ============================================================================
// INTERVENTION CATEGORY
// ============================================================================

export type InterventionCategory = 
  | 'breathing'
  | 'meditation'
  | 'movement'
  | 'sleep'
  | 'nutrition'
  | 'social'
  | 'nature'
  | 'creative';

// ============================================================================
// INTERVENTION TAB PROPS
// ============================================================================

/**
 * Props for the InterventionsTab component
 */
export interface InterventionTabProps {
  breathingExercise: boolean;
  setBreathingExercise: (value: boolean) => void;
  arMode: boolean;
  setArMode: (value: boolean) => void;
  vagalToneScore: number;
  interventionLogs: InterventionLog[];
  setInterventionLogs: (logs: InterventionLog[]) => void;
}

// ============================================================================
// INTERVENTION SESSION
// ============================================================================

export interface InterventionSession {
  id: string;
  interventionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
  notes?: string;
  effectivenessRating?: number; // 1-10
}

// ============================================================================
// INTERVENTION DEFINITION
// ============================================================================

export interface InterventionDefinition {
  id: string;
  name: string;
  category: InterventionCategory;
  description: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'moderate' | 'challenging';
  benefits: string[];
  instructions?: string[];
  revolutionary?: boolean;
}
