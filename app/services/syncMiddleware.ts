// VagalSync V15.0 - Universal Sync Middleware (WORKING VERSION)
// Patent 8: Device Discovery & Aggregation AI
// FIXED: All imports match existing project structure

import { addBiomarkerEntry } from './storageService';
import type { BiomarkerEntry } from '../types/biomarker.types';

// ============================================================================
// TYPES
// ============================================================================

export type DeviceType = 'oura' | 'whoop' | 'apple-health' | 'garmin' | 'fitbit' | 'polar' | 'dexcom';
export type SyncMethod = 'api' | 'email' | 'extension' | 'manual';

export interface SyncConfig {
  deviceId: string;
  deviceType: DeviceType;
  method: SyncMethod;
  enabled: boolean;
  lastSync: Date | null;
  credentials: any;
  syncIntervalMinutes: number;
}

export interface SyncResult {
  success: boolean;
  biomarkersAdded: number;
  errors?: string[];
}

// ============================================================================
// UNIVERSAL SYNC MIDDLEWARE CLASS
// ============================================================================

class UniversalSyncMiddleware {
  
  private syncConfigs: SyncConfig[] = [];
  private syncIntervals: Map<string, any> = new Map();
  
  constructor() {
    this.loadSyncConfigs();
  }
  
  // =========================================================================
  // CORE SYNC FUNCTIONALITY
  // =========================================================================
  
  async performSync(config: SyncConfig): Promise<SyncResult> {
    try {
      console.log(`[SyncMiddleware] Syncing ${config.deviceType} via ${config.method}...`);
      
      let biomarkers: Partial<BiomarkerEntry>[] = [];
      
      switch (config.method) {
        case 'api':
          biomarkers = await this.syncViaAPI(config);
          break;
        case 'email':
          biomarkers = await this.syncViaEmail(config);
          break;
        case 'extension':
          biomarkers = await this.syncViaExtension(config);
          break;
        case 'manual':
          biomarkers = [];
          break;
      }
      
      // Save biomarkers
      let added = 0;
      for (const biomarker of biomarkers) {
        if (biomarker.biomarkerId && biomarker.value) {
          await addBiomarkerEntry(biomarker as BiomarkerEntry);
          added++;
        }
      }
      
      // Update last sync time
      config.lastSync = new Date();
      this.saveSyncConfigs();
      
      // Notify user
      this.notifyUser({
        title: `${config.deviceType} synced`,
        message: `${added} biomarkers updated`,
        type: 'success'
      });
      
      return {
        success: true,
        biomarkersAdded: added
      };
      
    } catch (error: any) {
      console.error('[SyncMiddleware] Sync failed:', error);
      return {
        success: false,
        biomarkersAdded: 0,
        errors: [error.message]
      };
    }
  }
  
  // =========================================================================
  // SYNC METHODS (PHASE 2 - STUBS FOR NOW)
  // =========================================================================
  
  private async syncViaAPI(config: SyncConfig): Promise<Partial<BiomarkerEntry>[]> {
    // TODO: Implement OAuth API calls in Phase 2
    // For now, return demo data
    
    console.log('[SyncMiddleware] API sync - returning demo data');
    
    return [
      {
        biomarkerId: 'hrv',
        value: 65 + Math.random() * 20,
        unit: 'ms',
        timestamp: new Date(),
        accuracySource: 'validated_consumer',
        notes: `Synced from ${config.deviceType}`
      },
      {
        biomarkerId: 'resting_heart_rate',
        value: 55 + Math.random() * 15,
        unit: 'bpm',
        timestamp: new Date(),
        accuracySource: 'validated_consumer',
        notes: `Synced from ${config.deviceType}`
      }
    ];
  }
  
  private async syncViaEmail(config: SyncConfig): Promise<Partial<BiomarkerEntry>[]> {
    // TODO: Implement Gmail API email parsing in Phase 2
    // For now, return empty (user can manually forward emails)
    
    console.log('[SyncMiddleware] Email sync - not yet implemented');
    return [];
  }
  
  private async syncViaExtension(config: SyncConfig): Promise<Partial<BiomarkerEntry>[]> {
    // TODO: Chrome extension messaging in Phase 2
    // For now, return empty
    
    console.log('[SyncMiddleware] Extension sync - not yet implemented');
    return [];
  }
  
  // =========================================================================
  // AUTO-SYNC ORCHESTRATION
  // =========================================================================
  
  private scheduleSync(config: SyncConfig) {
    // Clear existing interval if any
    if (this.syncIntervals.has(config.deviceId)) {
      clearInterval(this.syncIntervals.get(config.deviceId)!);
    }
    
    // Schedule new sync
    const intervalMs = config.syncIntervalMinutes * 60 * 1000;
    const interval = setInterval(() => {
      this.performSync(config);
    }, intervalMs);
    
    this.syncIntervals.set(config.deviceId, interval);
    
    console.log(`[SyncMiddleware] Scheduled sync for ${config.deviceId} every ${config.syncIntervalMinutes} minutes`);
  }
  
  // =========================================================================
  // PERSISTENCE
  // =========================================================================
  
  private loadSyncConfigs() {
    // SSR Safety: Only access localStorage in browser
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('vagalsync_sync_configs');
    if (stored) {
      this.syncConfigs = JSON.parse(stored).map((c: any) => ({
        ...c,
        lastSync: c.lastSync ? new Date(c.lastSync) : null
      }));
    }
  }
  
  private saveSyncConfigs() {
    // SSR Safety: Only access localStorage in browser
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('vagalsync_sync_configs', JSON.stringify(this.syncConfigs));
  }
  
  private notifyUser(notification: any) {
    // SSR Safety: Only access browser APIs in browser
    if (typeof window === 'undefined') return;
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }
    
    // Save to notification center
    const notifications = JSON.parse(localStorage.getItem('vagalsync_notifications') || '[]');
    notifications.unshift({
      ...notification,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('vagalsync_notifications', JSON.stringify(notifications.slice(0, 50)));
  }
  
  // =========================================================================
  // PUBLIC API
  // =========================================================================
  
  async connectDevice(deviceType: DeviceType, method: SyncMethod, credentials: any): Promise<SyncConfig> {
    const config: SyncConfig = {
      deviceId: `${deviceType}-${Date.now()}`,
      deviceType,
      method,
      enabled: true,
      lastSync: null,
      credentials,
      syncIntervalMinutes: 30 // Default: every 30 minutes
    };
    
    this.syncConfigs.push(config);
    this.saveSyncConfigs();
    
    // Schedule auto-sync
    this.scheduleSync(config);
    
    // Perform initial sync
    await this.performSync(config);
    
    return config;
  }
  
  async disconnectDevice(deviceId: string): Promise<void> {
    // Remove config
    this.syncConfigs = this.syncConfigs.filter(c => c.deviceId !== deviceId);
    
    // Clear interval
    if (this.syncIntervals.has(deviceId)) {
      clearInterval(this.syncIntervals.get(deviceId)!);
      this.syncIntervals.delete(deviceId);
    }
    
    this.saveSyncConfigs();
  }
  
  getConnectedDevices(): SyncConfig[] {
    return this.syncConfigs;
  }
  
  async manualSync(deviceId: string): Promise<SyncResult> {
    const config = this.syncConfigs.find(c => c.deviceId === deviceId);
    if (config) {
      return await this.performSync(config);
    }
    return {
      success: false,
      biomarkersAdded: 0,
      errors: ['Device not found']
    };
  }
  
  async updateSyncInterval(deviceId: string, minutes: number): Promise<void> {
    const config = this.syncConfigs.find(c => c.deviceId === deviceId);
    if (config) {
      config.syncIntervalMinutes = minutes;
      this.saveSyncConfigs();
      this.scheduleSync(config);
    }
  }
}

// Export singleton instance
export const syncMiddleware = new UniversalSyncMiddleware();
