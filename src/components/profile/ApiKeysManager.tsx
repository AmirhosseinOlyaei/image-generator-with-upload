'use client'

import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/hooks/useAuth'
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Key as KeyIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

// Define the structure for provider information
interface ProviderInfo {
  id: string
  name: string
  description: string
  apiKeyUrl: string
  docUrl: string
  placeholder: string
}

// List of supported providers
const PROVIDERS: ProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI DALL-E',
    description: "Generate Ghibli-style art using OpenAI's DALL-E model",
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    docUrl: 'https://platform.openai.com/docs/guides/images',
    placeholder: 'sk-...',
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description:
      "Transform your images with Stability AI's Stable Diffusion models",
    apiKeyUrl: 'https://platform.stability.ai/account/keys',
    docUrl: 'https://platform.stability.ai/docs/getting-started',
    placeholder: 'sk-...',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: "Create Ghibli art in Midjourney's distinctive style",
    apiKeyUrl: 'https://www.midjourney.com/account/',
    docUrl: 'https://docs.midjourney.com/docs',
    placeholder: 'mj-...',
  },
  {
    id: 'leonardo',
    name: 'Leonardo AI',
    description: "Use Leonardo AI's powerful image generation capabilities",
    apiKeyUrl: 'https://app.leonardo.ai/account/api-keys',
    docUrl: 'https://docs.leonardo.ai/',
    placeholder: 'leo-...',
  },
]

export default function ApiKeysManager() {
  const { user } = useAuth()
  const { providerKeys, setProviderKey, removeProviderKey, addNotification } =
    useApp()

  // State for API keys
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  // Initialize state based on existing provider keys
  useEffect(() => {
    const initialKeys: Record<string, string> = {}
    const initialShowKey: Record<string, boolean> = {}

    PROVIDERS.forEach(provider => {
      initialKeys[provider.id] =
        providerKeys[provider.id as keyof typeof providerKeys] || ''
      initialShowKey[provider.id] = false
    })

    setKeys(initialKeys)
    setShowKey(initialShowKey)
  }, [providerKeys])

  // Handle key change
  const handleKeyChange = (providerId: string, value: string) => {
    setKeys(prev => ({
      ...prev,
      [providerId]: value,
    }))

    // Clear error when user types
    if (errors[providerId]) {
      setErrors(prev => ({
        ...prev,
        [providerId]: null,
      }))
    }
  }

  // Toggle key visibility
  const toggleKeyVisibility = (providerId: string) => {
    setShowKey(prev => ({
      ...prev,
      [providerId]: !prev[providerId],
    }))
  }

  // Save API key
  const handleSaveKey = async (providerId: string) => {
    try {
      setLoading(prev => ({
        ...prev,
        [providerId]: true,
      }))

      setErrors(prev => ({
        ...prev,
        [providerId]: null,
      }))

      // Validate key format
      const key = keys[providerId].trim()
      if (!key) {
        throw new Error('API key cannot be empty')
      }

      // Validate provider-specific key format
      const provider = PROVIDERS.find(p => p.id === providerId)
      if (provider) {
        // Simple prefix validation
        const prefixMap: Record<string, string> = {
          openai: 'sk-',
          stability: 'sk-',
          midjourney: 'mj-',
          leonardo: 'leo-',
        }

        const expectedPrefix = prefixMap[providerId]
        if (expectedPrefix && !key.startsWith(expectedPrefix)) {
          throw new Error(
            `Invalid ${provider.name} API key format. Should start with "${expectedPrefix}"`,
          )
        }
      }

      // Save key to context (and database through context)
      await setProviderKey(providerId as keyof typeof providerKeys, key)

      addNotification({
        message: `${provider?.name || 'API'} key saved successfully`,
        type: 'success',
      })
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to save ${providerId} API key`
      setErrors(prev => ({
        ...prev,
        [providerId]: errorMessage,
      }))

      addNotification({
        message: errorMessage,
        type: 'error',
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        [providerId]: false,
      }))
    }
  }

  // Remove API key
  const handleRemoveKey = async (providerId: string) => {
    try {
      setLoading(prev => ({
        ...prev,
        [providerId]: true,
      }))

      setErrors(prev => ({
        ...prev,
        [providerId]: null,
      }))

      // Remove key from context (and database through context)
      await removeProviderKey(providerId as keyof typeof providerKeys)

      // Clear the input field
      setKeys(prev => ({
        ...prev,
        [providerId]: '',
      }))

      const provider = PROVIDERS.find(p => p.id === providerId)
      addNotification({
        message: `${provider?.name || 'API'} key removed successfully`,
        type: 'info',
      })
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to remove ${providerId} API key`
      setErrors(prev => ({
        ...prev,
        [providerId]: errorMessage,
      }))

      addNotification({
        message: errorMessage,
        type: 'error',
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        [providerId]: false,
      }))
    }
  }

  if (!user) {
    return (
      <Alert severity='warning'>Please sign in to manage your API keys</Alert>
    )
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography
        variant='h5'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', mb: 3 }}
      >
        <KeyIcon sx={{ mr: 1 }} />
        Manage API Keys
      </Typography>

      <Alert severity='info' sx={{ mb: 3 }}>
        Add your own API keys to use when you exceed the free limit. Your keys
        are securely stored and encrypted.
      </Alert>

      <Grid container spacing={2}>
        {PROVIDERS.map(provider => (
          <Grid key={provider.id} sx={{ gridColumn: { xs: 'span 12' } }}>
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'medium' }}>
                  {provider.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      paragraph
                    >
                      {provider.description}
                    </Typography>
                  </Grid>

                  <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
                    <TextField
                      fullWidth
                      label={`${provider.name} API Key`}
                      placeholder={provider.placeholder}
                      value={keys[provider.id] || ''}
                      onChange={e =>
                        handleKeyChange(provider.id, e.target.value)
                      }
                      type={showKey[provider.id] ? 'text' : 'password'}
                      error={Boolean(errors[provider.id])}
                      helperText={errors[provider.id] || ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              aria-label='toggle key visibility'
                              onClick={() => toggleKeyVisibility(provider.id)}
                              edge='end'
                            >
                              {showKey[provider.id] ? (
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

                  <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2'>Get your key:</Typography>
                      <Link
                        href={provider.apiKeyUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {provider.name} Dashboard
                      </Link>
                      <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />
                      <Link
                        href={provider.docUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        API Docs
                      </Link>
                    </Box>
                  </Grid>

                  <Grid
                    sx={{
                      gridColumn: { xs: 'span 12', sm: 'span 6' },
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 2,
                    }}
                  >
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={
                        loading[provider.id] ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )
                      }
                      onClick={() => handleRemoveKey(provider.id)}
                      disabled={
                        loading[provider.id] ||
                        !providerKeys[provider.id as keyof typeof providerKeys]
                      }
                    >
                      Remove
                    </Button>
                    <Button
                      variant='contained'
                      startIcon={
                        loading[provider.id] ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      onClick={() => handleSaveKey(provider.id)}
                      disabled={loading[provider.id] || !keys[provider.id]}
                    >
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant='subtitle2' gutterBottom>
          Key Usage & Security
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Your API keys are encrypted before being stored in our database. They
          are only used to generate images when you use our service. You'll be
          charged directly by the respective AI providers according to their
          pricing when using your own API keys.
        </Typography>
      </Box>
    </Paper>
  )
}
