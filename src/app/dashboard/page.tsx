'use client'

import ImageUpload from '@/components/dashboard/ImageUpload'
import ProviderKeyModal from '@/components/dashboard/ProviderKeyModal'
import SubscriptionModal from '@/components/dashboard/SubscriptionModal'
import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { useApp } from '@/contexts/AppContext'
import { UserProfile } from '@/lib/supabase'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import KeyIcon from '@mui/icons-material/Key'
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
import { useEffect, useState } from 'react'

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
    description: 'AI platform with fine-tuned Ghibli aesthetic capabilities',
    disabled: true,
  },
]

export default function Dashboard() {
  const _router = useRouter()
  const {
    user: _contextUser,
    isAuthLoading: _isAuthLoading,
    getProviderKey,
    setProviderKey: _setProviderKey,
    removeProviderKey: _removeProviderKey,
  } = useApp()

  // TEMPORARILY DISABLED AUTH: Set defaults without requiring authentication
  const [_user, _setUser] = useState<UserProfile | null>(null)
  const [_profile, _setProfile] = useState<UserProfile | null>(null)
  const [_loading, _setLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  )
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [showProviderKeyModal, setShowProviderKeyModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [prompt, setPrompt] = useState<string>('')

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

  // Handle provider change
  const handleProviderChange = (event: SelectChangeEvent) => {
    const newProvider = event.target.value

    // Only allow changing to enabled providers
    const provider = aiProviders.find(p => p.id === newProvider)
    if (provider && !provider.disabled) {
      setSelectedProvider(newProvider)

      // Check if the user has a key for this provider
      if (!providerKeys[newProvider]) {
        // If no key is available for this provider, show the modal
        setShowProviderKeyModal(true)
      }
    }
  }

  // Handle provider key submission
  const handleProviderKeySubmit = (apiKey: string) => {
    const setProviderKey = _setProviderKey

    if (setProviderKey) {
      setProviderKey(
        selectedProvider as 'openai' | 'stability' | 'midjourney' | 'leonardo',
        apiKey,
      )

      setProviderKeys({
        ...providerKeys,
        [selectedProvider]: apiKey,
      })

      setShowProviderKeyModal(false)
      setError(null)
    }
  }

  const handleGenerateImage = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first')
      return
    }

    // Check if API key is required and not provided
    if (!providerKeys[selectedProvider]) {
      setError('No API key available. Please set your API key to continue.')
      setShowProviderKeyModal(true)
      return
    }

    setGenerating(true)
    setGeneratedImageUrl(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', uploadedImage)
      formData.append('provider', selectedProvider)
      formData.append(
        'prompt',
        'Transform this image into Studio Ghibli style: ' + (prompt || ''),
      )

      // Add API key if available
      if (providerKeys[selectedProvider]) {
        formData.append('apiKey', providerKeys[selectedProvider])
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorMessage = 'Failed to generate image'

        const textResponse = await fetch('/api/generate', {
          method: 'POST',
          body: formData,
        })
        const errorText = await textResponse.text()

        if (errorText.includes('exceeds') || errorText.includes('limit')) {
          throw new Error(
            'Image file is too large. Please use a smaller image (under 5MB).',
          )
        } else {
          // Log the error for debugging
          // eslint-disable-next-line no-console
          console.error('API error text:', errorText)
          throw new Error(errorText || errorMessage)
        }
      }

      const data = await response.json()
      setGeneratedImageUrl(data.imageUrl)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to generate image',
      )
      // eslint-disable-next-line no-console
      console.error('Error generating image:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadImage = () => {
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
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Download error:', error)
        setError('Failed to download image. Please try again.')
      }
    }
  }

  const handleShowOptions = () => {
    // Determine which modal to show
    if (_profile && (_profile.credits ?? 0) > 0 && _profile.plan === 'free') {
      setShowProviderKeyModal(true)
    }
  }

  // Load provider keys from context
  useEffect(() => {
    if (getProviderKey) {
      const keys: Record<string, string> = {}
      const openaiKey = getProviderKey('openai')
      if (openaiKey) {
        keys['openai'] = openaiKey
      }
      const stabilityKey = getProviderKey('stability')
      if (stabilityKey) {
        keys['stability'] = stabilityKey
      }
      setProviderKeys(keys)
    }
  }, [getProviderKey])

  // TEMPORARILY DISABLED AUTH: Remove loading check
  // if (loading) {
  //   return (
  //     <Backdrop
  //       sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
  //       open={true}
  //     >
  //       <CircularProgress color='inherit' />
  //     </Backdrop>
  //   )
  // }

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
          Transform Your Image
        </Typography>

        {error && (
          <Alert
            severity='error'
            sx={{ mb: 3 }}
            action={
              _profile &&
              (_profile.credits ?? 0) > 0 &&
              _profile.plan === 'free' ? (
                <Button
                  color='inherit'
                  size='small'
                  onClick={handleShowOptions}
                >
                  Show Options
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}

        {/* TEMPORARILY DISABLED AUTH: Add info alert about disabled auth */}
        <Alert severity='info' sx={{ mb: 3 }}>
          Authentication is temporarily disabled. You can generate images
          without logging in.
        </Alert>

        {!providerKeys[selectedProvider] && (
          <Alert severity='warning' sx={{ mb: 3 }}>
            The default API key has run out of credits. Please set your own{' '}
            {aiProviders.find(p => p.id === selectedProvider)?.name || 'API'}{' '}
            key to continue generating images.
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant='h6' gutterBottom>
                Upload Your Image
              </Typography>

              <ImageUpload
                onFileSelected={handleFileUpload}
                imagePreview={uploadedImageUrl}
              />

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id='ai-provider-label'>AI Provider</InputLabel>
                  <Select
                    labelId='ai-provider-label'
                    id='ai-provider'
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
                        {provider.disabled && ' (Coming Soon)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant='outlined'
                  color='primary'
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => setShowProviderKeyModal(true)}
                  startIcon={<KeyIcon />}
                >
                  {providerKeys[selectedProvider]
                    ? 'Update API Key'
                    : 'Set API Key'}
                </Button>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    id='prompt'
                    label='Custom Prompt (Optional)'
                    placeholder='Add details to your Ghibli transformation'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    variant='outlined'
                  />
                </FormControl>

                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  size='large'
                  startIcon={<AutoFixHighIcon />}
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
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant='h6' gutterBottom>
                Result
              </Typography>

              {generatedImageUrl ? (
                <Box
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <Box
                    sx={{
                      flexGrow: 1,
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative',
                      minHeight: 300,
                      mb: 2,
                    }}
                  >
                    <img
                      src={generatedImageUrl}
                      alt='Generated Ghibli-style image'
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </Box>

                  <Button
                    variant='outlined'
                    color='primary'
                    fullWidth
                    startIcon={<SaveAltIcon />}
                    onClick={handleDownloadImage}
                    sx={{ mt: 'auto' }}
                  >
                    Download Image
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    p: 4,
                    minHeight: 300,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Typography color='text.secondary' align='center'>
                    Your Ghibli-style image will appear here after generation
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <ProviderKeyModal
        open={showProviderKeyModal}
        onClose={() => setShowProviderKeyModal(false)}
        onSubmit={handleProviderKeySubmit}
        aiProvider={
          aiProviders.find(p => p.id === selectedProvider) || aiProviders[0]
        }
        onSubscribe={() => {
          setShowProviderKeyModal(false)
          setShowSubscriptionModal(true)
        }}
      />

      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      <Footer />
    </Box>
  )
}
