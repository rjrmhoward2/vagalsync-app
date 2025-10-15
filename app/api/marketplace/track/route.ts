/**
 * VagalSync V15.0 Ultimate - Marketplace Click Tracking API
 * 
 * API endpoint: POST /api/marketplace/track
 * 
 * Tracks affiliate link clicks for attribution and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplaceEngine } from '../../../../lib/middleware/marketplaceEngine';

// ============================================================================
// POST /api/marketplace/track
// ============================================================================

/**
 * Track affiliate link click
 * 
 * Request body:
 * {
 *   userId: string,
 *   productId: string,
 *   network: 'amazon' | 'thorne' | 'fullscript' | 'direct',
 *   redirectUrl: string
 * }
 * 
 * Response:
 * {
 *   clickId: string,
 *   redirectUrl: string,
 *   tracked: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, network, redirectUrl } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required field: productId', code: 'MISSING_PRODUCT_ID' },
        { status: 400 }
      );
    }
    
    if (!network) {
      return NextResponse.json(
        { error: 'Missing required field: network', code: 'MISSING_NETWORK' },
        { status: 400 }
      );
    }
    
    if (!redirectUrl) {
      return NextResponse.json(
        { error: 'Missing required field: redirectUrl', code: 'MISSING_REDIRECT_URL' },
        { status: 400 }
      );
    }
    
    // Track the click
    const clickId = await marketplaceEngine.trackClick(
      userId,
      productId,
      network as any,
      redirectUrl
    );
    
    console.log('[Track API] Click tracked:', {
      clickId,
      userId: userId.substring(0, 8) + '...',
      productId,
      network
    });
    
    return NextResponse.json({
      clickId,
      redirectUrl,
      tracked: true
    });
    
  } catch (error: any) {
    console.error('[Track API] Error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to track click',
        code: 'TRACK_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/marketplace/track
// ============================================================================

/**
 * Get click/purchase analytics
 * 
 * Query params:
 * - userId?: string (optional - for user-specific stats)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    
    // Get revenue stats
    const stats = await marketplaceEngine.getRevenueStats(userId);
    
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[Track API] Get stats error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to get stats',
        code: 'GET_STATS_ERROR'
      },
      { status: 500 }
    );
  }
}
