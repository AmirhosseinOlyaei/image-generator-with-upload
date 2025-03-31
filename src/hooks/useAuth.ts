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

  // Helper function to just fetch profile without creation
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Just return null for any error - don't throw or log
        return null
      }

      return data
    } catch (err) {
      // Just return null for any error - don't throw or log
      return null
    }
  }

  // Check if the user is authenticated and load profile data
  useEffect(() => {
    let mounted = true

    const fetchUserData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }))

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          if (mounted) {
            setState({ user: null, profile: null, loading: false, error: null })
          }
          return
        }

        // Only fetch profile, don't try to create it
        const profileData = await fetchProfile(session.user.id)

        if (mounted) {
          setState({
            user: session.user,
            profile: profileData,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An error occurred while fetching user data'
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: errorMessage,
          })
        }
      }
    }

    fetchUserData()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          try {
            // Only fetch profile, don't try to create it
            const profileData = await fetchProfile(session.user.id)

            if (mounted) {
              setState({
                user: session.user,
                profile: profileData,
                loading: false,
                error: null,
              })

              // Force router refresh to update components that depend on auth state
              router.refresh()
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to load profile'
            if (mounted) {
              setState({
                user: session.user,
                profile: null,
                loading: false,
                error: errorMessage,
              })
            }
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setState({ user: null, profile: null, loading: false, error: null })
          router.push('/')
          router.refresh()
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Ensure we have a session
      if (!data.session) {
        throw new Error('No session returned after sign in')
      }

      // Wait a moment for the auth state to update
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 300)

      return true
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign in'
      setState({
        ...state,
        loading: false,
        error: errorMessage,
      })
      return false
    }
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
      return true
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign in with Google'
      setState({
        ...state,
        loading: false,
        error: errorMessage,
      })
      return false
    }
  }

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    try {
      setState({ ...state, loading: true, error: null })

      const { error } = await supabase.auth.signUp({
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

      // Do not attempt to create profile here - this will be handled by an external process like a Supabase function or hook

      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 300)

      return true
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign up'
      setState({
        ...state,
        loading: false,
        error: errorMessage,
      })
      return false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setState({ ...state, loading: true, error: null })
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Clear auth state
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      })

      // Redirect to homepage and force refresh
      router.push('/')
      router.refresh()
      return true
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign out'
      setState({
        ...state,
        loading: false,
        error: errorMessage,
      })
      return false
    }
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
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile'
      setState({
        ...state,
        loading: false,
        error: errorMessage,
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
