/**
 * VagalSync V15.0 Ultimate - Product Card Component
 * 
 * Displays product recommendations with:
 * - Product details
 * - Effectiveness score
 * - Affiliate link buttons
 * - Click tracking
 */

'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  ExternalLink, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  Award
} from 'lucide-react';
import type { 
  ProductRecommendation,
  MarketplaceProduct 
} from '../../../lib/middleware/marketplaceEngine';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface ProductCardProps {
  recommendation: ProductRecommendation;
  userId: string;
  onPurchaseClick?: (productId: string, network: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProductCard({
  recommendation,
  userId,
  onPurchaseClick
}: ProductCardProps) {
  
  const { product, score, reasoning, priority, biomarkerGaps } = recommendation;
  const [tracking, setTracking] = useState(false);

  // ==========================================================================
  // AFFILIATE LINK CLICK HANDLER
  // ==========================================================================

  const handleAffiliateClick = async (
    network: 'amazon' | 'thorne' | 'fullscript' | 'direct'
  ) => {
    const affiliateLink = product.affiliateLinks[network];
    if (!affiliateLink) return;

    setTracking(true);

    try {
      // Track the click
      const response = await fetch('/api/marketplace/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: product.id,
          network,
          redirectUrl: affiliateLink
        })
      });

      const data = await response.json();
      
      if (data.tracked) {
        console.log('[ProductCard] Click tracked:', data.clickId);
        
        // Open affiliate link in new tab
        window.open(affiliateLink, '_blank');
        
        // Callback
        onPurchaseClick?.(product.id, network);
      }

    } catch (error) {
      console.error('[ProductCard] Track error:', error);
      // Still open link even if tracking fails
      window.open(affiliateLink, '_blank');
    } finally {
      setTracking(false);
    }
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const getPriorityColor = () => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-400/30';
    }
  };

  const getPriorityLabel = () => {
    switch (priority) {
      case 'critical': return '🔴 Critical';
      case 'high': return '🟠 High Priority';
      case 'medium': return '🟡 Medium Priority';
      case 'low': return '🟢 Low Priority';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{product.name}</h3>
            {product.researchBacked && (
              <Award className="w-5 h-5 text-cyan-400" title="Research-backed" />
            )}
          </div>
          <p className="text-sm text-purple-300">{product.brand}</p>
        </div>
        
        {/* Relevance Score */}
        <div className="flex flex-col items-end">
          <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full">
            <span className="text-lg font-bold text-cyan-400">{score}</span>
            <span className="text-xs text-cyan-300">/100</span>
          </div>
          <span className="text-xs text-purple-300 mt-1">Match</span>
        </div>
      </div>

      {/* Priority Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-3 border ${getPriorityColor()}`}>
        <span className="text-sm font-medium">{getPriorityLabel()}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-purple-200 mb-4">
        {product.description}
      </p>

      {/* Targets */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-purple-300 mb-2">Targets:</div>
        <div className="flex flex-wrap gap-2">
          {biomarkerGaps.map(gap => (
            <div 
              key={gap.biomarkerId}
              className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg"
            >
              <span className="text-xs text-purple-200">
                {gap.biomarkerName}
                {gap.currentValue && (
                  <span className="text-purple-400 ml-1">
                    ({gap.currentValue})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-purple-300 mb-1">Why we recommend this:</div>
            <div className="text-xs text-purple-200">{reasoning}</div>
          </div>
        </div>
      </div>

      {/* Impact Estimate */}
      {recommendation.estimatedImpact > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-purple-200">
            Expected impact: <span className="text-cyan-400 font-semibold">+{recommendation.estimatedImpact}</span> myVagal Tone points
          </span>
        </div>
      )}

      {/* Rating & Reviews */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        {renderStars(product.rating)}
        <span className="text-sm text-purple-300">
          {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()} reviews)
        </span>
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          <span className="text-2xl font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-purple-300">{product.dosage}</div>
          <div className="text-xs text-purple-400">{product.servingsPerContainer} servings</div>
        </div>
      </div>

      {/* Purchase Buttons */}
      <div className="space-y-2">
        {/* Best deal (highest commission) */}
        {product.affiliateLinks.fullscript && (
          <button
            onClick={() => handleAffiliateClick('fullscript')}
            disabled={tracking}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            {tracking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Tracking...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Buy on Fullscript</span>
                <span className="text-xs opacity-80">(Best Price - {product.commissionRates.fullscript}% off)</span>
              </>
            )}
          </button>
        )}

        {/* Alternative options */}
        <div className="grid grid-cols-2 gap-2">
          {product.affiliateLinks.thorne && (
            <button
              onClick={() => handleAffiliateClick('thorne')}
              disabled={tracking}
              className="bg-white/10 hover:bg-white/20 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Thorne</span>
            </button>
          )}

          {product.affiliateLinks.amazon && (
            <button
              onClick={() => handleAffiliateClick('amazon')}
              disabled={tracking}
              className="bg-white/10 hover:bg-white/20 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Amazon</span>
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          {product.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-white/5 rounded text-xs text-purple-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Preference Warnings */}
      {!recommendation.matchesPreferences && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-300">
            This product may not match all your preferences. Check ingredients carefully.
          </div>
        </div>
      )}

      {!recommendation.inBudget && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-orange-300">
            This product exceeds your monthly budget preference.
          </div>
        </div>
      )}
    </div>
  );
}
