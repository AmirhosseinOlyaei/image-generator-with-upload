'use client'

import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { supabase } from '@/lib/supabase'
import {
  Email,
  Google,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      // No need to redirect, the OAuth flow handles this
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar user={null} loading={false} />

      <Container component='main' maxWidth='sm' sx={{ flexGrow: 1, py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("https://images.unsplash.com/photo-1558470598-a5dda9640f68?q=80&w=300&auto=format&fit=crop")',
            backgroundSize: 'cover',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant='h4'
              component='h1'
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Welcome Back
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Sign in to continue your Ghibli-style transformation journey
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component='form' onSubmit={handleEmailSignIn} sx={{ mt: 1 }}>
            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Email color='action' />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type={showPassword ? 'text' : 'password'}
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Lock color='action' />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleTogglePassword}
                      edge='end'
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              size='large'
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                position: 'relative',
              }}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  color='inherit'
                  sx={{ position: 'absolute' }}
                />
              ) : (
                'Sign In'
              )}
            </Button>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Link
                href='/auth/forgot-password'
                style={{ textDecoration: 'none' }}
              >
                <Typography variant='body2' color='primary'>
                  Forgot password?
                </Typography>
              </Link>
              <Link href='/auth/signup' style={{ textDecoration: 'none' }}>
                <Typography variant='body2' color='primary'>
                  Don't have an account? Sign Up
                </Typography>
              </Link>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant='outlined'
              color='primary'
              size='large'
              startIcon={<Google />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                py: 1.5,
                borderWidth: 2,
              }}
            >
              Sign in with Google
            </Button>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  )
}
