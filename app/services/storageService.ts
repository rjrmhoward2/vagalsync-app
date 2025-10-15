/**
 * VagalSync V15.0 Ultimate - Storage Service (MIDDLEWARE INTEGRATED)
 * 
 * This file handles all data persistence for biomarker entries.
 * 
 * PHASE 1: Uses localStorage (browser storage)
 * PHASE 2: Ready for API integration (same interface, different implementation)
 * 
 * NEW in V15.0: Middleware integration for automatic device data aggregation
 * 
 * Features:
 * - Save/load biomarker entries
 * - Automatic myVagal Tone calculation on save
 * - Export data (JSON/CSV)
 * - Import data validation
 * - Error handling for storage failures
 * - NEW: Device aggregation via middleware
 * - NEW: Intelligent merging of manual and device data
 * - NEW: Sync status tracking
 */

import { supabase } from '@/lib/supabase';
import { 
  BiomarkerEntry, 
  MyVagalToneScore,
  BiomarkerExport 
} from '../types/biomarker.types';
import { calculateMyVagalTone, isInOptimalRange } from '../utils/calculations';
import { getBiomarkerById } from '../utils/biomarkerDatabase';
import { validateBiomarkerEntry } from '../utils/validators';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  ENTRIES: 'vagalsync_biomarker_entries',
  SCORES: 'vagalsync_myvagaltone_scores',
  VERSION: 'vagalsync_version'
} as const;

const CURRENT_VERSION = '15.0.0-ULTIMATE';

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error for storage failures
 */
export class StorageError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Handle storage quota exceeded errors
 */
function handleQuotaExceeded(): never {
  throw new StorageError(
    'Storage quota exceeded. Please export your data and clear old entries to free up space.'
  );
}

/**
 * Generate unique ID for entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// LOW-LEVEL STORAGE OPERATIONS
// ============================================================================

/**
 * Save biomarker entries to localStorage
 */
function saveBiomarkerEntries(entries: BiomarkerEntry[]): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const data = JSON.stringify(entries);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, data);
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      handleQuotaExceeded();
    }
    throw new StorageError('Failed to save biomarker entries', error);
  }
}

/**
 * Load biomarker entries from localStorage
 */
export function loadBiomarkerEntries(): BiomarkerEntry[] {
  if (!isLocalStorageAvailable()) {
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
 * Save myVagal Tone scores to localStorage
 */
function saveMyVagalToneScores(scores: MyVagalToneScore[]): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const data = JSON.stringify(scores);
    localStorage.setItem(STORAGE_KEYS.SCORES, data);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      handleQuotaExceeded();
    }
    throw new StorageError('Failed to save myVagal Tone scores', error);
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
  const impactBreakdown = newScore.breakdown.find(b => b.biomarkerId === entry.biomarkerId);
  if (impactBreakdown) {
    completeEntry.impact = impactBreakdown.weightedImpact;
  }

  // Save everything
  saveBiomarkerEntries(entries);
  
  const scores = loadMyVagalToneScores();
  scores.push(newScore);
  saveMyVagalToneScores(scores);

  return completeEntry;
}

/**
 * Update an existing biomarker entry
 * 
 * @param entryId - ID of entry to update
 * @param updates - Fields to update
 */
export function updateBiomarkerEntry(
  entryId: string,
  updates: Partial<Omit<BiomarkerEntry, 'id' | 'biomarkerId'>>
): void {
  const entries = loadBiomarkerEntries();
  const entryIndex = entries.findIndex(e => e.id === entryId);

  if (entryIndex === -1) {
    throw new Error(`Entry not found: ${entryId}`);
  }

  // Update the entry
  const updatedEntry = {
    ...entries[entryIndex],
    ...updates
  };

  // Recalculate if in optimal range if value changed
  if (updates.value !== undefined) {
    const biomarker = getBiomarkerById(updatedEntry.biomarkerId);
    if (biomarker) {
      updatedEntry.inOptimalRange = isInOptimalRange(updatedEntry.value, biomarker.optimalRange);
    }
  }

  entries[entryIndex] = updatedEntry;

  // Recalculate myVagal Tone
  const newScore = calculateMyVagalTone(entries);
  
  // Update impact
  const impactBreakdown = newScore.breakdown.find(b => b.biomarkerId === updatedEntry.biomarkerId);
  if (impactBreakdown) {
    updatedEntry.impact = impactBreakdown.weightedImpact;
    entries[entryIndex] = updatedEntry;
  }

  // Save
  saveBiomarkerEntries(entries);
  
  const scores = loadMyVagalToneScores();
  scores.push(newScore);
  saveMyVagalToneScores(scores);
}

/**
 * Delete a biomarker entry
 * 
 * @param entryId - ID of entry to delete
 */
export function deleteBiomarkerEntry(entryId: string): void {
  const entries = loadBiomarkerEntries();
  const filteredEntries = entries.filter(e => e.id !== entryId);

  if (filteredEntries.length === entries.length) {
    throw new Error(`Entry not found: ${entryId}`);
  }

  saveBiomarkerEntries(filteredEntries);

  // Recalculate myVagal Tone without the deleted entry
  if (filteredEntries.length > 0) {
    const newScore = calculateMyVagalTone(filteredEntries);
    const scores = loadMyVagalToneScores();
    scores.push(newScore);
    saveMyVagalToneScores(scores);
  }
}

/**
 * Get all entries for a specific biomarker
 * 
 * @param biomarkerId - Biomarker ID
 * @returns Array of entries for that biomarker, sorted by date (newest first)
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
// NEW: MIDDLEWARE INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Load biomarker entries from BOTH manual entry AND connected devices
 * 
 * This is the enhanced version of loadBiomarkerEntries() that includes
 * automatic device aggregation via middleware.
 * 
 * INTELLIGENT MERGING:
 * - Manual entries always take priority
 * - Device entries fill in gaps
 * - No duplicates (same biomarker on same day)
 * 
 * @param userId - User ID (from Supabase auth or 'demo-user')
 * @returns Combined array of manual and device biomarker entries
 */
export async function loadBiomarkerEntriesWithDevices(
  userId: string = 'demo-user'
): Promise<BiomarkerEntry[]> {
  
  // Step 1: Load manual entries (existing functionality)
  const manualEntries = loadBiomarkerEntries();
  console.log(`[Storage] Loaded ${manualEntries.length} manual entries`);
  
  // Step 2: Load from devices via middleware (new functionality)
  let deviceEntries: BiomarkerEntry[] = [];
  
  try {
    console.log('[Storage] Fetching device data via middleware...');
    
    const response = await fetch('/api/middleware/aggregate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        userId, 
        sources: ['demo'],  // Phase 1: demo data, Phase 2: ['apple_health', 'oura', etc.]
        includeDemo: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Middleware API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Middleware returns complete BiomarkerEntry objects
    deviceEntries = data.biomarkerEntries || [];
    
    console.log(`[Storage] Loaded ${deviceEntries.length} device entries from ${data.sources?.length || 0} sources`);
    
    // Log any device errors
    if (data.errors && data.errors.length > 0) {
      console.warn('[Storage] Device sync errors:', data.errors);
    }
    
  } catch (error) {
    console.error('[Storage] Failed to load device data:', error);
    // Don't fail the entire load - just proceed with manual entries only
  }
  
  // Step 3: Intelligently merge manual and device entries
  const merged = mergeBiomarkerEntries(manualEntries, deviceEntries);
  
  console.log(`[Storage] Final merged total: ${merged.length} entries`);
  
  return merged;
}

/**
 * Intelligently merge manual and device biomarker entries
 * 
 * RULES:
 * 1. Manual entries ALWAYS win (user explicitly entered)
 * 2. Device entries fill in gaps (biomarkers not manually entered)
 * 3. For same biomarker on same day: prefer manual, discard device duplicate
 * 4. Maintain chronological order
 * 
 * @param manualEntries - Entries from user input
 * @param deviceEntries - Entries from device sync
 * @returns Merged array with no duplicates
 */
function mergeBiomarkerEntries(
  manualEntries: BiomarkerEntry[],
  deviceEntries: BiomarkerEntry[]
): BiomarkerEntry[] {
  
  // Start with all manual entries
  const merged = [...manualEntries];
  
  // Track which biomarker + date combinations we already have from manual
  const manualKeys = new Set(
    manualEntries.map(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      return `${entry.biomarkerId}:${dateKey}`;
    })
  );
  
  // Add device entries that don't conflict with manual entries
  deviceEntries.forEach(deviceEntry => {
    const date = new Date(deviceEntry.timestamp);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const key = `${deviceEntry.biomarkerId}:${dateKey}`;
    
    // Only add if we don't have a manual entry for this biomarker on this day
    if (!manualKeys.has(key)) {
      merged.push(deviceEntry);
      
      // Mark as added to prevent future duplicates
      manualKeys.add(key);
    } else {
      console.log(`[Storage] Skipping device duplicate: ${deviceEntry.biomarkerId} on ${dateKey}`);
    }
  });
  
  // Sort by timestamp (most recent first)
  merged.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return merged;
}

/**
 * Get list of devices currently connected for a user
 * 
 * @param userId - User ID
 * @returns Array of connected device sources
 */
export async function getConnectedDevices(userId: string = 'demo-user'): Promise<any[]> {
  try {
    const response = await fetch(`/api/middleware/aggregate?userId=${userId}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get devices: ${response.status}`);
    }
    
    const data = await response.json();
    return data.devices || [];
    
  } catch (error) {
    console.error('[Storage] Failed to get connected devices:', error);
    return [];
  }
}

/**
 * Manually trigger device sync
 * Useful for "refresh" buttons or on-demand syncing
 * 
 * @param userId - User ID
 * @returns Number of new entries synced
 */
export async function syncDevicesNow(userId: string = 'demo-user'): Promise<number> {
  try {
    const beforeCount = loadBiomarkerEntries().length;
    
    // Force fresh device data fetch
    const response = await fetch('/api/middleware/aggregate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        sources: ['demo'],
        includeDemo: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    
    const data = await response.json();
    const deviceEntries = data.biomarkerEntries || [];
    
    // Merge with existing manual entries
    const manualEntries = loadBiomarkerEntries();
    const merged = mergeBiomarkerEntries(manualEntries, deviceEntries);
    
    // Calculate how many new entries were added
    const newCount = merged.length - beforeCount;
    
    console.log(`[Storage] Sync complete: ${newCount} new entries`);
    
    return newCount;
    
  } catch (error) {
    console.error('[Storage] Sync failed:', error);
    throw error;
  }
}

/**
 * Get last sync status for all devices
 * 
 * @param userId - User ID
 * @returns Sync status info
 */
export async function getSyncStatus(userId: string = 'demo-user'): Promise<{
  lastSync: Date | null;
  deviceCount: number;
  entryCount: number;
  errors: any[];
}> {
  try {
    const devices = await getConnectedDevices(userId);
    const entries = await loadBiomarkerEntriesWithDevices(userId);
    
    // Find most recent device sync
    const lastSyncTimes = devices
      .filter(d => d.lastSync)
      .map(d => new Date(d.lastSync).getTime());
    
    const lastSync = lastSyncTimes.length > 0
      ? new Date(Math.max(...lastSyncTimes))
      : null;
    
    // Count device-sourced entries (have auto-sync note)
    const deviceEntryCount = entries.filter(e => 
      e.notes?.includes('Auto-synced')
    ).length;
    
    return {
      lastSync,
      deviceCount: devices.length,
      entryCount: deviceEntryCount,
      errors: []  // TODO: Track sync errors
    };
    
  } catch (error) {
    console.error('[Storage] Failed to get sync status:', error);
    return {
      lastSync: null,
      deviceCount: 0,
      entryCount: 0,
      errors: [error]
    };
  }
}

/**
 * Get detailed storage statistics
 * Shows breakdown of manual vs device entries
 */
export async function getStorageStats(userId: string = 'demo-user'): Promise<{
  totalEntries: number;
  manualEntries: number;
  deviceEntries: number;
  biomarkersTracked: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  const allEntries = await loadBiomarkerEntriesWithDevices(userId);
  
  const manualCount = allEntries.filter(e => 
    !e.notes?.includes('Auto-synced')
  ).length;
  
  const deviceCount = allEntries.filter(e => 
    e.notes?.includes('Auto-synced')
  ).length;
  
  const uniqueBiomarkers = new Set(allEntries.map(e => e.biomarkerId));
  
  const timestamps = allEntries.map(e => new Date(e.timestamp).getTime());
  
  return {
    totalEntries: allEntries.length,
    manualEntries: manualCount,
    deviceEntries: deviceCount,
    biomarkersTracked: uniqueBiomarkers.size,
    oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
    newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
  };
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
      entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : ''
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

/**
 * Clear all biomarker data
 * USE WITH CAUTION - this is permanent!
 */
export function clearAllData(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.ENTRIES);
  localStorage.removeItem(STORAGE_KEYS.SCORES);
}
