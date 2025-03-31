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
        // eslint-disable-next-line no-console
        console.error('Error checking auth status:', error)
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
          // Silent error handling for preferences parsing
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
  }, [])

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
        // eslint-disable-next-line no-console
        console.error('Error checking auth status:', err)
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
  }, [supabase])

  // Load provider keys from Supabase
  useEffect(() => {
    const fetchProviderKeys = async () => {
      try {
        // Only try to fetch if user exists and is fully loaded
        if (user && user.id) {
          try {
            // First check if the provider_keys table exists by getting tables list
            const { error: tablesError } = await supabase
              .from('provider_keys')
              .select('count')
              .limit(1)

            // If we get a specific error about the table not existing,
            // we'll just use empty provider keys
            if (
              tablesError &&
              'code' in tablesError &&
              tablesError.code === '42P01'
            ) {
              // Table doesn't exist - expected for new setups
              dispatch({
                type: 'UPDATE_STATE',
                providerKeys: {},
              })
              return
            }

            // If we reach here, the table exists, so proceed with the query
            const { data, error } = await supabase
              .from('provider_keys')
              .select('*')
              .eq('user_id', user.id)

            // If there's a data error, handle it but don't throw
            if (error) {
              // Handle error silently
              dispatch({
                type: 'UPDATE_STATE',
                providerKeys: {},
              })
              return
            }

            // If we found provider keys, process them
            if (data && data.length > 0) {
              const userKeys = data[0] // Get the first entry
              const keys: ProviderKeys = {}

              if (userKeys.openai_key) keys.openai = userKeys.openai_key
              if (userKeys.stability_key)
                keys.stability = userKeys.stability_key
              if (userKeys.midjourney_key)
                keys.midjourney = userKeys.midjourney_key
              if (userKeys.leonardo_key) keys.leonardo = userKeys.leonardo_key

              dispatch({
                type: 'UPDATE_STATE',
                providerKeys: keys,
              })
            } else {
              // No provider keys found for this user, which is fine for new users
              // Initialize with empty object to prevent further fetch attempts
              dispatch({
                type: 'UPDATE_STATE',
                providerKeys: {},
              })
            }
          } catch (fetchError) {
            // Handle any other errors silently
            // Set empty provider keys to avoid further errors
            dispatch({
              type: 'UPDATE_STATE',
              providerKeys: {},
            })
          }
        } else if (user === null && !authLoading) {
          // User is definitely not logged in, clear any existing provider keys
          dispatch({
            type: 'UPDATE_STATE',
            providerKeys: {},
          })
        }
        // If user is still loading (authLoading === true), we'll wait for the next cycle
      } catch (err) {
        // Set empty provider keys to avoid further errors
        dispatch({
          type: 'UPDATE_STATE',
          providerKeys: {},
        })
      }
    }

    // Only run the effect if authentication state is stable
    if (!authLoading) {
      fetchProviderKeys()
    }
  }, [user, supabase, authLoading])

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
