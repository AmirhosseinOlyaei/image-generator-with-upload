'use client'

import ImageUpload from '@/components/dashboard/ImageUpload'
import ProviderKeyModal from '@/components/dashboard/ProviderKeyModal'
import SubscriptionModal from '@/components/dashboard/SubscriptionModal'
import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { useApp } from '@/contexts/AppContext'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import SaveAltRoundedIcon from '@mui/icons-material/SaveAltRounded'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

// AI providers
const aiProviders = [
  {
    id: 'openai',
    name: 'OpenAI DALL-E 3',
    description:
      'Advanced AI model by OpenAI with excellent Ghibli transformations',
    disabled: false,
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description:
      'Specialized in artistic transformations with great Ghibli styles',
    disabled: true,
  },
  {
    id: 'midjourney',
    name: 'Midjourney (via API)',
    description: 'Known for highest quality anime-style transformations',
    disabled: true,
  },
  {
    id: 'leonardo',
    name: 'Leonardo AI',
    description: 'Emerging AI with good artistic capabilities',
    disabled: true,
  },
]

// Mock profile for static site
const mockProfile = {
  id: 'static-user',
  email: 'demo@example.com',
  full_name: 'Demo User',
  plan: 'free',
  credits: 10,
  created_at: new Date().toISOString(),
}

export default function Dashboard() {
  const _router = useRouter()
  const { addNotification } = useApp()

  // Static site implementation without authentication
  const [profile] = React.useState(mockProfile)
  const [generating, setGenerating] = React.useState(false)
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string | null>(
    null,
  )
  const [generatedImageUrl, setGeneratedImageUrl] = React.useState<
    string | null
  >(null)
  const [selectedProvider, setSelectedProvider] = React.useState('openai')
  const [_providerKeys, setProviderKeys] = React.useState<
    Record<string, string>
  >({})
  const [error, setError] = React.useState<string | null>(null)
  const [showProviderKeyModal, setShowProviderKeyModal] = React.useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] =
    React.useState(false)
  const [prompt, setPrompt] = React.useState<string>(
    'Transform this image into Studio Ghibli style.',
  )

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setUploadedImage(file)
      setUploadedImageUrl(URL.createObjectURL(file))
      setGeneratedImageUrl(null)
      setError(null)
    } else {
      setUploadedImage(null)
      setUploadedImageUrl(null)
      setGeneratedImageUrl(null)
      setError(null)
    }
  }

  const handleProviderChange = (event: SelectChangeEvent) => {
    setSelectedProvider(event.target.value as string)
  }

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value)
  }

  const handleGenerateImage = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first')
      return
    }

    if (!prompt) {
      setError('Please enter a prompt')
      return
    }

    setError(null)
    setGenerating(true)

    try {
      // Create FormData to send to the API
      const formData = new FormData()
      formData.append('image', uploadedImage)
      formData.append('prompt', prompt)
      formData.append('provider', selectedProvider)

      // Add API key if available
      const providerKey = _providerKeys[selectedProvider]
      if (providerKey) {
        formData.append('apiKey', providerKey)
      }

      // Call the API endpoint
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImageUrl(data.imageUrl)
      addNotification({
        message: 'Image generated successfully!',
        type: 'success',
      })
    } catch (error: unknown) {
      // Using 'unknown' type for error
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to generate image. Please try again.')
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveImage = () => {
    if (generatedImageUrl) {
      try {
        setError(null)

        // Create a download link that points to our proxy API
        const proxyUrl = `/api/download?url=${encodeURIComponent(generatedImageUrl)}`

        // Create and trigger download
        const link = document.createElement('a')
        link.href = proxyUrl
        link.download = `ghibli-transformation-${new Date().getTime()}.png`
        document.body.appendChild(link)
        link.click()

        // Clean up
        setTimeout(() => {
          document.body.removeChild(link)
        }, 100)
        addNotification({
          message: 'Image saved successfully!',
          type: 'success',
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Download error:', error)
        setError('Failed to download image. Please try again.')
      }
    }
  }

  const handleSetProviderKey = (provider: string, key: string) => {
    setProviderKeys(prev => ({
      ...prev,
      [provider]: key,
    }))
    setShowProviderKeyModal(false)

    addNotification({
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved!`,
      type: 'success',
    })
  }

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MainAppBar />
      <Container
        maxWidth='lg'
        sx={{
          mt: 4,
          mb: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 3 }}
        >
          Transform Your Images into Studio Ghibli Art
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant='h6' gutterBottom>
                Upload Your Image
              </Typography>

              <Box sx={{ mb: 3 }}>
                <ImageUpload onFileUpload={handleFileUpload} />
              </Box>

              <Typography variant='h6' gutterBottom>
                Transformation Settings
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id='provider-select-label'>AI Provider</InputLabel>
                <Select
                  labelId='provider-select-label'
                  id='provider-select'
                  value={selectedProvider}
                  label='AI Provider'
                  onChange={handleProviderChange}
                >
                  {aiProviders.map(provider => (
                    <MenuItem
                      key={provider.id}
                      value={provider.id}
                      disabled={provider.disabled}
                    >
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label='Prompt'
                multiline
                fullWidth
                rows={3}
                value={prompt}
                onChange={handlePromptChange}
                placeholder={`Add additional details for your Ghibli transformation (optional)`}
                sx={{ mb: 1 }}
                helperText='Customize your Ghibli transformation with additional details'
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<AutoFixHighRoundedIcon />}
                  onClick={handleGenerateImage}
                  disabled={!uploadedImage || generating}
                  sx={{
                    py: 1.5,
                    position: 'relative',
                  }}
                >
                  {generating ? (
                    <>
                      <CircularProgress
                        size={24}
                        color='inherit'
                        sx={{ position: 'absolute' }}
                      />
                      <span style={{ opacity: 0 }}>Generate Ghibli Image</span>
                    </>
                  ) : (
                    'Generate Ghibli Image'
                  )}
                </Button>

                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => setShowProviderKeyModal(true)}
                  sx={{
                    py: 1.5,
                    borderWidth: !_providerKeys[selectedProvider] ? 2 : 1,
                    borderColor: !_providerKeys[selectedProvider]
                      ? 'warning.main'
                      : undefined,
                  }}
                >
                  {!_providerKeys[selectedProvider]
                    ? 'Set API Key (Required)'
                    : 'Update API Key'}
                </Button>
              </Box>

              {!_providerKeys[selectedProvider] && (
                <Alert severity='warning' sx={{ mt: 2 }}>
                  The default API key has run out of credits. Please set your
                  own OpenAI API key to continue generating images.
                </Alert>
              )}

              {error && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {profile && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Credits remaining: {profile.credits} / Monthly limit
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Current plan:{' '}
                    {profile.plan.charAt(0).toUpperCase() +
                      profile.plan.slice(1)}
                  </Typography>
                  <Button
                    variant='text'
                    size='small'
                    onClick={handleUpgradeClick}
                    sx={{ mt: 1 }}
                  >
                    Upgrade for more credits
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant='h6' gutterBottom>
                Preview
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'column' },
                  gap: 2,
                  mb: 2,
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 1,
                    position: 'relative',
                    minHeight: 250,
                  }}
                >
                  {uploadedImageUrl ? (
                    <>
                      <Box
                        component='img'
                        src={uploadedImageUrl}
                        alt='Uploaded'
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain',
                        }}
                      />
                      <Button
                        variant='outlined'
                        color='error'
                        size='small'
                        onClick={() => handleFileUpload(null)}
                        sx={{ mt: 1 }}
                      >
                        Remove Image
                      </Button>
                    </>
                  ) : (
                    <Typography color='text.secondary'>
                      Original Image
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 1,
                    position: 'relative',
                    minHeight: 250,
                  }}
                >
                  {generating ? (
                    <CircularProgress />
                  ) : generatedImageUrl ? (
                    <Box
                      component='img'
                      src={generatedImageUrl}
                      alt='Generated'
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Typography color='text.secondary'>
                      Transformed Image
                    </Typography>
                  )}
                </Box>
              </Box>

              {generatedImageUrl && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    mt: 2,
                  }}
                >
                  <Button
                    variant='contained'
                    color='secondary'
                    startIcon={<SaveAltRoundedIcon />}
                    onClick={handleSaveImage}
                  >
                    Save Image
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />

      <ProviderKeyModal
        open={showProviderKeyModal}
        onClose={() => setShowProviderKeyModal(false)}
        onSave={handleSetProviderKey}
        provider={selectedProvider}
      />

      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentPlan={profile?.plan || 'free'}
      />
    </Box>
  )
}
