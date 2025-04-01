'use client'

import GhibliShowcase from '@/components/landing/GhibliShowcase'
import HowItWorks from '@/components/landing/HowItWorks'
import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { Box, Button, Container, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Simplified approach without authentication
  const handleGetStarted = () => {
    setIsLoading(true)
    router.push('/dashboard')
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
              disabled={isLoading}
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
              Get Started Now
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
