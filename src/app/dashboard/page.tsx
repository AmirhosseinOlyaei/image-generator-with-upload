'use client'

import ImageUpload from '@/components/dashboard/ImageUpload'
import ProviderKeyModal from '@/components/dashboard/ProviderKeyModal'
import SubscriptionModal from '@/components/dashboard/SubscriptionModal'
import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { useApp } from '@/contexts/AppContext'
import { UserProfile } from '@/lib/supabase'
import { generateImage } from '@/utils/api/imageGeneration'
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
    description: 'AI platform with fine-tuned Ghibli aesthetic capabilities',
    disabled: true,
  },
]

export default function Dashboard() {
  const _router = useRouter()
  const { user: _contextUser, isAuthLoading: _isAuthLoading } = useApp()

  // TEMPORARILY DISABLED AUTH: Set defaults without requiring authentication
  const [_user, _setUser] = React.useState<UserProfile | null>(null)
  const [profile, _setProfile] = React.useState<UserProfile | null>(null)
  const [_loading, _setLoading] = React.useState(false) // Changed to false to skip loading state
  const [generating, setGenerating] = React.useState(false)
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string | null>(
    null,
  )
  const [generatedImageUrl, setGeneratedImageUrl] = React.useState<
    string | null
  >(null)
  const [selectedProvider, setSelectedProvider] = React.useState('openai')
  const [providerKeys, setProviderKeys] = React.useState<
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

  const handleProviderChange = (event: any) => {
    const newProvider = event.target.value
    // Only allow changing to enabled providers
    const provider = aiProviders.find(p => p.id === newProvider)
    if (provider && !provider.disabled) {
      setSelectedProvider(newProvider)
    }
  }

  const handleCustomApiKeySubmit = async (providerKey: string) => {
    setProviderKeys({ ...providerKeys, [selectedProvider]: providerKey })
    setShowProviderKeyModal(false)

    // TEMPORARILY DISABLED AUTH: Comment out profile update
    // // Update the user's custom API key in the database
    // if (user) {
    //   const { error } = await supabase
    //     .from('profiles')
    //     .update({ custom_api_key: providerKey })
    //     .eq('id', user.id)

    //   if (error) {
    //     setError('Failed to save your API key. Please try again.')
    //   }
    // }
  }

  const handleGenerateImage = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first')
      return
    }

    setGenerating(true)
    setError(null)
    setGeneratedImageUrl(null)

    try {
      const imageGenerationResult = await generateImage({
        image: uploadedImage,
        prompt:
          'Transform this image into Studio Ghibli style: ' + (prompt || ''),
        provider: selectedProvider,
        apiKey: providerKeys?.[selectedProvider],
      })

      if (!imageGenerationResult.success || !imageGenerationResult.imageUrl) {
        throw new Error(
          imageGenerationResult.error || 'Failed to generate image',
        )
      }

      setGeneratedImageUrl(imageGenerationResult.imageUrl)
      setGenerating(false)
    } catch (error) {
      console.error('Error generating image:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while generating the image',
      )
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
        console.error('Download error:', error)
        setError('Failed to download image. Please try again.')
      }
    }
  }

  const handleShowOptions = () => {
    // Determine which modal to show
    if (profile && (profile.credits ?? 0) > 0 && profile.plan === 'free') {
      setShowProviderKeyModal(true)
    }
  }

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
              profile &&
              (profile.credits ?? 0) > 0 &&
              profile.plan === 'free' ? (
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
                      <MenuItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id='prompt-label'>
                    Custom Prompt (Optional)
                  </InputLabel>
                  <TextField
                    id='prompt'
                    label='Custom Prompt'
                    placeholder='Add details to your Ghibli transformation'
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPrompt(e.target.value)
                    }
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
                    startIcon={<SaveAltRoundedIcon />}
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
        onSubmit={handleCustomApiKeySubmit}
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
