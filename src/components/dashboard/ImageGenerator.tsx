'use client'

import { useApp } from '@/contexts/AppContext'
import { useImageUpload } from '@/hooks/useImageUpload'
import { generateImage } from '@/lib/apiService'
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
  AutoFixHigh as MagicWandIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'

// Define provider type for proper typing
type Provider = 'openai' | 'stability' | 'midjourney' | 'leonardo'

interface ImageGeneratorProps {
  onGenerateSuccess: (
    // eslint-disable-next-line no-unused-vars
    originalImage: string,
    // eslint-disable-next-line no-unused-vars
    generatedImage: string,
    // eslint-disable-next-line no-unused-vars
    prompt: string,
    // eslint-disable-next-line no-unused-vars
    provider: string,
  ) => void
  freeGenerationsLeft?: number
  subscriptionTier?: string
}

const DEFAULT_PROMPT =
  'Transform this image into Studio Ghibli style artwork with soft pastel colors, detailed natural elements, and whimsical characters'

export default function ImageGenerator({
  onGenerateSuccess,
  freeGenerationsLeft = 0,
  subscriptionTier = 'free',
}: ImageGeneratorProps) {
  const { addNotification, getProviderKey, userPreferences, addRecentPrompt } =
    useApp()

  const {
    file,
    preview,
    error: uploadError,
    handleFileSelect,
    handleFileDrop,
    reset: resetUpload,
  } = useImageUpload({ maxSizeInMB: 10 })

  // State for image generation
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [provider, setProvider] = useState<Provider>(
    (userPreferences.defaultProvider || 'openai') as Provider,
  )
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false)

  // Check if the user has a key for the selected provider
  const hasProviderKey = Boolean(getProviderKey(provider))

  // Sample prompt suggestions
  const promptSuggestions = [
    'Transform this image into a magical Studio Ghibli world with lush scenery and fantastical elements',
    'Reimagine this photo as a scene from a Hayao Miyazaki film with whimsical characters and dreamlike landscapes',
    'Convert this image into Ghibli animation style with vibrant colors, detailed backgrounds, and ethereal lighting',
    "Recreate this scene with Ghibli's signature hand-drawn aesthetic, adding mystical creatures and serene natural elements",
    'Redesign this photo in the style of "Spirited Away" with enchanted spirits and otherworldly architecture',
  ]

  // Handle drop zone events
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileDrop([event.dataTransfer.files[0]])
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // Handle provider change
  const handleProviderChange = (event: SelectChangeEvent<string>) => {
    setProvider(event.target.value as Provider)
  }

  // Reset the generation process
  const handleReset = () => {
    setGeneratedImage(null)
    setError(null)
  }

  // Generate image with the selected provider
  const handleGenerate = async () => {
    if (!file) {
      setError('Please upload an image first')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    try {
      setGenerating(true)
      setError(null)

      // Check if user needs to use a custom API key
      if (
        freeGenerationsLeft <= 0 &&
        subscriptionTier === 'free' &&
        !hasProviderKey
      ) {
        throw new Error(
          `You've used all your free generations. Please subscribe or enter a custom ${provider} API key in your profile.`,
        )
      }

      // Get the provider key if available
      const apiKey = getProviderKey(provider)

      // Call the generateImage service
      const result = await generateImage(provider, file, prompt, apiKey)

      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'Failed to generate image')
      }

      // Save the prompt to recent prompts
      addRecentPrompt(prompt)

      // Set the generated image
      setGeneratedImage(result.imageUrl)

      // Notify parent component
      onGenerateSuccess(preview || '', result.imageUrl, prompt, provider)

      // Show success notification
      addNotification({
        message: 'Image generated successfully!',
        type: 'success',
      })
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to generate image',
      )

      addNotification({
        message:
          error instanceof Error ? error.message : 'Failed to generate image',
        type: 'error',
      })
    } finally {
      setGenerating(false)
    }
  }

  // Get provider label
  const getProviderLabel = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return 'OpenAI DALL-E'
      case 'stability':
        return 'Stability AI'
      case 'midjourney':
        return 'Midjourney'
      case 'leonardo':
        return 'Leonardo AI'
      default:
        return providerId
    }
  }

  // Apply a prompt suggestion
  const applyPromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
    setShowPromptSuggestions(false)
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography
        variant='h5'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <MagicWandIcon color='primary' />
        Generate Ghibli Art
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
        }}
      >
        {/* Left Column - Image Upload */}
        <Box sx={{ flex: 1 }}>
          <Typography variant='subtitle1' gutterBottom>
            1. Upload Your Image
          </Typography>

          {!preview ? (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                mb: 2,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
              onClick={() => document.getElementById('image-upload')?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                id='image-upload'
                type='file'
                accept='image/jpeg,image/png,image/webp'
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
              />
              <Typography align='center' color='text.secondary'>
                Drag & drop an image here, or click to browse
              </Typography>
              <Typography
                variant='caption'
                align='center'
                color='text.secondary'
                sx={{ mt: 1 }}
              >
                Supported formats: JPEG, PNG, WebP (max 10MB)
              </Typography>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                sx={{
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  paddingTop: '75%', // 4:3 aspect ratio
                }}
              >
                <Image
                  src={preview}
                  alt='Preview'
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <IconButton
                aria-label='remove image'
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'background.paper' },
                }}
                onClick={resetUpload}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}

          {uploadError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}

          {/* Provider Selection */}
          <Typography variant='subtitle1' gutterBottom sx={{ mt: 3 }}>
            2. Choose AI Provider
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id='provider-label'>AI Provider</InputLabel>
            <Select
              labelId='provider-label'
              value={provider}
              label='AI Provider'
              onChange={handleProviderChange}
            >
              <MenuItem value='openai'>{getProviderLabel('openai')}</MenuItem>
              <MenuItem value='stability'>
                {getProviderLabel('stability')}
              </MenuItem>
              <MenuItem value='midjourney'>
                {getProviderLabel('midjourney')}
              </MenuItem>
              <MenuItem value='leonardo'>
                {getProviderLabel('leonardo')}
              </MenuItem>
            </Select>
            <FormHelperText>
              {hasProviderKey
                ? `Using your custom ${getProviderLabel(provider)} API key`
                : `Using app's ${getProviderLabel(provider)} credits`}
            </FormHelperText>
          </FormControl>

          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Free Generations Left:{' '}
            <Chip
              size='small'
              label={freeGenerationsLeft}
              color={freeGenerationsLeft > 0 ? 'primary' : 'default'}
            />
          </Typography>
        </Box>

        {/* Right Column - Prompt & Generation */}
        <Box sx={{ flex: 1 }}>
          <Typography variant='subtitle1' gutterBottom>
            3. Customize Your Prompt
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label='Describe how to transform your image'
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            sx={{ mb: 1 }}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Button
              size='small'
              onClick={() => setShowPromptSuggestions(!showPromptSuggestions)}
            >
              Need ideas?
            </Button>
            <Button
              size='small'
              startIcon={<RefreshIcon />}
              onClick={() => setPrompt(DEFAULT_PROMPT)}
            >
              Reset to default
            </Button>
          </Box>

          {showPromptSuggestions && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='caption' color='text.secondary' gutterBottom>
                Click a suggestion to use it:
              </Typography>
              <Stack spacing={1}>
                {promptSuggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={
                      suggestion.length > 50
                        ? `${suggestion.substring(0, 50)}...`
                        : suggestion
                    }
                    onClick={() => applyPromptSuggestion(suggestion)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Typography variant='subtitle1' gutterBottom sx={{ mt: 4 }}>
            4. Generate Your Ghibli Artwork
          </Typography>

          <Button
            variant='contained'
            size='large'
            fullWidth
            startIcon={
              generating ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <MagicWandIcon />
              )
            }
            onClick={handleGenerate}
            disabled={generating || !file || !prompt.trim()}
            sx={{ mb: 2 }}
          >
            {generating ? 'Generating...' : 'Generate Ghibli Art'}
          </Button>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {generatedImage && (
            <Box sx={{ mt: 3 }}>
              <Typography variant='subtitle1' gutterBottom>
                Generated Artwork:
              </Typography>
              <Box
                sx={{
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  paddingTop: '75%', // 4:3 aspect ratio
                }}
              >
                <Image
                  src={generatedImage}
                  alt='Generated Ghibli artwork'
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Button
                variant='outlined'
                sx={{ mt: 2 }}
                startIcon={<RefreshIcon />}
                onClick={handleReset}
              >
                Generate Another
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Tooltip title='How it works'>
              <IconButton size='small' sx={{ mr: 1 }}>
                <InfoIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Typography variant='caption' color='text.secondary'>
              Your image will be transformed using AI to match the Ghibli art
              style.
              {freeGenerationsLeft <= 0 && subscriptionTier === 'free'
                ? " You've used all free generations. Subscribe for more or add your own API key."
                : freeGenerationsLeft > 0
                  ? ` You have ${freeGenerationsLeft} free generation${freeGenerationsLeft > 1 ? 's' : ''} left.`
                  : ''}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
