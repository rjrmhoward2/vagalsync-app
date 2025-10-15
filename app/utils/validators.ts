/**
 * VagalSync V15.0 Ultimate - Input Validators
 * 
 * This file contains validation functions for biomarker data entry.
 * Ensures all user inputs are safe, valid, and within reasonable ranges.
 * 
 * Validation principles:
 * - Defensive programming: validate everything
 * - Informative errors: tell user exactly what's wrong
 * - Reasonable ranges: prevent obviously incorrect values
 */

import { AccuracySource } from '../types/biomarker.types';
import { getBiomarkerById } from './biomarkerDatabase';

// ============================================================================
// VALIDATION RESULT TYPE
// ============================================================================

/**
 * Result of a validation check
 * Contains both success/failure and error messages
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

// ============================================================================
// BIOMARKER VALUE VALIDATION
// ============================================================================

/**
 * Validate a biomarker value entry
 * 
 * Checks:
 * - Value is a valid number
 * - Value is within physically possible range
 * - Biomarker exists in database
 * - Unit matches expected unit
 * 
 * @param biomarkerId - Which biomarker being measured
 * @param value - Measured value
 * @param unit - Unit of measurement
 * @returns Validation result with error message if invalid
 */
export function validateBiomarkerValue(
  biomarkerId: string,
  value: number | string,
  unit: string
): ValidationResult {
  // Check 1: Biomarker exists
  const biomarker = getBiomarkerById(biomarkerId);
  if (!biomarker) {
    return {
      isValid: false,
      error: `Biomarker "${biomarkerId}" not found in database`
    };
  }

  // Check 2: Value is a valid number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Please enter a valid number'
    };
  }

  // Check 3: Value is not negative (no biomarkers should be negative)
  if (numValue < 0) {
    return {
      isValid: false,
      error: 'Value cannot be negative'
    };
  }

  // Check 4: Unit matches expected unit
  if (unit !== biomarker.unit) {
    return {
      isValid: false,
      error: `Unit mismatch: expected ${biomarker.unit}, got ${unit}`
    };
  }

  // Check 5: Value is within physically plausible range
  const plausibilityCheck = checkPlausibility(biomarkerId, numValue);
  if (!plausibilityCheck.isValid) {
    return plausibilityCheck;
  }

  // All checks passed
  const warnings: string[] = [];
  
  // Warn if value is far outside normal range
  const rangeWarning = checkOutsideNormalRange(biomarker.normalRange, numValue);
  if (rangeWarning) {
    warnings.push(rangeWarning);
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Check if value is physically plausible
 * Prevents obviously incorrect entries (e.g., cortisol = 1000)
 */
function checkPlausibility(biomarkerId: string, value: number): ValidationResult {
  // Define maximum plausible values for each biomarker type
  // These are intentionally generous to avoid false rejections
  const plausibilityLimits: Record<string, { min: number; max: number }> = {
    // Stress hormones
    cortisol_am: { min: 0, max: 50 },
    cortisol_pm: { min: 0, max: 30 },
    dhea_s: { min: 0, max: 1000 },
    cortisol_dhea_ratio: { min: 0, max: 100 },
    
    // Inflammatory
    crp: { min: 0, max: 50 },
    homocysteine: { min: 0, max: 100 },
    esr: { min: 0, max: 150 },
    il6: { min: 0, max: 100 },
    
    // Metabolic
    fasting_glucose: { min: 40, max: 400 },
    hba1c: { min: 3, max: 15 },
    fasting_insulin: { min: 0, max: 100 },
    homa_ir: { min: 0, max: 20 },
    
    // Cardiovascular
    ldl_cholesterol: { min: 0, max: 400 },
    hdl_cholesterol: { min: 0, max: 150 },
    triglycerides: { min: 0, max: 1000 },
    apob: { min: 0, max: 300 },
    
    // Neurochemical
    serotonin: { min: 0, max: 500 },
    dopamine: { min: 0, max: 200 },
    gaba: { min: 0, max: 5 },
    norepinephrine: { min: 0, max: 3000 },
    
    // Nutritional
    vitamin_d: { min: 0, max: 150 },
    magnesium_rbc: { min: 0, max: 15 },
    omega3_index: { min: 0, max: 20 },
    vitamin_b12: { min: 0, max: 2000 }
  };

  const limits = plausibilityLimits[biomarkerId];
  if (!limits) {
    // If we don't have specific limits, allow anything positive
    return { isValid: true };
  }

  if (value < limits.min || value > limits.max) {
    return {
      isValid: false,
      error: `Value ${value} seems implausible. Expected range: ${limits.min}-${limits.max}. Please double-check your entry.`
    };
  }

  return { isValid: true };
}

/**
 * Check if value is significantly outside clinical normal range
 * Returns warning message if so
 */
function checkOutsideNormalRange(normalRange: string, value: number): string | null {
  // Parse normal range
  if (normalRange.includes('-')) {
    const [min, max] = normalRange.split('-').map(Number);
    if (value < min * 0.5) {
      return `Value is significantly below normal range (${normalRange}). Please verify this measurement.`;
    }
    if (value > max * 2) {
      return `Value is significantly above normal range (${normalRange}). Please verify this measurement.`;
    }
  } else if (normalRange.startsWith('<')) {
    const threshold = Number(normalRange.substring(1));
    if (value > threshold * 5) {
      return `Value is significantly above normal threshold (${normalRange}). Please verify this measurement.`;
    }
  } else if (normalRange.startsWith('>')) {
    const threshold = Number(normalRange.substring(1));
    if (value < threshold * 0.2) {
      return `Value is significantly below normal threshold (${normalRange}). Please verify this measurement.`;
    }
  }

  return null;
}

// ============================================================================
// ACCURACY SOURCE VALIDATION
// ============================================================================

/**
 * Validate accuracy source selection
 */
export function validateAccuracySource(source: string): ValidationResult {
  const validSources: AccuracySource[] = [
    'laboratory',
    'medical_device',
    'validated_consumer',
    'standard_consumer'
  ];

  if (!validSources.includes(source as AccuracySource)) {
    return {
      isValid: false,
      error: `Invalid accuracy source: ${source}. Must be one of: ${validSources.join(', ')}`
    };
  }

  return { isValid: true };
}

// ============================================================================
// DATE/TIME VALIDATION
// ============================================================================

/**
 * Validate measurement timestamp
 * 
 * Ensures:
 * - Date is valid
 * - Date is not in the future
 * - Date is not too far in the past (>10 years)
 */
export function validateTimestamp(timestamp: Date | string): ValidationResult {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Check if valid date
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format'
    };
  }

  const now = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(now.getFullYear() - 10);

  // Check if future date
  if (date > now) {
    return {
      isValid: false,
      error: 'Measurement date cannot be in the future'
    };
  }

  // Check if too old
  if (date < tenYearsAgo) {
    return {
      isValid: false,
      error: 'Measurement date cannot be more than 10 years ago'
    };
  }

  return { isValid: true };
}

// ============================================================================
// NOTES VALIDATION
// ============================================================================

/**
 * Validate optional notes field
 * 
 * Ensures:
 * - Not too long (max 500 characters)
 * - No dangerous HTML/script content
 */
export function validateNotes(notes: string | undefined): ValidationResult {
  if (!notes) {
    return { isValid: true }; // Notes are optional
  }

  const MAX_LENGTH = 500;

  // Check length
  if (notes.length > MAX_LENGTH) {
    return {
      isValid: false,
      error: `Notes too long (${notes.length} characters). Maximum ${MAX_LENGTH} characters.`
    };
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(notes)) {
      return {
        isValid: false,
        error: 'Notes contain invalid characters'
      };
    }
  }

  return { isValid: true };
}

// ============================================================================
// COMPLETE ENTRY VALIDATION
// ============================================================================

/**
 * Validate a complete biomarker entry
 * Runs all validation checks and aggregates results
 * 
 * @param entry - Complete entry data to validate
 * @returns Validation result with all errors and warnings
 */
export function validateBiomarkerEntry(entry: {
  biomarkerId: string;
  value: number | string;
  unit: string;
  timestamp: Date | string;
  accuracySource: string;
  notes?: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate biomarker value
  const valueCheck = validateBiomarkerValue(
    entry.biomarkerId,
    entry.value,
    entry.unit
  );
  if (!valueCheck.isValid) {
    errors.push(valueCheck.error!);
  }
  if (valueCheck.warnings) {
    warnings.push(...valueCheck.warnings);
  }

  // Validate accuracy source
  const sourceCheck = validateAccuracySource(entry.accuracySource);
  if (!sourceCheck.isValid) {
    errors.push(sourceCheck.error!);
  }

  // Validate timestamp
  const timestampCheck = validateTimestamp(entry.timestamp);
  if (!timestampCheck.isValid) {
    errors.push(timestampCheck.error!);
  }

  // Validate notes
  const notesCheck = validateNotes(entry.notes);
  if (!notesCheck.isValid) {
    errors.push(notesCheck.error!);
  }

  // Return combined result
  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('; '),
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ============================================================================
// BULK VALIDATION
// ============================================================================

/**
 * Validate multiple entries at once
 * Used when importing data or bulk adding
 */
export function validateBulkEntries(
  entries: Array<{
    biomarkerId: string;
    value: number | string;
    unit: string;
    timestamp: Date | string;
    accuracySource: string;
    notes?: string;
  }>
): { valid: boolean; errors: string[]; validCount: number; invalidCount: number } {
  const errors: string[] = [];
  let validCount = 0;
  let invalidCount = 0;

  entries.forEach((entry, index) => {
    const result = validateBiomarkerEntry(entry);
    if (result.isValid) {
      validCount++;
    } else {
      invalidCount++;
      errors.push(`Entry ${index + 1}: ${result.error}`);
    }
  });

  return {
    valid: invalidCount === 0,
    errors,
    validCount,
    invalidCount
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize user input by removing dangerous characters
 * Used as a last line of defense
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Sanitize notes field specifically
 */
export function sanitizeNotes(notes: string | undefined): string | undefined {
  if (!notes) return undefined;
  return sanitizeInput(notes).substring(0, 500); // Also enforce length
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

/**
 * Real-time validation for form fields
 * Returns immediate feedback as user types
 */
export function validateFieldRealtime(
  fieldName: string,
  value: any
): { error?: string; warning?: string } {
  switch (fieldName) {
    case 'value':
      if (value === '' || value === null || value === undefined) {
        return { error: 'Value is required' };
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { error: 'Must be a number' };
      }
      if (numValue < 0) {
        return { error: 'Cannot be negative' };
      }
      return {};

    case 'timestamp':
      if (!value) {
        return { error: 'Date is required' };
      }
      const dateCheck = validateTimestamp(value);
      if (!dateCheck.isValid) {
        return { error: dateCheck.error };
      }
      return {};

    case 'accuracySource':
      if (!value) {
        return { error: 'Measurement source is required' };
      }
      const sourceCheck = validateAccuracySource(value);
      if (!sourceCheck.isValid) {
        return { error: sourceCheck.error };
      }
      return {};

    case 'notes':
      if (value && value.length > 500) {
        return { error: `${value.length}/500 characters - too long` };
      }
      return {};

    default:
      return {};
  }
}

// ============================================================================
// EXPORT VALIDATION
// ============================================================================

/**
 * Validate data before export
 * Ensures exported data is complete and safe
 */
export function validateExportData(entries: any[]): ValidationResult {
  if (!Array.isArray(entries)) {
    return {
      isValid: false,
      error: 'Export data must be an array'
    };
  }

  if (entries.length === 0) {
    return {
      isValid: false,
      error: 'No data to export'
    };
  }

  // Check that all entries have required fields
  const requiredFields = ['biomarkerId', 'value', 'timestamp'];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    for (const field of requiredFields) {
      if (!entry[field]) {
        return {
          isValid: false,
          error: `Entry ${i + 1} missing required field: ${field}`
        };
      }
    }
  }

  return { isValid: true };
}
