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
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    setLoading(true)

    try {
      // Create the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Create a profile entry for the user with free image usage tracking
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            free_generations_used: 0,
            subscription_tier: 'free',
          },
        ])

        if (profileError) {
          setError(`Error creating profile: ${profileError.message}`)
          return
        }
      }

      setSuccess(
        'Registration successful! Please check your email to confirm your account.',
      )
      setTimeout(() => {
        router.push('/auth/signin')
      }, 5000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      // No need to redirect, the OAuth flow handles this
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to sign up with Google')
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar />

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
              Join Ghibli Vision
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Create an account to transform your photos into Ghibli-style
              artwork
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(247, 181, 56, 0.1)',
                borderRadius: 1,
                border: '1px solid rgba(247, 181, 56, 0.3)',
              }}
            >
              <Typography variant='body2' color='text.secondary' align='center'>
                <strong>Free Account Benefit:</strong> Get one free Ghibli-style
                transformation!
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity='success' sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component='form' onSubmit={handleEmailSignUp} sx={{ mt: 1 }}>
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
              autoComplete='new-password'
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
            <TextField
              margin='normal'
              required
              fullWidth
              name='confirmPassword'
              label='Confirm Password'
              type={showPassword ? 'text' : 'password'}
              id='confirmPassword'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Lock color='action' />
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  value='agree'
                  color='primary'
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                />
              }
              label={
                <Typography variant='body2'>
                  I agree to the{' '}
                  <Link
                    href='/terms'
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href='/privacy'
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />

            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              size='large'
              disabled={loading || !agreeTerms}
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
                'Sign Up'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Link href='/auth/signin' style={{ textDecoration: 'none' }}>
                <Typography variant='body2' color='primary'>
                  Already have an account? Sign In
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
              onClick={handleGoogleSignUp}
              // disabled={loading}
              disabled={true}
              sx={{
                py: 1.5,
                borderWidth: 2,
              }}
            >
              Sign up with Google
            </Button>
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  )
}
