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
  const [prompt, setPrompt] = React.useState<string>('')

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
      // For static site, simulate image generation with a placeholder
      setTimeout(() => {
        setGeneratedImageUrl('/placeholder-ghibli.jpg')
        setGenerating(false)

        addNotification({
          message: 'Image generated successfully!',
          type: 'success',
        })
      }, 2000)
    } catch (error: unknown) {
      // Using 'unknown' type for error
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to generate image. Please try again.')
      }
      setGenerating(false)
    }
  }

  const handleSaveImage = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a')
      link.href = generatedImageUrl
      link.download = 'ghibli-transformed-image.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addNotification({
        message: 'Image saved successfully!',
        type: 'success',
      })
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
              <Box sx={{ mb: 3, flex: 1 }}>
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
                fullWidth
                label='Transformation Prompt'
                placeholder="Describe the Ghibli style you want (e.g., 'Transform into Howl's Moving Castle style')"
                multiline
                rows={3}
                value={prompt}
                onChange={handlePromptChange}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<AutoFixHighRoundedIcon />}
                  onClick={handleGenerateImage}
                  disabled={generating || !uploadedImage || !prompt}
                >
                  {generating ? (
                    <>
                      <CircularProgress
                        size={24}
                        color='inherit'
                        sx={{ mr: 1 }}
                      />
                      Generating...
                    </>
                  ) : (
                    'Transform Image'
                  )}
                </Button>

                <Button
                  variant='outlined'
                  onClick={() => setShowProviderKeyModal(true)}
                >
                  Set API Key
                </Button>
              </Box>

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
                  flexDirection: { xs: 'column', sm: 'row' },
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
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 1,
                    position: 'relative',
                    minHeight: 250,
                  }}
                >
                  {uploadedImageUrl ? (
                    <Box
                      component='img'
                      src={uploadedImageUrl}
                      alt='Uploaded'
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
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
                        maxHeight: '100%',
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
                <Button
                  variant='contained'
                  color='secondary'
                  startIcon={<SaveAltRoundedIcon />}
                  onClick={handleSaveImage}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Save Image
                </Button>
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
