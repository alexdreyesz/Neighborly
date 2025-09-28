import { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'

interface ProfileData {
  id: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  roles: string[]
  skills: string[]
  languages: string[]
  radius_meters: number
  org_verified: boolean
  created_at: string
}

interface OrganizationData {
  id: string
  display_name: string | null
  logo: string | null
  phone: string | null
  types: string[]
  skills: string[]
  languages: string[]
  radius_meters: number
  org_verified: boolean
  created_at: string
}

interface UserProfile {
  profile: ProfileData | null
  organization: OrganizationData | null
  isOrganization: boolean
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`)
      }

      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Check if user has a regular profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If user has a regular profile, use that and ignore organization
      if (!profileError && profileData) {
        setProfile({
          profile: profileData,
          organization: null,
          isOrganization: false
        })
        return
      }

      // Only check organization if no regular profile exists
      const { data: orgData, error: orgError } = await supabase
        .from('organization')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!orgError && orgData) {
        setProfile({
          profile: null,
          organization: orgData,
          isOrganization: true
        })
        return
      }

      // No profile found in either table
      if (profileError?.code === 'PGRST116' && orgError?.code === 'PGRST116') {
        throw new Error('No profile found. Please complete your profile setup.')
      }
      
      throw new Error(`Database error: ${profileError?.message || orgError?.message}`)

    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<ProfileData>) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('No authenticated user found')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Update failed: ${error.message}`)
      }

      // Refresh profile data
      await fetchProfile()
      return data

    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateOrganization = async (updates: Partial<OrganizationData>) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('No authenticated user found')
      }

      const { data, error } = await supabase
        .from('organization')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Update failed: ${error.message}`)
      }

      // Refresh profile data
      await fetchProfile()
      return data

    } catch (err) {
      console.error('Error updating organization:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    updateOrganization
  }
}

// Standalone function for one-time profile fetching
export async function getProfile(): Promise<UserProfile | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('No authenticated user found')
    }

    // Check if user has a regular profile first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If user has a regular profile, use that and ignore organization
    if (!profileError && profileData) {
      return {
        profile: profileData,
        organization: null,
        isOrganization: false
      }
    }

    // Only check organization if no regular profile exists
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!orgError && orgData) {
      return {
        profile: null,
        organization: orgData,
        isOrganization: true
      }
    }

    // No profile found in either table
    if (profileError?.code === 'PGRST116' && orgError?.code === 'PGRST116') {
      throw new Error('No profile found. Please complete your profile setup.')
    }
    
    throw new Error(`Database error: ${profileError?.message || orgError?.message}`)

  } catch (err) {
    console.error('Error fetching profile:', err)
    throw err
  }
}