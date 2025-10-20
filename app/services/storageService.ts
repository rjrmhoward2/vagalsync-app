// VagalSync V15.0 Ultimate - Biomarker Storage Service
// Handles localStorage operations for biomarker data
// This is the CORRECT file - replaces biomarkerStorageService.ts

import { BiomarkerEntry, MyVagalToneScore, BiomarkerExport } from '../types/biomarker.types';
import { calculateMyVagalTone, isInOptimalRange } from '../utils/calculations';
import { getBiomarkerById } from '../utils/biomarkerDatabase';
import { validateBiomarkerEntry } from '../utils/validators';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  ENTRIES: 'vagalsync_biomarker_entries',
  SCORES: 'vagalsync_myvagal_scores'
} as const;

const CURRENT_VERSION = '1.0.0';

// ============================================================================
// STORAGE AVAILABILITY CHECK
// ============================================================================

/**
 * Check if localStorage is available
 * Some browsers/privacy modes disable localStorage
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// LOW-LEVEL STORAGE OPERATIONS
// ============================================================================

/**
 * Load all biomarker entries from localStorage
 */
export function loadBiomarkerEntries(): BiomarkerEntry[] {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available');
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) {
      return [];
    }

    const entries = JSON.parse(data);
    
    // Convert timestamp strings back to Date objects
    return entries.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load biomarker entries:', error);
    return [];
  }
}

/**
 * Save biomarker entries to localStorage
 */
export function saveBiomarkerEntries(entries: BiomarkerEntry[]): void {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage not available');
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save biomarker entries:', error);
    throw error;
  }
}

/**
 * Load myVagal Tone score history
 */
export function loadMyVagalToneScores(): MyVagalToneScore[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCORES);
    if (!data) {
      return [];
    }

    const scores = JSON.parse(data);
    
    // Convert timestamp strings back to Date objects
    return scores.map((score: any) => ({
      ...score,
      lastUpdated: new Date(score.lastUpdated)
    }));
  } catch (error) {
    console.error('Failed to load myVagal Tone scores:', error);
    return [];
  }
}

/**
 * Save myVagal Tone score history
 */
export function saveMyVagalToneScores(scores: MyVagalToneScore[]): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
  } catch (error) {
    console.error('Failed to save myVagal Tone scores:', error);
  }
}

// ============================================================================
// HIGH-LEVEL OPERATIONS
// ============================================================================

/**
 * Add a new biomarker entry
 * Automatically recalculates myVagal Tone and saves
 * 
 * @param entry - New biomarker entry to add
 * @returns The saved entry with calculated impact
 */
export function addBiomarkerEntry(
  entry: Omit<BiomarkerEntry, 'id' | 'inOptimalRange' | 'impact'>
): BiomarkerEntry {
  // Validate entry
  const validation = validateBiomarkerEntry({
    biomarkerId: entry.biomarkerId,
    value: entry.value,
    unit: entry.unit,
    timestamp: entry.timestamp,
    accuracySource: entry.accuracySource,
    notes: entry.notes
  });

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.error}`);
  }

  // Get biomarker definition for range checking
  const biomarker = getBiomarkerById(entry.biomarkerId);
  if (!biomarker) {
    throw new Error(`Biomarker not found: ${entry.biomarkerId}`);
  }

  // Calculate if in optimal range
  const inOptimalRange = isInOptimalRange(entry.value, biomarker.optimalRange);

  // Create complete entry with ID
  const completeEntry: BiomarkerEntry = {
    id: generateId(),
    ...entry,
    inOptimalRange,
    impact: 0 // Will be calculated below
  };

  // Load existing entries
  const entries = loadBiomarkerEntries();
  entries.push(completeEntry);

  // Recalculate myVagal Tone with new entry
  const newScore = calculateMyVagalTone(entries);
  
  // Update the entry's impact from the calculation
  const impactBreakdown = newScore.breakdown.find(
    b => b.biomarkerId === entry.biomarkerId
  );
  if (impactBreakdown) {
    completeEntry.impact = impactBreakdown.weightedImpact;
  }

  // Save entries
  saveBiomarkerEntries(entries);

  // Save updated score history
  const scores = loadMyVagalToneScores();
  scores.push(newScore);
  saveMyVagalToneScores(scores);

  return completeEntry;
}

/**
 * Update an existing biomarker entry
 * 
 * @param id - Entry ID to update
 * @param updates - Fields to update
 * @returns Updated entry
 */
export function updateBiomarkerEntry(
  id: string,
  updates: Partial<Omit<BiomarkerEntry, 'id'>>
): BiomarkerEntry {
  const entries = loadBiomarkerEntries();
  const index = entries.findIndex(e => e.id === id);

  if (index === -1) {
    throw new Error(`Entry not found: ${id}`);
  }

  // Merge updates
  const updatedEntry = { ...entries[index], ...updates };

  // Recalculate optimal range if value changed
  if (updates.value !== undefined) {
    const biomarker = getBiomarkerById(updatedEntry.biomarkerId);
    if (biomarker) {
      updatedEntry.inOptimalRange = isInOptimalRange(
        updatedEntry.value,
        biomarker.optimalRange
      );
    }
  }

  entries[index] = updatedEntry;

  // Recalculate myVagal Tone
  const newScore = calculateMyVagalTone(entries);

  // Save
  saveBiomarkerEntries(entries);
  
  const scores = loadMyVagalToneScores();
  scores.push(newScore);
  saveMyVagalToneScores(scores);

  return updatedEntry;
}

/**
 * Delete a biomarker entry
 * 
 * @param id - Entry ID to delete
 */
export function deleteBiomarkerEntry(id: string): void {
  const entries = loadBiomarkerEntries();
  const filtered = entries.filter(e => e.id !== id);

  if (filtered.length === entries.length) {
    throw new Error(`Entry not found: ${id}`);
  }

  // Recalculate myVagal Tone without this entry
  if (filtered.length > 0) {
    const newScore = calculateMyVagalTone(filtered);
    const scores = loadMyVagalToneScores();
    scores.push(newScore);
    saveMyVagalToneScores(scores);
  }

  saveBiomarkerEntries(filtered);
}

/**
 * Get entries for a specific biomarker
 */
export function getEntriesForBiomarker(biomarkerId: string): BiomarkerEntry[] {
  const entries = loadBiomarkerEntries();
  return entries
    .filter(e => e.biomarkerId === biomarkerId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get latest entry for each biomarker
 * Useful for dashboard "current status" display
 */
export function getLatestEntries(): Map<string, BiomarkerEntry> {
  const entries = loadBiomarkerEntries();
  const latest = new Map<string, BiomarkerEntry>();

  entries.forEach(entry => {
    const existing = latest.get(entry.biomarkerId);
    if (!existing || new Date(entry.timestamp) > new Date(existing.timestamp)) {
      latest.set(entry.biomarkerId, entry);
    }
  });

  return latest;
}

/**
 * Get current myVagal Tone score
 */
export function getCurrentMyVagalTone(): MyVagalToneScore | null {
  const entries = loadBiomarkerEntries();
  if (entries.length === 0) {
    return null;
  }
  return calculateMyVagalTone(entries);
}

// ============================================================================
// DATA EXPORT
// ============================================================================

/**
 * Export all biomarker data as JSON
 */
export function exportDataAsJSON(): string {
  const entries = loadBiomarkerEntries();
  const scores = loadMyVagalToneScores();

  const exportData: BiomarkerExport = {
    version: CURRENT_VERSION,
    exportDate: new Date(),
    entries,
    myVagalToneHistory: scores,
    format: 'json'
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export biomarker data as CSV
 * Simplified format for spreadsheet analysis
 */
export function exportDataAsCSV(): string {
  const entries = loadBiomarkerEntries();
  
  // CSV header
  const header = [
    'Date',
    'Biomarker',
    'Value',
    'Unit',
    'Optimal Range',
    'In Range',
    'Source',
    'Impact',
    'Notes'
  ].join(',');

  // CSV rows
  const rows = entries.map(entry => {
    const biomarker = getBiomarkerById(entry.biomarkerId);
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    
    return [
      date,
      biomarker?.name || entry.biomarkerId,
      entry.value,
      entry.unit,
      biomarker?.optimalRange || '',
      entry.inOptimalRange ? 'Yes' : 'No',
      entry.accuracySource,
      entry.impact,
      entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '' // Escape quotes
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Download export data as file
 * Creates a downloadable blob and triggers browser download
 */
export function downloadExport(format: 'json' | 'csv'): void {
  const data = format === 'json' ? exportDataAsJSON() : exportDataAsCSV();
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const filename = `vagalsync_biomarkers_${new Date().toISOString().split('T')[0]}.${format}`;

  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// ============================================================================
// DATA IMPORT
// ============================================================================

/**
 * Import biomarker data from JSON
 * Validates and merges with existing data
 */
export function importDataFromJSON(jsonString: string): {
  success: boolean;
  imported: number;
  errors: string[];
} {
  try {
    const data = JSON.parse(jsonString) as BiomarkerExport;
    
    // Validate format
    if (!data.entries || !Array.isArray(data.entries)) {
      return {
        success: false,
        imported: 0,
        errors: ['Invalid data format: missing entries array']
      };
    }

    // Load existing entries
    const existing = loadBiomarkerEntries();
    const existingIds = new Set(existing.map(e => e.id));

    // Import new entries (skip duplicates)
    let imported = 0;
    const errors: string[] = [];

    data.entries.forEach((entry, index) => {
      if (existingIds.has(entry.id)) {
        return; // Skip duplicate
      }

      try {
        // Validate entry
        const validation = validateBiomarkerEntry({
          biomarkerId: entry.biomarkerId,
          value: entry.value,
          unit: entry.unit,
          timestamp: entry.timestamp,
          accuracySource: entry.accuracySource,
          notes: entry.notes
        });

        if (!validation.isValid) {
          errors.push(`Entry ${index + 1}: ${validation.error}`);
          return;
        }

        existing.push(entry);
        imported++;
      } catch (error: any) {
        errors.push(`Entry ${index + 1}: ${error.message}`);
      }
    });

    // Save imported data
    if (imported > 0) {
      saveBiomarkerEntries(existing);
      
      // Recalculate score
      const newScore = calculateMyVagalTone(existing);
      const scores = loadMyVagalToneScores();
      scores.push(newScore);
      saveMyVagalToneScores(scores);
    }

    return {
      success: imported > 0,
      imported,
      errors
    };
  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      errors: [error.message]
    };
  }
}

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

/**
 * Clear all biomarker data
 * USE WITH CAUTION - this is permanent!
 */
export function clearAllData(): void {
  if (!confirm('Are you sure you want to delete ALL biomarker data? This cannot be undone!')) {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.ENTRIES);
  localStorage.removeItem(STORAGE_KEYS.SCORES);
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  entryCount: number;
  scoreCount: number;
  storageUsed: number;
  storageAvailable: boolean;
} {
  const entries = loadBiomarkerEntries();
  const scores = loadMyVagalToneScores();
  
  // Estimate storage used (rough approximation)
  const entriesSize = JSON.stringify(entries).length;
  const scoresSize = JSON.stringify(scores).length;

  return {
    entryCount: entries.length,
    scoreCount: scores.length,
    storageUsed: entriesSize + scoresSize,
    storageAvailable: isLocalStorageAvailable()
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique ID for entries
 * Uses timestamp + random string for uniqueness
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// DEVICE SYNC FUNCTIONS (Placeholders)
// ============================================================================

/**
 * Load biomarker entries with device metadata
 * Enhanced version for device sync integration
 */
export function loadBiomarkerEntriesWithDevices(): BiomarkerEntry[] {
  // For now, just return regular entries
  // When device sync is implemented, this will include device metadata
  return loadBiomarkerEntries();
}

/**
 * Get sync status for connected devices
 * Placeholder for device sync feature
 */
export function getSyncStatus(): {
  lastSync: Date | null;
  deviceCount: number;
  syncEnabled: boolean;
} {
  return {
    lastSync: null,
    deviceCount: 0,
    syncEnabled: false
  };
}

/**
 * Trigger manual device sync
 * Placeholder for device sync feature
 */
export function syncDevicesNow(): Promise<void> {
  return Promise.resolve();
}
