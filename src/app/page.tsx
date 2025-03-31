'use client'

import GhibliShowcase from '@/components/landing/GhibliShowcase'
import HowItWorks from '@/components/landing/HowItWorks'
import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const supabase = createClientComponentClient()

  // Check authentication status directly from Supabase
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsCheckingAuth(true)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        setIsAuthenticated(!!data.session)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthStatus()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // TEMPORARILY DISABLED AUTH: Always redirect to dashboard
  const handleGetStarted = () => {
    router.push('/dashboard')
    // if (isAuthenticated) {
    //   router.push('/dashboard')
    // } else {
    //   router.push('/auth/signin')
    // }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar />

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            textAlign: 'center',
            background:
              'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url("https://images.unsplash.com/photo-1558470598-a5dda9640f68?q=80&w=1000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Container maxWidth='md'>
            <Typography
              variant='h2'
              component='h1'
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: 4,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Transform Your Photos into Studio Ghibli Art
            </Typography>
            <Typography
              variant='h5'
              component='p'
              color='text.secondary'
              sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
            >
              Upload your images and watch as AI transforms them into beautiful
              Studio Ghibli style artwork in seconds.
            </Typography>
            <Button
              variant='contained'
              size='large'
              onClick={handleGetStarted}
              // disabled={isCheckingAuth}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 2,
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              {isCheckingAuth ? (
                <CircularProgress size={24} color='inherit' />
              ) : isAuthenticated ? (
                'Go to Dashboard'
              ) : (
                'Get Started Now'
              )}
            </Button>
          </Container>
        </Box>

        <GhibliShowcase />
        <HowItWorks />
      </Box>

      <Footer />
    </Box>
  )
}
