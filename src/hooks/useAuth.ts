'use client'

import { useState, useEffect } from 'react'

// Define a simplified user type
interface User {
  id: string
  email?: string
}

// Create a simplified auth hook that returns a mock user
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a static site without authentication, we'll use a mock user
    // This allows components that expect a user object to continue working
    const mockUser: User = {
      id: 'static-user-id',
      email: 'user@example.com',
    }
    setUser(mockUser)
    setIsLoading(false)
  }, [])

  return {
    user,
    isLoading,
    signIn: async () => {
      // Sign in functionality removed in static site version
      return { error: null }
    },
    signOut: async () => {
      // Sign out functionality removed in static site version
      return { error: null }
    },
    signUp: async () => {
      // Sign up functionality removed in static site version
      return { error: null }
    },
  }
}
