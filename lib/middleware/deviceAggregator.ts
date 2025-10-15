/**
 * VagalSync V15.0 Ultimate - Device Aggregation Middleware
 * Patent #8: Device Discovery AI
 * 
 * Aggregates data from multiple health devices into unified biomarker format.
 * 
 * PHASE 1: Demo mode (returns simulated device data)
 * PHASE 2: Real API integrations (Apple Health, Oura, Whoop, etc.)
 * 
 * NO NFTs, NO TOKENS, NO BLOCKCHAIN - Pure SaaS Infrastructure
 */

// OPTION 1: If @/ alias works in your tsconfig.json
// import { BiomarkerEntry, AccuracySource } from '@/types/biomarker.types';
// import { getBiomarkerById } from '@/utils/biomarkerDatabase';
// import { isInOptimalRange } from '@/utils/calculations';

// OPTION 2: Relative imports from lib/middleware/ to app/
import { BiomarkerEntry, AccuracySource } from '../../app/types/biomarker.types';
import { getBiomarkerById } from '../../app/utils/biomarkerDatabase';
import { isInOptimalRange } from '../../app/utils/calculations';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a connected device/data source
 */
export interface DeviceSource {
  id: string;                          // Unique device identifier
  name: string;                        // Display name (e.g., "Apple Watch Series 9")
  type: 'wearable' | 'cgm' | 'lab' | 'medical' | 'consumer';
  accuracySource: AccuracySource;      // Accuracy classification for Patent #3
  connected: boolean;                  // Connection status
  lastSync?: Date;                     // When last synced
  apiEndpoint?: string;                // API endpoint for real integrations
  credentials?: any;                   // OAuth tokens (encrypted in real impl)
}

/**
 * Aggregated health data from all sources
 */
export interface AggregatedHealthData {
  biomarkerEntries: Partial<BiomarkerEntry>[];  // Biomarker measurements
  lastSync: Date;                                // When aggregation occurred
  sources: DeviceSource[];                       // Connected sources
  errors?: DeviceError[];                        // Any sync errors
}

/**
 * Device sync error
 */
export interface DeviceError {
  sourceId: string;
  sourceName: string;
  error: string;
  timestamp: Date;
}

/**
 * Configuration for device aggregation
 */
export interface AggregationConfig {
  userId: string;                      // User to aggregate for
  sources: string[];                   // Which sources to aggregate from
  timeRange?: {                        // Optional time range filter
    start: Date;
    end: Date;
  };
  includeDemo?: boolean;               // Whether to include demo data
}

// ============================================================================
// MAIN AGGREGATION FUNCTION
// ============================================================================

/**
 * Aggregate health data from all connected devices
 * 
 * PHASE 1: Returns demo data to prove concept
 * PHASE 2: Fetches from real APIs (Apple Health, Oura, Whoop, labs)
 * 
 * @param config - Aggregation configuration
 * @returns Aggregated biomarker data from all sources
 */
export async function aggregateDeviceData(
  config: AggregationConfig
): Promise<AggregatedHealthData> {
  
  const { userId, sources, includeDemo = true } = config;
  
  // PHASE 1: Demo mode (enabled by default)
  if (includeDemo || sources.includes('demo')) {
    console.log('[Middleware] Using demo device data');
    return getDemoDeviceData(userId);
  }
  
  // PHASE 2: Real device aggregation
  const entries: Partial<BiomarkerEntry>[] = [];
  const connectedSources: DeviceSource[] = [];
  const errors: DeviceError[] = [];
  
  // Aggregate from each requested source
  for (const sourceId of sources) {
    try {
      const sourceData = await fetchFromSource(sourceId, userId, config.timeRange);
      if (sourceData) {
        entries.push(...sourceData.biomarkers);
        connectedSources.push(sourceData.source);
      }
    } catch (error: any) {
      console.error(`[Middleware] Error fetching from ${sourceId}:`, error);
      errors.push({
        sourceId,
        sourceName: sourceId,
        error: error.message,
        timestamp: new Date()
      });
    }
  }
  
  return {
    biomarkerEntries: entries,
    lastSync: new Date(),
    sources: connectedSources,
    errors: errors.length > 0 ? errors : undefined
  };
}

// ============================================================================
// SOURCE-SPECIFIC FETCHERS (PHASE 2 STUBS)
// ============================================================================

/**
 * Route aggregation request to appropriate source handler
 */
async function fetchFromSource(
  sourceId: string,
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource } | null> {
  
  switch (sourceId) {
    case 'apple_health':
      return await fetchAppleHealthData(userId, timeRange);
    
    case 'oura':
      return await fetchOuraData(userId, timeRange);
    
    case 'whoop':
      return await fetchWhoopData(userId, timeRange);
    
    case 'dexcom':
      return await fetchDexcomData(userId, timeRange);
    
    case 'freestyle_libre':
      return await fetchFreestyleLibreData(userId, timeRange);
    
    case 'quest_diagnostics':
      return await fetchQuestLabData(userId, timeRange);
    
    case 'labcorp':
      return await fetchLabCorpData(userId, timeRange);
    
    default:
      console.warn(`[Middleware] Unknown source: ${sourceId}`);
      return null;
  }
}

/**
 * Apple Health integration (PHASE 2 STUB)
 */
async function fetchAppleHealthData(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource }> {
  throw new Error('Apple Health integration not yet implemented. Coming in Phase 2!');
}

/**
 * Oura Ring integration (PHASE 2 STUB)
 */
async function fetchOuraData(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource }> {
  throw new Error('Oura Ring integration not yet implemented. Coming in Phase 2!');
}

/**
 * Whoop integration (PHASE 2 STUB)
 */
async function fetchWhoopData(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource }> {
  throw new Error('Whoop integration not yet implemented. Coming in Phase 2!');
}

/**
 * Dexcom G7 CGM integration (PHASE 2 STUB)
 */
async function fetchDexcomData(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource }> {
  throw new Error('Dexcom integration not yet implemented. Coming in Phase 2!');
}

/**
 * FreeStyle Libre CGM integration (PHASE 2 STUB)
 */
async function fetchFreestyleLibreData(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource }> {
  throw new Error('FreeStyle Libre integration not yet implemented. Coming in Phase 2!');
}

/**
 * Quest Diagnostics lab integration (PHASE 2 STUB)
 */
async function fetchQuestLabData(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource }> {
  throw new Error('Quest Diagnostics integration not yet implemented. Coming in Phase 2!');
}

/**
 * LabCorp lab integration (PHASE 2 STUB)
 */
async function fetchLabCorpData(
  userId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{ biomarkers: Partial<BiomarkerEntry>[]; source: DeviceSource }> {
  throw new Error('LabCorp integration not yet implemented. Coming in Phase 2!');
}

// ============================================================================
// PHASE 1: DEMO DATA GENERATOR
// ============================================================================

/**
 * Generate realistic demo device data
 * Shows what the middleware will deliver once real APIs are integrated
 */
function getDemoDeviceData(userId: string): AggregatedHealthData {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Generate demo biomarker values (slightly randomized but in optimal ranges)
  const demoEntries: Partial<BiomarkerEntry>[] = [
    // From wearable device (this morning)
    {
      biomarkerId: 'cortisol_am',
      value: 11 + Math.random() * 4,
      unit: 'μg/dL',
      timestamp: new Date(now.setHours(8, 0, 0, 0)),
      accuracySource: 'validated_consumer',
      notes: '🔄 Auto-synced from wearable device'
    },
    
    // From CGM device (yesterday)
    {
      biomarkerId: 'fasting_glucose',
      value: 78 + Math.random() * 10,
      unit: 'mg/dL',
      timestamp: yesterday,
      accuracySource: 'medical_device',
      notes: '🔄 Auto-synced from CGM'
    },
    
    // From lab results (last week)
    {
      biomarkerId: 'vitamin_d',
      value: 52 + Math.random() * 25,
      unit: 'ng/mL',
      timestamp: lastWeek,
      accuracySource: 'laboratory',
      notes: '🔄 Auto-synced from lab results'
    },
    
    {
      biomarkerId: 'crp',
      value: 0.3 + Math.random() * 0.5,
      unit: 'mg/L',
      timestamp: lastWeek,
      accuracySource: 'laboratory',
      notes: '🔄 Auto-synced from lab results'
    },
    
    {
      biomarkerId: 'hba1c',
      value: 5.0 + Math.random() * 0.3,
      unit: '%',
      timestamp: lastWeek,
      accuracySource: 'laboratory',
      notes: '🔄 Auto-synced from lab results'
    },
    
    {
      biomarkerId: 'hdl',
      value: 55 + Math.random() * 30,
      unit: 'mg/dL',
      timestamp: lastWeek,
      accuracySource: 'laboratory',
      notes: '🔄 Auto-synced from lab results'
    },
    
    {
      biomarkerId: 'magnesium',
      value: 5.7 + Math.random() * 0.6,
      unit: 'mg/dL',
      timestamp: lastWeek,
      accuracySource: 'laboratory',
      notes: '🔄 Auto-synced from lab results'
    }
  ];
  
  // Demo connected devices
  const demoSources: DeviceSource[] = [
    {
      id: 'demo_wearable',
      name: 'Demo Smart Watch',
      type: 'wearable',
      accuracySource: 'validated_consumer',
      connected: true,
      lastSync: now
    },
    {
      id: 'demo_cgm',
      name: 'Demo CGM Sensor',
      type: 'cgm',
      accuracySource: 'medical_device',
      connected: true,
      lastSync: yesterday
    },
    {
      id: 'demo_lab',
      name: 'Demo Lab Results',
      type: 'lab',
      accuracySource: 'laboratory',
      connected: true,
      lastSync: lastWeek
    }
  ];
  
  return {
    biomarkerEntries: demoEntries,
    lastSync: now,
    sources: demoSources
  };
}

// ============================================================================
// DATA NORMALIZATION (PHASE 2)
// ============================================================================

/**
 * Normalize device-specific data to VagalSync biomarker format
 */
export function normalizeDeviceData(
  rawData: any,
  sourceType: string
): Partial<BiomarkerEntry>[] {
  
  switch (sourceType) {
    case 'apple_health':
      return normalizeAppleHealthData(rawData);
    
    case 'oura':
      return normalizeOuraData(rawData);
    
    case 'whoop':
      return normalizeWhoopData(rawData);
    
    case 'dexcom':
      return normalizeDexcomData(rawData);
    
    default:
      console.warn(`[Middleware] No normalizer for source: ${sourceType}`);
      return [];
  }
}

function normalizeAppleHealthData(data: any): Partial<BiomarkerEntry>[] {
  return [];
}

function normalizeOuraData(data: any): Partial<BiomarkerEntry>[] {
  return [];
}

function normalizeWhoopData(data: any): Partial<BiomarkerEntry>[] {
  return [];
}

function normalizeDexcomData(data: any): Partial<BiomarkerEntry>[] {
  return [];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a device source is currently connected
 */
export async function checkDeviceConnection(
  sourceId: string,
  userId: string
): Promise<boolean> {
  return sourceId.startsWith('demo_');
}

/**
 * Get list of available device sources for a user
 */
export async function getAvailableDevices(userId: string): Promise<DeviceSource[]> {
  return [
    {
      id: 'demo_wearable',
      name: 'Demo Smart Watch',
      type: 'wearable',
      accuracySource: 'validated_consumer',
      connected: true
    },
    {
      id: 'demo_cgm',
      name: 'Demo CGM',
      type: 'cgm',
      accuracySource: 'medical_device',
      connected: true
    },
    {
      id: 'demo_lab',
      name: 'Demo Lab Results',
      type: 'lab',
      accuracySource: 'laboratory',
      connected: true
    }
  ];
}

/**
 * Convert partial biomarker entries to complete entries
 */
export function completeBiomarkerEntries(
  partialEntries: Partial<BiomarkerEntry>[]
): BiomarkerEntry[] {
  
  return partialEntries
    .filter(entry => entry.biomarkerId && entry.value !== undefined)
    .map(entry => {
      const biomarker = getBiomarkerById(entry.biomarkerId!);
      if (!biomarker) return null;
      
      const inOptimalRange = isInOptimalRange(
        entry.value!,
        biomarker.optimalRange
      );
      
      return {
        id: entry.id || `device-${entry.biomarkerId}-${Date.now()}-${Math.random()}`,
        biomarkerId: entry.biomarkerId!,
        value: entry.value!,
        unit: entry.unit || biomarker.unit,
        timestamp: entry.timestamp || new Date(),
        accuracySource: entry.accuracySource || 'standard_consumer',
        notes: entry.notes,
        inOptimalRange,
        impact: 0
      } as BiomarkerEntry;
    })
    .filter((entry): entry is BiomarkerEntry => entry !== null);
}
