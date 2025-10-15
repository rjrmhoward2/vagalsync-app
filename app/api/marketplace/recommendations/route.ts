/**
 * VagalSync V15.0 Ultimate - Marketplace Recommendations API
 * 
 * API endpoint: POST /api/marketplace/recommendations
 * 
 * Returns personalized product recommendations based on biomarker gaps
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplaceEngine } from '../../../../lib/middleware/marketplaceEngine';
import { loadBiomarkerEntries } from '../../../services/storageService';
import type { BiomarkerEntry } from '../../../types/biomarker.types';

// ============================================================================
// POST /api/marketplace/recommendations
// ============================================================================

/**
 * Get personalized product recommendations
 * 
 * Request body:
 * {
 *   userId: string,
 *   entries?: BiomarkerEntry[],    // Optional - will load from storage if not provided
 *   limit?: number,                 // Max recommendations (default: 10)
 *   preferences?: {                 // Optional user preferences
 *     dietary?: { vegan?: boolean, glutenFree?: boolean },
 *     monthlyBudget?: number,
 *     priceRange?: 'budget' | 'moderate' | 'premium'
 *   }
 * }
 * 
 * Response:
 * {
 *   recommendations: ProductRecommendation[],
 *   totalGaps: number,
 *   estimatedImpact: number,
 *   revenueOpportunity: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, entries: providedEntries, limit = 10, preferences } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }
    
    // Get biomarker entries (provided or load from storage)
    let entries: BiomarkerEntry[];
    
    if (providedEntries && Array.isArray(providedEntries)) {
      entries = providedEntries;
    } else {
      // Load from storage (Phase 1: localStorage, Phase 2: Supabase)
      entries = loadBiomarkerEntries();
    }
    
    if (entries.length === 0) {
      return NextResponse.json({
        recommendations: [],
        totalGaps: 0,
        estimatedImpact: 0,
        revenueOpportunity: 0,
        message: 'No biomarker data yet. Add some biomarkers to get personalized recommendations!'
      });
    }
    
    // Update user preferences if provided
    if (preferences) {
      await marketplaceEngine.updateUserPreferences(userId, preferences);
    }
    
    // Get recommendations
    const recommendations = await marketplaceEngine.getRecommendations(
      userId,
      entries,
      limit
    );
    
    // Calculate total gaps addressed
    const uniqueGaps = new Set(
      recommendations.flatMap(r => r.biomarkerGaps.map(g => g.biomarkerId))
    );
    
    // Calculate total potential impact
    const totalImpact = recommendations.reduce((sum, r) => sum + r.estimatedImpact, 0);
    
    // Calculate revenue opportunity (estimated commission if all purchased)
    const revenueOpportunity = recommendations.reduce((sum, r) => {
      const product = r.product;
      const bestCommission = Math.max(
        product.commissionRates.amazon || 0,
        product.commissionRates.thorne || 0,
        product.commissionRates.fullscript || 0,
        product.commissionRates.direct || 0
      );
      return sum + (product.price * (bestCommission / 100));
    }, 0);
    
    console.log('[Marketplace API] Recommendations generated:', {
      userId: userId.substring(0, 8) + '...',
      count: recommendations.length,
      gaps: uniqueGaps.size,
      revenue: `$${revenueOpportunity.toFixed(2)}`
    });
    
    return NextResponse.json({
      recommendations,
      totalGaps: uniqueGaps.size,
      estimatedImpact: Math.round(totalImpact),
      revenueOpportunity: Math.round(revenueOpportunity * 100) / 100
    });
    
  } catch (error: any) {
    console.error('[Marketplace API] Error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to get recommendations',
        code: 'RECOMMENDATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/marketplace/recommendations
// ============================================================================

/**
 * Get user's saved preferences
 * 
 * Query params:
 * - userId: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }
    
    // For now, return empty preferences
    // In Phase 2, load from database
    return NextResponse.json({
      preferences: {
        dietary: {},
        priceRange: 'moderate',
        preferredBrands: [],
        avoidBrands: [],
        requireGMP: true,
        requireThirdPartyTesting: true
      }
    });
    
  } catch (error: any) {
    console.error('[Marketplace API] Get preferences error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to get preferences',
        code: 'GET_PREFERENCES_ERROR'
      },
      { status: 500 }
    );
  }
}
