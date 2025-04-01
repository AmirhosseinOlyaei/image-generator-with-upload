'use client'

import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import ApiIcon from '@mui/icons-material/Api'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Avatar,
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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Mock user profile type
interface UserProfile {
  id: string
  full_name: string
  provider_keys?: {
    openai?: string
    stability?: string
    midjourney?: string
    leonardo?: string
  }
  credits: number
  plan: 'free' | 'basic' | 'premium' | 'ultimate'
}

// Mock profile data for demo
const mockProfile: UserProfile = {
  id: '123456',
  full_name: 'Demo User',
  provider_keys: {
    openai: '',
  },
  credits: 5,
  plan: 'free',
}

export default function Profile() {
  const _router = useRouter()
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
    // Simulate fetching user profile
    const fetchProfile = () => {
      setTimeout(() => {
        setProfile(mockProfile)
        setFullName(mockProfile.full_name)
        setProviderKey(mockProfile.provider_keys?.openai || '')
        setLoading(false)
      }, 500)
    }

    fetchProfile()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar />

      <Container component='main' sx={{ py: 8, flexGrow: 1 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 2,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              justifyContent: 'space-between',
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                mb: { xs: 3, sm: 0 },
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 2, sm: 0 },
                }}
              >
                {profile?.full_name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant='h4' gutterBottom>
                  {profile?.full_name || 'User'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={`${profile?.credits || 0} Credits`}
                    color='primary'
                    size='small'
                  />
                  <Chip
                    label={`${profile?.plan?.toUpperCase() || 'FREE'} Plan`}
                    color='secondary'
                    size='small'
                  />
                </Box>
              </Box>
            </Box>
            <Button
              variant='outlined'
              startIcon={editing ? <SaveIcon /> : <EditIcon />}
              onClick={() => !editing && setEditing(true)}
              type={editing ? 'submit' : 'button'}
              form={editing ? 'profile-form' : undefined}
              disabled={saving}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Box>

          {(error || success) && (
            <Alert
              severity={error ? 'error' : 'success'}
              sx={{ mb: 3 }}
              onClose={() => {
                setError(null)
                setSuccess(null)
              }}
            >
              {error || success}
            </Alert>
          )}

          <form id='profile-form' onSubmit={handleSaveProfile}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <PersonIcon sx={{ mr: 1 }} /> Profile Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <TextField
                  label='Full Name'
                  fullWidth
                  margin='normal'
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={!editing}
                  required
                />

                <TextField
                  label='Demo Email'
                  fullWidth
                  margin='normal'
                  value='demo@example.com'
                  disabled
                  helperText='Email cannot be changed in this demo'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <ApiIcon sx={{ mr: 1 }} /> API Keys
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <TextField
                  label='OpenAI API Key'
                  fullWidth
                  margin='normal'
                  value={providerKey}
                  onChange={e => setProviderKey(e.target.value)}
                  disabled={!editing}
                  type={apiKeyVisible ? 'text' : 'password'}
                  helperText='Your own API key for OpenAI (optional)'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
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

              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom>
                  Usage Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <List>
                  <ListItem>
                    <ListItemText
                      primary='Current Plan'
                      secondary={profile?.plan?.toUpperCase() || 'FREE'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Available Credits'
                      secondary={profile?.credits || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Account ID'
                      secondary={profile?.id || ''}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>

            {editing && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 4,
                  gap: 2,
                }}
              >
                <Button
                  variant='outlined'
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={saving}
                  startIcon={
                    saving ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </form>
        </Paper>
      </Container>

      <Footer />
    </Box>
  )
}
