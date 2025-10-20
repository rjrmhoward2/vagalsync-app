/**
 * VagalSync V15.0 Ultimate - Biomarker Tab Component (MIDDLEWARE ENHANCED)
 * 
 * Main orchestrator component for biomarker tracking.
 * NOW WITH AUTOMATIC DEVICE SYNC VIA MIDDLEWARE!
 * 
 * Changes from original:
 * - loadData() now async and uses loadBiomarkerEntriesWithDevices()
 * - Added sync button to manually trigger device sync
 * - Shows device sync status in header
 * - Auto-refreshes every 5 minutes to catch new device data
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  Plus,
  Download,
  Search,
  Filter,
  RefreshCw,
  Wifi
} from 'lucide-react';

import {
  BiomarkerCategory,
  BiomarkerDefinition,
  BiomarkerEntry,
  MyVagalToneScore
} from '../../types/biomarker.types';

import {
  BIOMARKER_DATABASE,
  getBiomarkersByCategory,
  getAllCategories,
  getCategoryInfo
} from '../../utils/biomarkerDatabase';

import {
  loadBiomarkerEntriesWithDevices,  // NEW: Enhanced loader
  getCurrentMyVagalTone,
  getEntriesForBiomarker,
  downloadExport,
  getSyncStatus,                     // NEW: Sync status
  syncDevicesNow                     // NEW: Manual sync
} from '../../services/storageService';

import BiomarkerEntryModal from './BiomarkerEntryModal';
import TrendChart from './TrendChart';
import AIInsightsPanel from './AIInsightsPanel';

// For Supabase auth (if using)
// import { supabase } from '@/lib/supabase';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BiomarkerTab() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<BiomarkerCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<BiomarkerEntry[]>([]);
  const [myVagalTone, setMyVagalTone] = useState<MyVagalToneScore | null>(null);

  // Modal states
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerDefinition | null>(null);
  const [trendModalOpen, setTrendModalOpen] = useState(false);
  const [trendBiomarker, setTrendBiomarker] = useState<BiomarkerDefinition | null>(null);

  // NEW: Sync states
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [deviceCount, setDeviceCount] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load data on mount and after changes
  const loadData = async () => {
    setIsLoading(true);
    setSyncError(null);

    try {
      // Get user ID from Supabase auth (or use demo-user)
      let userId = 'demo-user';

      // Uncomment if using Supabase auth:
      // const { data: { user } } = await supabase.auth.getUser();
      // userId = user?.id || 'demo-user';

      console.log('[BiomarkerTab] Loading data for user:', userId);

      // NEW: Load from BOTH manual entry AND devices
      const loadedEntries = loadBiomarkerEntriesWithDevices();
      setEntries(loadedEntries);

      console.log('[BiomarkerTab] Loaded entries:', {
        total: loadedEntries.length,
        manual: loadedEntries.filter(e => !e.notes?.includes('Auto-synced')).length,
        device: loadedEntries.filter(e => e.notes?.includes('Auto-synced')).length
      });

      // Calculate myVagal Tone from all entries
      const score = getCurrentMyVagalTone();
      setMyVagalTone(score);

      // NEW: Get sync status
      const status = getSyncStatus();
      setLastSync(status.lastSync);
      setDeviceCount(status.deviceCount);

    } catch (error) {
      console.error('[BiomarkerTab] Failed to load data:', error);
      setSyncError('Failed to load biomarker data');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Manual sync function
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      let userId = 'demo-user';

      // Uncomment if using Supabase auth:
      // const { data: { user } } = await supabase.auth.getUser();
      // userId = user?.id || 'demo-user';

      console.log('[BiomarkerTab] Manually syncing devices...');

      await syncDevicesNow();

      console.log('[BiomarkerTab] Sync complete');

      // Reload data to show new entries
      await loadData();

      // Show success message
      alert('✅ Device sync complete!');

    } catch (error) {
      console.error('[BiomarkerTab] Sync failed:', error);
      setSyncError('Device sync failed. Please try again.');
      alert('❌ Device sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // NEW: Auto-refresh every 5 minutes to catch new device data
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[BiomarkerTab] Auto-refreshing device data...');
      loadData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Filter biomarkers
  const filteredBiomarkers = BIOMARKER_DATABASE.filter(biomarker => {
    const matchesCategory = selectedCategory === 'all' || biomarker.category === selectedCategory;
    const matchesSearch = biomarker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biomarker.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle opening entry modal
  const handleAddData = (biomarker: BiomarkerDefinition) => {
    console.log('[BiomarkerTab] Opening modal for:', biomarker.name);
    setSelectedBiomarker(biomarker);
    setEntryModalOpen(true);
  };

  // Handle closing entry modal
  const handleCloseEntryModal = () => {
    setEntryModalOpen(false);
    setSelectedBiomarker(null);
  };

  // Handle save from entry modal
  const handleSaveEntry = () => {
    loadData(); // Reload data after save
    handleCloseEntryModal();
  };

  // Handle opening trend chart
  const handleViewTrend = (biomarker: BiomarkerDefinition) => {
    setTrendBiomarker(biomarker);
    setTrendModalOpen(true);
  };

  // Handle closing trend chart
  const handleCloseTrendModal = () => {
    setTrendModalOpen(false);
    setTrendBiomarker(null);
  };

  // Get category counts
  const getCategoryCount = (category: BiomarkerCategory): number => {
    return BIOMARKER_DATABASE.filter(b => b.category === category).length;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Biomarker Tracking</h1>
            <p className="text-purple-200">Track 24 biomarkers across 6 categories</p>
          </div>

          {/* myVagal Tone Score + Sync Status */}
          <div className="flex gap-4">
            {/* Sync Status */}
            {deviceCount > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Wifi className={`w-5 h-5 ${deviceCount > 0 ? 'text-green-400' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-xs text-purple-200">Connected Devices</div>
                    <div className="text-lg font-bold text-white">{deviceCount}</div>
                    {lastSync && (
                      <div className="text-xs text-purple-300">
                        Synced {formatTimeSince(lastSync)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Sync devices now"
                  >
                    <RefreshCw className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* myVagal Tone Score */}
            {myVagalTone && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <Activity className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-sm text-purple-200">myVagal Tone™</div>
                    <div className="text-3xl font-bold text-white">{myVagalTone.score}</div>
                    <div className="text-xs text-purple-300">{myVagalTone.biomarkerCount} biomarkers tracked</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sync Error */}
        {syncError && (
          <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-red-300">
            ⚠️ {syncError}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-white">Loading biomarker data from devices...</p>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter by Category
          </h3>

          <div className="flex flex-wrap gap-3">
            {/* All Categories */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
            >
              All (24)
            </button>

            {/* Individual Categories */}
            {getAllCategories().map(category => {
              const info = getCategoryInfo(category);
              const count = getCategoryCount(category);

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedCategory === category
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.name}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search biomarkers..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Biomarker Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBiomarkers.map(biomarker => {
            const biomarkerEntries = getEntriesForBiomarker(biomarker.id);
            const latestEntry = biomarkerEntries[0];
            const hasData = biomarkerEntries.length > 0;
            const isAutoSynced = latestEntry?.notes?.includes('Auto-synced');

            return (
              <div
                key={biomarker.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{biomarker.icon || '📊'}</div>
                    <div>
                      <h3 className="text-white font-semibold">{biomarker.name}</h3>
                      <p className="text-sm text-purple-300 capitalize">
                        {biomarker.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Add Data Button */}
                  <button
                    onClick={() => handleAddData(biomarker)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg transition-colors"
                    title="Add Data"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Current Value */}
                <div className="mb-4">
                  {hasData ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-2xl font-bold text-white">
                          {latestEntry.value} {biomarker.unit}
                        </div>
                        {/* NEW: Show if auto-synced from device */}
                        {isAutoSynced && (
                          <div className="flex items-center gap-1 text-xs text-cyan-400">
                            <Wifi className="w-3 h-3" />
                            <span>Auto</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-sm ${latestEntry.inOptimalRange ? 'text-green-400' : 'text-orange-400'}`}>
                        {latestEntry.inOptimalRange ? '✓ Optimal' : '⚠ Suboptimal'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-purple-300">No data yet</div>
                  )}
                </div>

                {/* Target Range */}
                <div className="text-sm text-purple-200 mb-4">
                  <span className="font-medium">Target:</span> {biomarker.optimalRange} {biomarker.unit}
                </div>

                {/* Description */}
                <p className="text-sm text-purple-200 mb-4">{biomarker.description}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddData(biomarker)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    Add Data
                  </button>

                  {hasData && (
                    <button
                      onClick={() => handleViewTrend(biomarker)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Trends
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      {entries.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8">
          <button
            onClick={() => downloadExport('json')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Data ({entries.length} entries)
          </button>
        </div>
      )}

      {/* MODALS */}

      {/* Entry Modal */}
      {entryModalOpen && selectedBiomarker && (
        <BiomarkerEntryModal
          biomarker={selectedBiomarker}
          onClose={handleCloseEntryModal}
          onSave={handleSaveEntry}
        />
      )}

      {/* Trend Chart Modal */}
      {trendModalOpen && trendBiomarker && (
        <TrendChart
          biomarker={trendBiomarker}
          entries={getEntriesForBiomarker(trendBiomarker.id)}
          onClose={handleCloseTrendModal}
        />
      )}

      {/* AI Insights Panel */}
      {entries.length > 0 && (
        <AIInsightsPanel entries={entries} />
      )}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format time since last sync
 */
function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
