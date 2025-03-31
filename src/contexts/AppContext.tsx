'use client'

import {
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
  darkMode?: boolean
}

// Define type for AppAction
type AppAction =
  | {
      type: 'TOGGLE_DARK_MODE'
    }
  | {
      type: 'ADD_NOTIFICATION'
      notification: Notification
    }
  | {
      type: 'REMOVE_NOTIFICATION'
      id: string
    }
  | {
      type: 'UPDATE_STATE'
      providerKeys?: Partial<ProviderKeys>
      userPreferences?: Partial<UserPreferences>
    }

// Define the shape of our context
interface AppContextType {
  darkMode: boolean
  notifications: Notification[]
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
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined)

// Define the reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.notification],
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      }
    case 'UPDATE_STATE':
      return {
        ...state,
        ...(action.providerKeys && {
          providerKeys: { ...state.providerKeys, ...action.providerKeys },
        }),
        ...(action.userPreferences && {
          userPreferences: {
            ...state.userPreferences,
            ...action.userPreferences,
          },
        }),
      }
    default:
      return state
  }
}

// Provider component that wraps your app and makes the context available
export function AppProvider({ children }: { children: ReactNode }) {
  // Initial state
  const initialState: AppState = {
    darkMode: false,
    notifications: [],
    providerKeys: {},
    userPreferences: {
      defaultProvider: 'openai',
      recentPrompts: [],
    },
  }

  const [state, dispatch] = useReducer(appReducer, initialState)
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load dark mode preference
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode) {
        dispatch({
          type: 'UPDATE_STATE',
          userPreferences: {
            ...state.userPreferences,
            darkMode: savedDarkMode === 'true',
          },
        })
      }

      // Load user preferences
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        try {
          const preferences = JSON.parse(savedPreferences)
          dispatch({
            type: 'UPDATE_STATE',
            userPreferences: {
              ...state.userPreferences,
              ...preferences,
            },
          })
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Load provider keys
      const savedProviderKeys = localStorage.getItem('providerKeys')
      if (savedProviderKeys) {
        try {
          const keys = JSON.parse(savedProviderKeys)
          dispatch({
            type: 'UPDATE_STATE',
            providerKeys: keys,
          })
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
  }, [state.userPreferences, dispatch])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted.current) {
      localStorage.setItem('darkMode', state.darkMode.toString())
      localStorage.setItem(
        'userPreferences',
        JSON.stringify(state.userPreferences),
      )
      localStorage.setItem('providerKeys', JSON.stringify(state.providerKeys))
    }
  }, [state.darkMode, state.userPreferences, state.providerKeys, isMounted])

  // Toggle dark mode
  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' })
  }

  // Add a notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        ...notification,
        id,
      },
    })

    // Auto-hide notification if specified
    if (notification.autoHide !== false) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  // Remove a notification
  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', id })
  }

  // Set a provider API key
  const setProviderKey = (provider: keyof ProviderKeys, key: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      providerKeys: {
        ...state.providerKeys,
        [provider]: key,
      },
    })
  }

  // Remove a provider API key
  const removeProviderKey = (provider: keyof ProviderKeys) => {
    dispatch({
      type: 'UPDATE_STATE',
      providerKeys: {
        ...state.providerKeys,
        [provider]: undefined,
      },
    })
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
    dispatch({
      type: 'UPDATE_STATE',
      userPreferences: {
        ...state.userPreferences,
        [key]: value,
      },
    })
  }

  // Add a recent prompt
  const addRecentPrompt = (prompt: string) => {
    const recentPrompts = [
      prompt,
      ...state.userPreferences.recentPrompts.filter(p => p !== prompt),
    ].slice(0, 10) // Keep only the 10 most recent prompts

    setUserPreference('recentPrompts', recentPrompts)
  }

  // Create the context value
  const contextValue: AppContextType = {
    darkMode: state.darkMode,
    notifications: state.notifications,
    toggleDarkMode,
    addNotification,
    removeNotification,
    setProviderKey,
    removeProviderKey,
    getProviderKey,
    setUserPreference,
    addRecentPrompt,
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

// Custom hook to use the AppContext
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
