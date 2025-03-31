'use client'

import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile } from '@/lib/supabase'
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

export default function AccountSettings() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth()
  const { addNotification } = useApp()

  // Form state
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

      const updates: Partial<UserProfile> = {
        full_name: fullName.trim(),
      }

      const success = await updateProfile(updates)

      if (success) {
        setSuccess('Profile updated successfully')
        setEditMode(false)
        addNotification({
          message: 'Profile updated successfully',
          type: 'success',
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while updating profile'
      setError(errorMessage)
      addNotification({
        message: errorMessage,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    setFullName(profile?.full_name || '')
    setEditMode(false)
    setError(null)
  }

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user || !profile) {
    return <Alert severity='warning'>Please sign in to view your profile</Alert>
  }

  // Get subscription tier display name
  const getSubscriptionDisplay = () => {
    if (!profile.plan) return 'Free Plan'
    return (
      profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) + ' Plan'
    )
  }

  // Get credits display
  const getCreditsDisplay = () => {
    const credits = profile.credits || 0
    const limit = 1 // Assuming 1 free generation
    return `${credits} / ${limit}`
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 2 }}>
          {profile.full_name?.charAt(0)?.toUpperCase() ||
            user.email?.charAt(0)?.toUpperCase() || <AccountCircleIcon />}
        </Avatar>
        <Box>
          <Typography variant='h5' gutterBottom>
            {profile.full_name || 'User'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {user.email}
          </Typography>
          <Chip
            label={getSubscriptionDisplay()}
            size='small'
            color={profile.plan === 'free' ? 'default' : 'primary'}
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant='h6'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <AccountCircleIcon sx={{ mr: 1 }} />
        Account Information
      </Typography>

      {error && (
        <Alert severity='error' sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' sx={{ my: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid
          sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 6' } }}
        >
          <TextField
            fullWidth
            label='Email Address'
            value={user.email || ''}
            disabled
            variant='outlined'
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid
          sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 6' } }}
        >
          <TextField
            fullWidth
            label='Full Name'
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            disabled={!editMode}
            variant='outlined'
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid
          sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 6' } }}
        >
          <TextField
            fullWidth
            label='Membership'
            value={getSubscriptionDisplay()}
            disabled
            variant='outlined'
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid
          sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 6' } }}
        >
          <TextField
            fullWidth
            label='Free Credits'
            value={getCreditsDisplay()}
            disabled
            variant='outlined'
            sx={{ mb: 3 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        {editMode ? (
          <>
            <Button
              variant='outlined'
              onClick={handleCancelEdit}
              disabled={loading}
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
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            variant='contained'
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant='h6'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <KeyIcon sx={{ mr: 1 }} />
        Security Settings
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Button
          variant='outlined'
          sx={{ mr: 2 }}
          onClick={() => {
            addNotification({
              message: 'Password reset email sent. Please check your inbox.',
              type: 'info',
            })
          }}
        >
          Change Password
        </Button>
      </Box>
    </Paper>
  )
}
