'use client'

import { useAuth } from '@/hooks/useAuth'
import type { UserProfile } from '@/lib/supabase'
import type { User } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useCallback,
} from 'react'

// Define the shape of our app state
interface AppState {
  darkMode: boolean
  notifications: Notification[]
  providerKeys: ProviderKeys
  userPreferences: UserPreferences
  isAuthenticated: boolean
  isAuthLoading: boolean
}

// Define the shape of notifications
interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  autoHide?: boolean
  duration?: number
}

// Define the shape of provider keys
interface ProviderKeys {
  openai?: string
  stability?: string
  midjourney?: string
  leonardo?: string
}

// Define the shape of user preferences
interface UserPreferences {
  defaultProvider: string
  recentPrompts: string[]
}

// Define type for AppAction
type AppAction =
  | {
      type: 'UPDATE_AUTH_STATE'
      isAuthenticated: boolean
      isAuthLoading: boolean
    }
  | { type: 'UPDATE_STATE'; [key: string]: unknown }

// Define the shape of our context
interface AppContextType extends AppState {
  toggleDarkMode: () => void

  addNotification: (notification: Omit<Notification, 'id'>) => void

  removeNotification: (id: string) => void

  setProviderKey: (provider: keyof ProviderKeys, key: string) => void

  removeProviderKey: (provider: keyof ProviderKeys) => void

  getProviderKey: (provider: keyof ProviderKeys) => string | undefined

  setUserPreference: <K extends keyof UserPreferences>(
    key: K,

    value: UserPreferences[K],
  ) => void

  addRecentPrompt: (prompt: string) => void
  user: User | null
  profile: UserProfile | null
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined)

// Define the reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'UPDATE_AUTH_STATE':
      return {
        ...state,
        isAuthenticated: action.isAuthenticated,
        isAuthLoading: action.isAuthLoading,
      }
    case 'UPDATE_STATE': {
      // Destructure and omit 'type' from the updates
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type, ...updates } = action
      return { ...state, ...updates }
    }
    default:
      return state
  }
}

// Provider component that wraps your app and makes the context available
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const initialState = {
    darkMode: false,
    notifications: [],
    providerKeys: {},
    userPreferences: {
      defaultProvider: 'openai',
      recentPrompts: [],
    },
    isAuthenticated: false,
    isAuthLoading: false,
  }

  const [state, dispatch] = useReducer(appReducer, initialState)
  const isMounted = useRef(false)
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClientComponentClient()

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          dispatch({
            type: 'UPDATE_AUTH_STATE',
            isAuthenticated: true,
            isAuthLoading: false,
          })
        } else {
          dispatch({
            type: 'UPDATE_AUTH_STATE',
            isAuthenticated: false,
            isAuthLoading: false,
          })
        }
      } catch (error) {
        dispatch({
          type: 'UPDATE_AUTH_STATE',
          isAuthenticated: false,
          isAuthLoading: false,
        })
      }
    }

    checkAuth()
  }, [supabase])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (isMounted.current) {
      dispatch({
        type: 'UPDATE_AUTH_STATE',
        isAuthenticated: !!user,
        isAuthLoading: authLoading,
      })
    }
  }, [user, authLoading])

  // Load user preferences from localStorage on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load dark mode setting
      const savedDarkMode = window.localStorage.getItem('darkMode')
      if (savedDarkMode) {
        dispatch({
          type: 'UPDATE_STATE',
          darkMode: savedDarkMode === 'true',
        })
      } else {
        // Check if user prefers dark mode based on system preference
        const prefersDarkMode = window.matchMedia(
          '(prefers-color-scheme: dark)',
        ).matches
        dispatch({
          type: 'UPDATE_STATE',
          darkMode: prefersDarkMode,
        })
      }

      // Load user preferences
      const savedPreferences = window.localStorage.getItem('userPreferences')
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences)
          dispatch({
            type: 'UPDATE_STATE',
            userPreferences: {
              ...state.userPreferences,
              ...parsedPreferences,
            },
          })
        } catch (error) {
          dispatch({
            type: 'UPDATE_STATE',
            userPreferences: {
              defaultProvider: 'openai',
              recentPrompts: [],
            },
          })
        }
      }
    }
  }, [dispatch, supabase, state.userPreferences])

  // Set up auth state listener
  useEffect(() => {
    // Initial auth check
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }

        dispatch({
          type: 'UPDATE_AUTH_STATE',
          isAuthenticated: !!data.session,
          isAuthLoading: false,
        })
      } catch (err) {
        dispatch({
          type: 'UPDATE_AUTH_STATE',
          isAuthenticated: false,
          isAuthLoading: false,
        })
      }
    }

    checkAuth()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        dispatch({
          type: 'UPDATE_AUTH_STATE',
          isAuthenticated: true,
          isAuthLoading: false,
        })
      } else if (event === 'SIGNED_OUT') {
        dispatch({
          type: 'UPDATE_AUTH_STATE',
          isAuthenticated: false,
          isAuthLoading: false,
        })

        // Clear provider keys when signed out
        dispatch({
          type: 'UPDATE_STATE',
          providerKeys: {},
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, dispatch])

  const fetchProviderKeys = useCallback(async () => {
    try {
      if (user && profile) {
        const { data, error } = await supabase
          .from('profiles')
          .select('provider_keys')
          .eq('id', user.id)
          .single()

        if (error) {
          throw error
        }

        if (data?.provider_keys) {
          dispatch({
            type: 'UPDATE_STATE',
            providerKeys: data.provider_keys,
          })
        }
      }
    } catch (error) {
      dispatch({
        type: 'UPDATE_STATE',
        providerKeys: {},
      })
    }
  }, [user, profile, supabase])

  useEffect(() => {
    // Only run the effect if authentication state is stable
    if (!authLoading) {
      fetchProviderKeys()
    }
  }, [user, supabase, authLoading, fetchProviderKeys, dispatch])

  // Toggle dark mode
  const toggleDarkMode = () => {
    dispatch({
      type: 'UPDATE_STATE',
      darkMode: !state.darkMode,
    })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('darkMode', String(!state.darkMode))
    }
  }

  // Add a notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      autoHide: notification.autoHide !== false,
      duration: notification.duration || 5000,
    }

    dispatch({
      type: 'UPDATE_STATE',
      notifications: [...state.notifications, newNotification],
    })

    // Auto-remove notification after duration if autoHide is true
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  // Remove a notification
  const removeNotification = (id: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      notifications: state.notifications.filter(n => n.id !== id),
    })
  }

  // Set a provider API key
  const setProviderKey = async (provider: keyof ProviderKeys, key: string) => {
    if (!user) return

    // Update local state
    dispatch({
      type: 'UPDATE_STATE',
      providerKeys: {
        ...state.providerKeys,
        [provider]: key,
      },
    })

    // Determine which column to update based on the provider
    const columnName = `${provider}_key`

    // Check if we already have a record for this user
    const { data, error: fetchError } = await supabase
      .from('provider_keys')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      // Handle error silently
      return
    }

    if (data && data.length > 0) {
      // Update existing record
      const { error } = await supabase
        .from('provider_keys')
        .update({ [columnName]: key })
        .eq('user_id', user.id)

      if (error) {
        // Handle error silently
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('provider_keys')
        .insert([{ user_id: user.id, [columnName]: key }])

      if (error) {
        // Handle error silently
      }
    }
  }

  // Remove a provider API key
  const removeProviderKey = async (provider: keyof ProviderKeys) => {
    if (!user) return

    // Update local state
    dispatch({
      type: 'UPDATE_STATE',
      providerKeys: {
        ...state.providerKeys,
        [provider]: undefined,
      },
    })

    // Determine which column to update based on the provider
    const columnName = `${provider}_key`

    // Update the database record, setting the key to null
    const { error } = await supabase
      .from('provider_keys')
      .update({ [columnName]: null })
      .eq('user_id', user.id)

    if (error) {
      // Handle error silently
    }
  }

  // Get a provider API key
  const getProviderKey = (provider: keyof ProviderKeys) => {
    return state.providerKeys[provider]
  }

  // Set a user preference
  const setUserPreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    if (typeof window !== 'undefined') {
      const updatedPreferences = {
        ...state.userPreferences,
        [key]: value,
      }
      dispatch({
        type: 'UPDATE_STATE',
        userPreferences: updatedPreferences,
      })
      window.localStorage.setItem(
        'userPreferences',
        JSON.stringify(updatedPreferences),
      )
    }
  }

  // Add a recent prompt
  const addRecentPrompt = (prompt: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      userPreferences: {
        ...state.userPreferences,
        recentPrompts: [
          prompt,
          ...state.userPreferences.recentPrompts.filter(p => p !== prompt),
        ].slice(0, 10),
      },
    })

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'userPreferences',
        JSON.stringify({
          ...state.userPreferences,
          recentPrompts: [
            prompt,
            ...state.userPreferences.recentPrompts.filter(p => p !== prompt),
          ].slice(0, 10),
        }),
      )
    }
  }

  const value = {
    ...state,
    toggleDarkMode,
    addNotification,
    removeNotification,
    setProviderKey,
    removeProviderKey,
    getProviderKey,
    setUserPreference,
    addRecentPrompt,
    user,
    profile,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
