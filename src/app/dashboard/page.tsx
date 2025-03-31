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
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
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
  const router = useRouter()
  const { user: contextUser, isAuthLoading } = useApp()
  const supabase = createClientComponentClient()

  // TEMPORARILY DISABLED AUTH: Set defaults without requiring authentication
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false) // Changed to false to skip loading state
  const [generating, setGenerating] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  )
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [showProviderKeyModal, setShowProviderKeyModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // TEMPORARILY DISABLED AUTH: Comment out authentication check
  // useEffect(() => {
  //   async function getUser() {
  //     try {
  //       // Get user
  //       const {
  //         data: { session },
  //       } = await supabase.auth.getSession()

  //       if (!session) {
  //         router.push('/auth/signin')
  //         return
  //       }

  //       setUser(session.user)

  //       if (session.user) {
  //         // Get user profile
  //         const { data: profileData, error: profileError } = await supabase
  //           .from('profiles')
  //           .select('*')
  //           .eq('id', session.user.id)
  //           .single()

  //         if (profileError) {
  //           if (profileError.code === 'PGRST116') {
  //             // Profile doesn't exist yet, create it using the server API
  //             try {
  //               // Call our server-side API to create the profile
  //               const response = await fetch('/api/profile/create', {
  //                 method: 'POST',
  //                 headers: {
  //                   'Content-Type': 'application/json',
  //                 },
  //               })

  //               const result = await response.json()

  //               if (response.ok && result.success && result.profile) {
  //                 setProfile(result.profile as UserProfile)
  //               } else {
  //                 setError(
  //                   'Error creating profile. Please try refreshing the page or contact support.',
  //                 )
  //               }
  //             } catch (err) {
  //               setError(
  //                 'Error creating profile. Please try refreshing the page or contact support.',
  //               )
  //             }
  //           } else {
  //             setError(
  //               'Error fetching profile. Please try refreshing the page or contact support.',
  //             )
  //           }
  //         } else {
  //           setProfile(profileData as UserProfile)
  //         }
  //       }
  //     } catch (error) {
  //       setError('Authentication error. Please try signing in again.')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   getUser()
  // }, [router, supabase])

  // TEMPORARILY DISABLED AUTH: Comment out redirect
  // useEffect(() => {
  //   // Redirect if not authenticated and not loading
  //   if (!loading && !user && !isAuthLoading && !contextUser) {
  //     router.push('/auth/signin')
  //   }
  // }, [loading, user, isAuthLoading, contextUser, router])

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

  const handleProviderChange = (event: SelectChangeEvent<string>) => {
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
    if (!uploadedImage || !selectedProvider) return

    setGenerating(true)
    setError(null)
    setGeneratedImageUrl(null)

    // Use window.FormData to ensure it's defined in the browser context
    const formData = new window.FormData()
    formData.append('image', uploadedImage)
    formData.append('provider', selectedProvider)

    try {
      // TEMPORARILY DISABLED AUTH: Comment out profile checks
      // // Check if user is on free tier and has already used their free generation
      // if (
      //   profile &&
      //   profile.plan === 'free' &&
      //   (profile.credits ?? 0) > 0 &&
      //   !providerKeys[selectedProvider]
      // ) {
      //   setShowProviderKeyModal(true)
      //   setGenerating(false)
      //   return
      // }

      // Add API key if available
      if (providerKeys && providerKeys[selectedProvider]) {
        formData.append('apiKey', providerKeys[selectedProvider])
      }

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

      // TEMPORARILY DISABLED AUTH: Comment out profile update
      // // If this was a free tier user's first generation, update their usage in the database
      // if (
      //   user &&
      //   profile &&
      //   profile.plan === 'free' &&
      //   (profile.credits ?? 0) === 0 &&
      //   !providerKeys[selectedProvider]
      // ) {
      //   const { error } = await supabase
      //     .from('profiles')
      //     .update({ credits: 1 })
      //     .eq('id', user.id)

      //   if (error) {
      //     setError(
      //       'Failed to update your usage. Your transformation was successful, but you may see this free option again.',
      //     )
      //   } else {
      //     // Update local state
      //     setProfile({ ...profile, credits: 1 })
      //   }
      // }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to generate image. Please try again.',
      )
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
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id='provider-select-label'>
                    AI Provider
                  </InputLabel>
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
                        sx={provider.disabled ? { opacity: 0.6 } : {}}
                      >
                        <Box>
                          <Typography variant='body1'>
                            {provider.name}
                            {provider.disabled && ' (Coming Soon)'}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {provider.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
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
