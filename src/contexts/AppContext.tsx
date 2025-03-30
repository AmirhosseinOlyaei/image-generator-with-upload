'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define the shape of our app state
interface AppState {
  darkMode: boolean;
  notifications: Notification[];
  providerKeys: ProviderKeys;
  userPreferences: UserPreferences;
}

// Define the shape of notifications
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  autoHide?: boolean;
  duration?: number;
}

// Define the shape of provider keys
interface ProviderKeys {
  openai?: string;
  stability?: string;
  midjourney?: string;
  leonardo?: string;
}

// Define the shape of user preferences
interface UserPreferences {
  defaultProvider: string;
  recentPrompts: string[];
}

// Define the shape of our context
interface AppContextType extends AppState {
  toggleDarkMode: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setProviderKey: (provider: keyof ProviderKeys, key: string) => void;
  removeProviderKey: (provider: keyof ProviderKeys) => void;
  getProviderKey: (provider: keyof ProviderKeys) => string | undefined;
  setUserPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  addRecentPrompt: (prompt: string) => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component that wraps your app and makes the context available
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  // Initialize state
  const [state, setState] = useState<AppState>({
    darkMode: false,
    notifications: [],
    providerKeys: {},
    userPreferences: {
      defaultProvider: 'openai',
      recentPrompts: [],
    },
  });

  // Load user preferences from localStorage on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load dark mode setting
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) {
        setState(prev => ({ ...prev, darkMode: savedDarkMode === 'true' }));
      } else {
        // Check if user prefers dark mode based on system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setState(prev => ({ ...prev, darkMode: prefersDarkMode }));
      }
      
      // Load user preferences
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setState(prev => ({
            ...prev,
            userPreferences: {
              ...prev.userPreferences,
              ...parsedPreferences,
            },
          }));
        } catch (error) {
          console.error('Failed to parse user preferences:', error);
        }
      }
    }
  }, []);

  // Load provider keys from Supabase
  useEffect(() => {
    const fetchProviderKeys = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('provider_keys')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching provider keys:', error);
          return;
        }
        
        if (data) {
          const keys: ProviderKeys = {};
          if (data.openai_key) keys.openai = data.openai_key;
          if (data.stability_key) keys.stability = data.stability_key;
          if (data.midjourney_key) keys.midjourney = data.midjourney_key;
          if (data.leonardo_key) keys.leonardo = data.leonardo_key;
          
          setState(prev => ({ ...prev, providerKeys: keys }));
        }
      }
    };
    
    fetchProviderKeys();
  }, [user, supabase]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setState(prev => {
      const newDarkMode = !prev.darkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(newDarkMode));
      }
      return { ...prev, darkMode: newDarkMode };
    });
  };

  // Add a notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      autoHide: notification.autoHide !== false,
      duration: notification.duration || 5000,
    };
    
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification],
    }));
    
    // Auto-remove notification after duration if autoHide is true
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  };

  // Set a provider API key
  const setProviderKey = async (provider: keyof ProviderKeys, key: string) => {
    if (!user) return;
    
    // Update local state
    setState(prev => ({
      ...prev,
      providerKeys: {
        ...prev.providerKeys,
        [provider]: key,
      },
    }));
    
    // Determine which column to update based on the provider
    const columnName = `${provider}_key`;
    
    // Check if we already have a record for this user
    const { data, error: fetchError } = await supabase
      .from('provider_keys')
      .select('*')
      .eq('user_id', user.id);
    
    if (fetchError) {
      console.error('Error checking for existing provider keys:', fetchError);
      return;
    }
    
    if (data && data.length > 0) {
      // Update existing record
      const { error } = await supabase
        .from('provider_keys')
        .update({ [columnName]: key })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating provider key:', error);
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('provider_keys')
        .insert([{ user_id: user.id, [columnName]: key }]);
      
      if (error) {
        console.error('Error inserting provider key:', error);
      }
    }
  };

  // Remove a provider API key
  const removeProviderKey = async (provider: keyof ProviderKeys) => {
    if (!user) return;
    
    // Update local state
    setState(prev => {
      const newKeys = { ...prev.providerKeys };
      delete newKeys[provider];
      return {
        ...prev,
        providerKeys: newKeys,
      };
    });
    
    // Determine which column to update based on the provider
    const columnName = `${provider}_key`;
    
    // Update the database record, setting the key to null
    const { error } = await supabase
      .from('provider_keys')
      .update({ [columnName]: null })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error removing provider key:', error);
    }
  };

  // Get a provider API key
  const getProviderKey = (provider: keyof ProviderKeys) => {
    return state.providerKeys[provider];
  };

  // Set a user preference
  const setUserPreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setState(prev => {
      const newPreferences = {
        ...prev.userPreferences,
        [key]: value,
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      }
      
      return {
        ...prev,
        userPreferences: newPreferences,
      };
    });
  };

  // Add a recent prompt
  const addRecentPrompt = (prompt: string) => {
    setState(prev => {
      // Add to the beginning and limit to 10 items
      const newPrompts = [
        prompt,
        ...prev.userPreferences.recentPrompts.filter(p => p !== prompt),
      ].slice(0, 10);
      
      const newPreferences = {
        ...prev.userPreferences,
        recentPrompts: newPrompts,
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      }
      
      return {
        ...prev,
        userPreferences: newPreferences,
      };
    });
  };

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
