/**
 * VagalSync V15.0 Ultimate - Middleware Aggregation API Route
 * 
 * API endpoint: POST /api/middleware/aggregate
 * 
 * Aggregates biomarker data from multiple connected devices
 * Returns normalized data in VagalSync biomarker format
 * 
 * NO NFTs, NO TOKENS, NO BLOCKCHAIN - Pure SaaS Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  aggregateDeviceData, 
  completeBiomarkerEntries,
  AggregationConfig 
} from '@/lib/middleware/deviceAggregator';

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * POST /api/middleware/aggregate
 * 
 * Request body:
 * {
 *   userId: string,              // User ID to aggregate for
 *   sources?: string[],          // Optional: specific sources to aggregate from
 *   includeDemo?: boolean,       // Optional: include demo data (default: true in Phase 1)
 *   timeRange?: {                // Optional: filter by time range
 *     start: string,             // ISO date string
 *     end: string                // ISO date string
 *   }
 * }
 * 
 * Response:
 * {
 *   biomarkerEntries: BiomarkerEntry[],  // Normalized biomarker data
 *   lastSync: string,                    // ISO date of sync
 *   sources: DeviceSource[],             // Connected devices
 *   errors?: DeviceError[]               // Any sync errors
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, sources, includeDemo, timeRange } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Missing required field: userId',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }
    
    // Build aggregation config
    const config: AggregationConfig = {
      userId,
      sources: sources || ['demo'],  // Default to demo in Phase 1
      includeDemo: includeDemo !== undefined ? includeDemo : true,
      timeRange: timeRange ? {
        start: new Date(timeRange.start),
        end: new Date(timeRange.end)
      } : undefined
    };
    
    // Log request (helpful for debugging)
    console.log('[API] Aggregating device data:', {
      userId: userId.substring(0, 8) + '...', // Partial ID for privacy
      sources: config.sources,
      includeDemo: config.includeDemo
    });
    
    // Aggregate data from devices
    const aggregatedData = await aggregateDeviceData(config);
    
    // Convert partial entries to complete BiomarkerEntry format
    const completeEntries = completeBiomarkerEntries(aggregatedData.biomarkerEntries);
    
    // Log results
    console.log('[API] Aggregation complete:', {
      entriesFound: completeEntries.length,
      sourcesConnected: aggregatedData.sources.length,
      hasErrors: !!aggregatedData.errors
    });
    
    // Return aggregated data
    return NextResponse.json({
      biomarkerEntries: completeEntries,
      lastSync: aggregatedData.lastSync.toISOString(),
      sources: aggregatedData.sources,
      errors: aggregatedData.errors
    });
    
  } catch (error: any) {
    // Log error
    console.error('[API] Aggregation error:', error);
    
    // Return error response
    return NextResponse.json(
      {
        error: error.message || 'Failed to aggregate device data',
        code: 'AGGREGATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/middleware/aggregate
 * 
 * Get available devices for a user (no aggregation)
 * 
 * Query params:
 * - userId: string (required)
 * 
 * Response:
 * {
 *   devices: DeviceSource[]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Missing required parameter: userId',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }
    
    // For Phase 1, return demo devices
    // Phase 2: Query actual connected devices from database
    const demoDevices = [
      {
        id: 'demo_wearable',
        name: 'Demo Smart Watch',
        type: 'wearable',
        accuracySource: 'validated_consumer',
        connected: true,
        lastSync: new Date().toISOString()
      },
      {
        id: 'demo_cgm',
        name: 'Demo CGM',
        type: 'cgm',
        accuracySource: 'medical_device',
        connected: true,
        lastSync: new Date().toISOString()
      },
      {
        id: 'demo_lab',
        name: 'Demo Lab Results',
        type: 'lab',
        accuracySource: 'laboratory',
        connected: true,
        lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return NextResponse.json({
      devices: demoDevices
    });
    
  } catch (error: any) {
    console.error('[API] Get devices error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to get devices',
        code: 'GET_DEVICES_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/middleware/aggregate
 * 
 * CORS preflight handler
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
