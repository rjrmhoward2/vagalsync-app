/**
 * VagalSync V15.0 - Supabase Client
 * Handles connection to Supabase for authentication and database
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Sign out user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
