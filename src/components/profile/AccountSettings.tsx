'use client'

import { useApp } from '@/contexts/AppContext'
import {
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Key as KeyIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

// Mock user profile type
interface UserProfile {
  id: string
  full_name: string
  email?: string
  avatar_url?: string | null
  credits: number
  plan: string
}

// Mock profile data
const mockProfile: UserProfile = {
  id: 'mock-user-id',
  full_name: 'Demo User',
  email: 'demo@example.com',
  avatar_url: null,
  credits: 5,
  plan: 'free',
}

export default function AccountSettings() {
  const { addNotification } = useApp()

  // Form state
  const [profile] = useState<UserProfile>(mockProfile)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      setError('Full name cannot be empty')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update would go here in a real app

      setSuccess('Profile updated successfully')
      addNotification({
        message: 'Profile updated successfully',
        type: 'success',
      })
      setEditMode(false)
    } catch (err) {
      setError('Failed to update profile')
      addNotification({
        message: 'Failed to update profile',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Cancel edit mode
  const handleCancel = () => {
    setFullName(profile?.full_name || '')
    setEditMode(false)
    setError(null)
  }

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant='h6'>Account Information</Typography>
        </Box>
        {!editMode ? (
          <Button
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
            size='small'
          >
            Edit
          </Button>
        ) : (
          <Box>
            <Button
              variant='outlined'
              size='small'
              onClick={handleCancel}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              startIcon={
                loading ? <CircularProgress size={20} /> : <SaveIcon />
              }
              onClick={handleUpdateProfile}
              disabled={loading}
              size='small'
            >
              Save
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar
              src={profile.avatar_url || undefined}
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {profile.full_name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant='subtitle1' gutterBottom>
              {profile.full_name}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {profile.email}
            </Typography>
            <Chip
              label={`${profile.plan.charAt(0).toUpperCase()}${profile.plan.slice(
                1,
              )} Plan`}
              color={
                profile.plan === 'premium'
                  ? 'secondary'
                  : profile.plan === 'pro'
                    ? 'primary'
                    : 'default'
              }
              size='small'
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box component='form' noValidate>
            <TextField
              margin='normal'
              required
              fullWidth
              id='fullName'
              label='Full Name'
              name='fullName'
              autoComplete='name'
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={!editMode || loading}
              sx={{ mb: 3 }}
            />

            <TextField
              margin='normal'
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              value={profile.email || ''}
              disabled
              sx={{ mb: 3 }}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant='subtitle1'>API Keys</Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<KeyIcon />}
                onClick={() => {
                  // This would navigate to API keys management in a real app
                  addNotification({
                    message: 'API Keys management is disabled in demo mode',
                    type: 'info',
                  })
                }}
              >
                Manage Keys
              </Button>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant='subtitle1'>Credits</Typography>
              <Chip
                label={`${profile.credits} credits remaining`}
                color='primary'
                variant='outlined'
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}
