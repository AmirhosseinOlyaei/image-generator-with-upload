import type { UserProfile } from '@/lib/supabase'
import type { User } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check if the user is authenticated and load profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          setState({ user: null, profile: null, loading: false, error: null })
          return
        }

        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error
          throw profileError
        }

        setState({
          user: session.user,
          profile: profileData || null,
          loading: false,
          error: null,
        })
      } catch (error: any) {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: error.message || 'An error occurred while fetching user data',
        })
      }
    }

    fetchUserData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setState({
            user: session.user,
            profile: profileData || null,
            loading: false,
            error: null,
          })
        }
      }

      if (event === 'SIGNED_OUT') {
        setState({ user: null, profile: null, loading: false, error: null })
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null })
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/dashboard')
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.message || 'Failed to sign in',
      })
      return false
    }
    return true
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setState({ ...state, loading: true, error: null })
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.message || 'Failed to sign in with Google',
      })
      return false
    }
    return true
  }

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    try {
      setState({ ...state, loading: true, error: null })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      // Create a profile for the new user
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            display_name: displayName,
            email: email,
            free_generations_used: 0,
            subscription_tier: 'free',
          },
        ])

        if (profileError) {
          throw profileError
        }
      }

      router.push('/dashboard')
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.message || 'Failed to sign up',
      })
      return false
    }
    return true
  }

  // Sign out
  const signOut = async () => {
    try {
      setState({ ...state, loading: true, error: null })
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      router.push('/')
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.message || 'Failed to sign out',
      })
      return false
    }
    return true
  }

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user) {
        throw new Error('User not authenticated')
      }

      setState({ ...state, loading: true, error: null })

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)

      if (error) {
        throw error
      }

      // Refresh profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', state.user.id)
        .single()

      if (profileError) {
        throw profileError
      }

      setState({
        ...state,
        profile: profileData,
        loading: false,
        error: null,
      })

      return true
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.message || 'Failed to update profile',
      })
      return false
    }
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
  }
}
