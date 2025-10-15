/**
 * VagalSync V15.0 Ultimate - Marketplace Tab
 * Revenue Stream #10: Product Recommendations
 * 
 * Shows personalized product recommendations based on biomarker gaps
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  Filter,
  DollarSign,
  Sparkles,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import ProductCard from './ProductCard';
import type { ProductRecommendation } from '../../../lib/middleware/marketplaceEngine';
import { loadBiomarkerEntries } from '../../services/storageService';

// ============================================================================
// COMPONENT
// ============================================================================

export default function MarketplaceTab() {
  
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [totalGaps, setTotalGaps] = useState(0);
  const [estimatedImpact, setEstimatedImpact] = useState(0);
  
  // Filters
  const [priceRange, setPriceRange] = useState<'budget' | 'moderate' | 'premium'>('moderate');
  const [showOnlyInBudget, setShowOnlyInBudget] = useState(false);

  const userId = 'demo-user'; // TODO: Get from auth

  // ==========================================================================
  // LOAD RECOMMENDATIONS
  // ==========================================================================

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user's biomarker entries
      const entries = loadBiomarkerEntries();

      // Fetch recommendations from API
      const response = await fetch('/api/marketplace/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          entries,
          limit: 20,
          preferences: {
            priceRange,
            dietary: {
              vegan: false,
              glutenFree: false
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      
      setRecommendations(data.recommendations || []);
      setTotalGaps(data.totalGaps || 0);
      setEstimatedImpact(data.estimatedImpact || 0);

    } catch (err: any) {
      console.error('[MarketplaceTab] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // FILTERING
  // ==========================================================================

  const filteredRecommendations = showOnlyInBudget
    ? recommendations.filter(r => r.inBudget)
    : recommendations;

  const groupedByPriority = {
    critical: filteredRecommendations.filter(r => r.priority === 'critical'),
    high: filteredRecommendations.filter(r => r.priority === 'high'),
    medium: filteredRecommendations.filter(r => r.priority === 'medium'),
    low: filteredRecommendations.filter(r => r.priority === 'low')
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Marketplace</h1>
              <p className="text-purple-300">
                Personalized products to optimize your biomarkers
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mb-4" />
            <p className="text-purple-300">Analyzing your biomarkers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-300 mb-2">Error Loading Recommendations</h3>
                <p className="text-red-200 mb-4">{error}</p>
                <button
                  onClick={loadRecommendations}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Recommendations State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">All Biomarkers Optimal! 🎉</h2>
            <p className="text-purple-300 mb-6 max-w-md mx-auto">
              You don't have any biomarker deficiencies right now. Keep tracking to maintain your optimal health!
            </p>
            <button
              onClick={loadRecommendations}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Recommendations
            </button>
          </div>
        )}

        {/* Recommendations */}
        {!loading && !error && recommendations.length > 0 && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Biomarker Gaps */}
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Biomarker Gaps</h3>
                </div>
                <div className="text-4xl font-bold text-orange-400">{totalGaps}</div>
                <p className="text-sm text-orange-300 mt-1">
                  Biomarkers needing optimization
                </p>
              </div>

              {/* Potential Impact */}
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Potential Impact</h3>
                </div>
                <div className="text-4xl font-bold text-cyan-400">+{estimatedImpact}</div>
                <p className="text-sm text-cyan-300 mt-1">
                  myVagal Tone™ points
                </p>
              </div>

              {/* Products Found */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Recommendations</h3>
                </div>
                <div className="text-4xl font-bold text-purple-400">{recommendations.length}</div>
                <p className="text-sm text-purple-300 mt-1">
                  Products matched to your needs
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Filters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price Range */}
                <div>
                  <label className="text-sm text-purple-300 mb-2 block">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="budget">Budget ($0-$25)</option>
                    <option value="moderate">Moderate ($25-$75)</option>
                    <option value="premium">Premium ($75+)</option>
                  </select>
                </div>

                {/* Show Only In Budget */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showOnlyInBudget}
                    onChange={(e) => setShowOnlyInBudget(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-400"
                  />
                  <label className="text-sm text-purple-300">
                    Only show products in my budget
                  </label>
                </div>
              </div>

              <button
                onClick={loadRecommendations}
                className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Apply Filters
              </button>
            </div>

            {/* Product Grid by Priority */}
            {groupedByPriority.critical.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  🔴 Critical Priority
                  <span className="text-sm text-purple-300 font-normal">
                    ({groupedByPriority.critical.length} products)
                  </span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {groupedByPriority.critical.map(rec => (
                    <ProductCard
                      key={rec.product.id}
                      recommendation={rec}
                      userId={userId}
                      onPurchaseClick={(productId, network) => {
                        console.log('Purchase clicked:', productId, network);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedByPriority.high.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  🟠 High Priority
                  <span className="text-sm text-purple-300 font-normal">
                    ({groupedByPriority.high.length} products)
                  </span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {groupedByPriority.high.map(rec => (
                    <ProductCard
                      key={rec.product.id}
                      recommendation={rec}
                      userId={userId}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedByPriority.medium.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  🟡 Medium Priority
                  <span className="text-sm text-purple-300 font-normal">
                    ({groupedByPriority.medium.length} products)
                  </span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {groupedByPriority.medium.map(rec => (
                    <ProductCard
                      key={rec.product.id}
                      recommendation={rec}
                      userId={userId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Disclaimer */}
            <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <p className="text-xs text-purple-300 text-center">
                <DollarSign className="w-3 h-3 inline mr-1" />
                VagalSync may earn a small commission from purchases made through these links at no extra cost to you. 
                We only recommend products that genuinely support your biomarker optimization.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
