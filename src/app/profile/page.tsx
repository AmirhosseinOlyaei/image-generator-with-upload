'use client'

import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { supabase, UserProfile } from '@/lib/supabase'
import ApiIcon from '@mui/icons-material/Api'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form fields
  const [fullName, setFullName] = useState('')
  const [providerKey, setProviderKey] = useState('')

  useEffect(() => {
    async function getUser() {
      try {
        // Get user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            setError(`Error fetching profile: ${profileError.message}`)
          } else {
            setProfile(profileData as UserProfile)

            // Initialize form fields
            setFullName(profileData.full_name || '')
            setProviderKey(profileData.provider_keys?.openai || '')
          }
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'An error occurred while fetching user data',
        )
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [loading, user, router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          provider_keys: { openai: providerKey },
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          full_name: fullName,
          provider_keys: {
            ...profile.provider_keys,
            openai: providerKey,
          },
        })
      }

      setSuccess('Profile updated successfully')
      setEditing(false)
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while updating profile',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form values to original
    if (profile) {
      setFullName(profile.full_name || '')
      setProviderKey(profile.provider_keys?.openai || '')
    }
    setEditing(false)
  }

  const handleChangePassword = async () => {
    setError(null)
    setSuccess(null)

    try {
      if (!user?.email) {
        throw new Error('Email is required to reset password')
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess('Password reset email sent to your email address')
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email',
      )
    }
  }

  const handleDeleteAccount = async () => {
    setError(null)
    setSaving(true)

    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Delete user from Supabase Auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id,
      )

      if (deleteError) {
        throw deleteError
      }

      router.push('/')
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Failed to delete account',
      )
      setSaving(false)
    }
  }

  const handleSendPasswordReset = async () => {
    setError(null)
    setSuccess(null)

    try {
      if (!user?.email) {
        throw new Error('User email not available')
      }

      // Now we know user.email is defined
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email as string,
      )

      if (error) {
        throw error
      }

      setSuccess('Password reset email sent to your email address')
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email',
      )
    }
  }

  if (loading) {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar />

      <Container component='main' sx={{ flexGrow: 1, py: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}
        >
          Your Profile
        </Typography>

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

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                  }}
                >
                  {profile?.full_name ? (
                    profile.full_name.charAt(0).toUpperCase()
                  ) : user?.email ? (
                    user.email.charAt(0).toUpperCase()
                  ) : (
                    <PersonIcon fontSize='large' />
                  )}
                </Avatar>

                <Typography variant='h5' gutterBottom>
                  {profile?.full_name ||
                    (user?.email ? user.email.split('@')[0] : 'User')}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  {user?.email}
                </Typography>

                <Chip
                  label={
                    profile?.plan === 'free'
                      ? 'Free Plan'
                      : profile?.plan === 'basic'
                        ? 'Basic Plan'
                        : profile?.plan === 'premium'
                          ? 'Premium Plan'
                          : profile?.plan === 'ultimate'
                            ? 'Ultimate Plan'
                            : 'Free Plan'
                  }
                  color={
                    profile?.plan === 'free'
                      ? 'default'
                      : profile?.plan === 'basic'
                        ? 'primary'
                        : profile?.plan === 'premium'
                          ? 'secondary'
                          : profile?.plan === 'ultimate'
                            ? 'success'
                            : 'default'
                  }
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemText
                    primary='Free Image'
                    secondary={
                      (profile?.credits ?? 0) > 0 ? 'Available' : 'Used'
                    }
                  />
                  <Chip
                    label={(profile?.credits ?? 0) > 0 ? 'Available' : 'Used'}
                    color={(profile?.credits ?? 0) > 0 ? 'success' : 'default'}
                    size='small'
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary='Joined'
                    secondary={
                      user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'
                    }
                  />
                </ListItem>
              </List>

              <Button
                fullWidth
                variant='outlined'
                color='primary'
                onClick={() => router.push('/dashboard')}
                sx={{ mt: 2 }}
              >
                Go to Dashboard
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <Typography
                  variant='h5'
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: 'primary.dark' }}
                >
                  Account Settings
                </Typography>

                {!editing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<CancelIcon />}
                      color='inherit'
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      startIcon={<SaveIcon />}
                      variant='contained'
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Full Name'
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <PersonIcon color='action' />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Email Address'
                    value={user?.email || ''}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <PersonIcon color='action' />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='API Key'
                    type={apiKeyVisible ? 'text' : 'password'}
                    value={providerKey}
                    onChange={e => setProviderKey(e.target.value)}
                    disabled={!editing}
                    placeholder='Enter your API key to use your own provider account'
                    helperText='Optional: Add your own AI provider API key to use instead of subscription credits'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <ApiIcon color='action' />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => setApiKeyVisible(!apiKeyVisible)}
                            edge='end'
                          >
                            {apiKeyVisible ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'primary.dark' }}
              >
                Security
              </Typography>

              <Button
                variant='outlined'
                color='primary'
                startIcon={<LockIcon />}
                onClick={handleChangePassword}
                sx={{ mt: 1 }}
              >
                Change Password
              </Button>

              <Button
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
                sx={{ mt: 1 }}
              >
                Delete Account
              </Button>

              <Button
                variant='outlined'
                color='primary'
                startIcon={<LockIcon />}
                onClick={handleSendPasswordReset}
                sx={{ mt: 1 }}
              >
                Send Password Reset
              </Button>

              <Divider sx={{ my: 4 }} />

              <Typography
                variant='h6'
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'primary.dark' }}
              >
                Subscription
              </Typography>

              <Typography variant='body1' paragraph>
                Current Plan:{' '}
                <b>
                  {profile?.plan === 'free'
                    ? 'Free'
                    : profile?.plan === 'basic'
                      ? 'Basic'
                      : profile?.plan === 'premium'
                        ? 'Premium'
                        : profile?.plan === 'ultimate'
                          ? 'Ultimate'
                          : 'Free'}
                </b>
              </Typography>

              <Button
                variant='contained'
                color='secondary'
                onClick={() => router.push('/pricing')}
              >
                {profile?.plan === 'free'
                  ? 'Upgrade Plan'
                  : 'Manage Subscription'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  )
}
