/**
 * VagalSync V15.0 Ultimate - Biological Windows Optimizer API
 * 
 * API endpoint: POST /api/optimizer/windows
 * 
 * Returns optimal timing windows for activities based on:
 * - Circadian rhythms
 * - Chronotype
 * - Professional activity patterns
 * - Ultradian cycles
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  biologicalOptimizer,
  ActivityType,
  BiologicalProfile 
} from '../../../../lib/optimizer/BiologicalWindowsOptimizer';

// ============================================================================
// POST /api/optimizer/windows
// ============================================================================

/**
 * Get optimal time windows for an activity
 * 
 * Request body:
 * {
 *   userId: string,
 *   activity: ActivityType,
 *   date?: string,              // ISO date string (default: today)
 *   duration?: number,          // minutes (default: 60)
 *   profile?: {                 // Optional profile overrides
 *     chronotype?: 'early' | 'late' | 'intermediate',
 *     profession?: 'medical' | 'wellness'
 *   }
 * }
 * 
 * Response:
 * {
 *   windows: OptimalWindow[],
 *   profile: BiologicalProfile,
 *   requestedActivity: string,
 *   requestedDate: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, activity, date, duration, profile: profileUpdates } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Missing required field: activity', code: 'MISSING_ACTIVITY' },
        { status: 400 }
      );
    }
    
    // Parse date
    const targetDate = date ? new Date(date) : new Date();
    const activityDuration = duration || 60;
    
    // Update profile if provided
    if (profileUpdates) {
      await biologicalOptimizer.updateProfile(userId, profileUpdates);
    }
    
    // Get optimal windows
    const windows = await biologicalOptimizer.getOptimalWindows(
      userId,
      activity as ActivityType,
      targetDate,
      activityDuration
    );
    
    // Get user profile
    const profile = await biologicalOptimizer.getProfile(userId);
    
    // Log request (helpful for debugging)
    console.log('[Optimizer] Calculated windows:', {
      userId: userId.substring(0, 8) + '...',
      activity,
      windowCount: windows.length,
      topEffectiveness: windows[0]?.effectiveness
    });
    
    return NextResponse.json({
      windows,
      profile: {
        chronotype: profile.chronotype,
        profession: profile.profession,
        timezone: profile.timezone
      },
      requestedActivity: activity,
      requestedDate: targetDate.toISOString()
    });
    
  } catch (error: any) {
    console.error('[Optimizer] Error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to calculate optimal windows',
        code: 'OPTIMIZER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/optimizer/windows
// ============================================================================

/**
 * Get user's biological profile
 * 
 * Query params:
 * - userId: string (required)
 * 
 * Response:
 * {
 *   profile: BiologicalProfile
 * }
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
    
    const profile = await biologicalOptimizer.getProfile(userId);
    
    return NextResponse.json({
      profile: {
        userId: profile.userId,
        chronotype: profile.chronotype,
        profession: profile.profession,
        timezone: profile.timezone,
        wakeTime: profile.wakeTime,
        sleepTime: profile.sleepTime,
        lastUpdated: profile.lastUpdated
      }
    });
    
  } catch (error: any) {
    console.error('[Optimizer] Get profile error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to get profile',
        code: 'GET_PROFILE_ERROR'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/optimizer/windows
// ============================================================================

/**
 * Update user's biological profile
 * 
 * Request body:
 * {
 *   userId: string,
 *   profile: {
 *     chronotype?: 'early' | 'late' | 'intermediate',
 *     timezone?: string,
 *     wakeTime?: string,
 *     sleepTime?: string,
 *     profession?: 'medical' | 'wellness'
 *   }
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profile: updates } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }
    
    if (!updates) {
      return NextResponse.json(
        { error: 'Missing required field: profile', code: 'MISSING_PROFILE' },
        { status: 400 }
      );
    }
    
    const updatedProfile = await biologicalOptimizer.updateProfile(userId, updates);
    
    return NextResponse.json({
      success: true,
      profile: {
        userId: updatedProfile.userId,
        chronotype: updatedProfile.chronotype,
        profession: updatedProfile.profession,
        timezone: updatedProfile.timezone,
        wakeTime: updatedProfile.wakeTime,
        sleepTime: updatedProfile.sleepTime,
        lastUpdated: updatedProfile.lastUpdated
      }
    });
    
  } catch (error: any) {
    console.error('[Optimizer] Update profile error:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR'
      },
      { status: 500 }
    );
  }
}
