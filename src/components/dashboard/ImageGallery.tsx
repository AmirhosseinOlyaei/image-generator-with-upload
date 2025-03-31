'use client'

import { useApp } from '@/contexts/AppContext'
import { formatDate } from '@/lib/imageUtils'
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'

// Define the image object structure
interface GeneratedImage {
  id: string
  originalImageUrl: string
  generatedImageUrl: string
  prompt: string
  provider: string
  createdAt: string
  title?: string
  isFavorite?: boolean
}

interface ImageGalleryProps {
  images: GeneratedImage[]
  loading?: boolean
  // eslint-disable-next-line no-unused-vars
  onDelete?: (id: string) => void
  // eslint-disable-next-line no-unused-vars
  onFavorite?: (id: string, favorite: boolean) => void
  // eslint-disable-next-line no-unused-vars
  onUpdateTitle?: (id: string, title: string) => void
}

export default function ImageGallery({
  images,
  loading = false,
  onDelete,
  onFavorite,
  onUpdateTitle,
}: ImageGalleryProps) {
  const { addNotification } = useApp()

  // State for managing image actions
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null,
  )
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [titleDialogOpen, setTitleDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  // eslint-disable-next-line no-undef
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Handle opening the action menu
  const handleMenuOpen = (
    // eslint-disable-next-line no-undef
    event: React.MouseEvent<HTMLElement>,
    image: GeneratedImage,
  ) => {
    setAnchorEl(event.currentTarget)
    setSelectedImage(image)
  }

  // Handle closing the action menu
  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  // Open image details dialog
  const handleViewDetails = () => {
    handleMenuClose()
    setDetailsOpen(true)
  }

  // Open edit title dialog
  const handleEditTitle = () => {
    if (selectedImage) {
      setNewTitle(selectedImage.title || '')
      setTitleDialogOpen(true)
    }
    handleMenuClose()
  }

  // Handle saving the new title
  const handleSaveTitle = () => {
    if (selectedImage && onUpdateTitle) {
      onUpdateTitle(selectedImage.id, newTitle)
      addNotification({
        message: 'Image title updated',
        type: 'success',
      })
    }
    setTitleDialogOpen(false)
  }

  // Handle favoriting an image
  const handleFavoriteImage = () => {
    if (selectedImage && onFavorite) {
      onFavorite(selectedImage.id, !selectedImage.isFavorite)
      addNotification({
        message: selectedImage.isFavorite
          ? 'Image removed from favorites'
          : 'Image added to favorites',
        type: 'success',
      })
    }
    handleMenuClose()
  }

  // Handle deleting an image
  const handleDeleteImage = () => {
    if (selectedImage && onDelete) {
      onDelete(selectedImage.id)
      addNotification({
        message: 'Image deleted successfully',
        type: 'info',
      })
    }
    handleMenuClose()
  }

  // Handle downloading an image
  const handleDownloadImage = (
    imageUrl: string,
    filename: string = 'ghibli-vision-image',
  ) => {
    // Create a temporary link element
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${filename}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    handleMenuClose()

    addNotification({
      message: 'Image downloaded successfully',
      type: 'success',
    })
  }

  // Get provider name in readable format
  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI'
      case 'stability':
        return 'Stability AI'
      case 'midjourney':
        return 'Midjourney'
      case 'leonardo':
        return 'Leonardo AI'
      default:
        return provider
    }
  }

  // Create skeleton cards for loading state
  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <Box
          key={`skeleton-${index}`}
          sx={{
            width: { xs: '100%', sm: '50%', md: '33.33%' },
            padding: 1.5,
            boxSizing: 'border-box',
          }}
        >
          <Card
            elevation={3}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Skeleton variant='rectangular' height={200} animation='wave' />
            <CardContent>
              <Skeleton
                variant='text'
                width='70%'
                height={24}
                animation='wave'
              />
              <Skeleton
                variant='text'
                width='40%'
                height={20}
                animation='wave'
              />
            </CardContent>
            <CardActions
              sx={{ mt: 'auto', p: 2, justifyContent: 'space-between' }}
            >
              <Skeleton
                variant='circular'
                width={36}
                height={36}
                animation='wave'
              />
              <Box>
                <Skeleton
                  variant='circular'
                  width={36}
                  height={36}
                  animation='wave'
                  sx={{ mr: 1, display: 'inline-block' }}
                />
                <Skeleton
                  variant='circular'
                  width={36}
                  height={36}
                  animation='wave'
                  sx={{ display: 'inline-block' }}
                />
              </Box>
            </CardActions>
          </Card>
        </Box>
      ))
  }

  // If loading, return skeleton cards
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {renderSkeletons()}
      </Box>
    )
  }

  // If no images, return a message
  if (images.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography variant='h6' gutterBottom>
          No images yet
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Start by uploading an image to generate Ghibli-style artwork
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {images.map(image => (
          <Box
            key={image.id}
            sx={{
              width: { xs: '100%', sm: '50%', md: '33.33%' },
              padding: 1.5,
              boxSizing: 'border-box',
            }}
          >
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition:
                  'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ position: 'relative', pt: '70%' }}>
                <CardMedia
                  component='img'
                  image={image.generatedImageUrl}
                  alt={image.title || 'Generated image'}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {image.isFavorite && (
                  <Chip
                    label='Favorite'
                    color='primary'
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      backgroundColor: 'rgba(25, 118, 210, 0.9)',
                    }}
                  />
                )}
              </Box>

              <CardContent>
                <Typography variant='h6' noWrap>
                  {image.title || 'Untitled Artwork'}
                </Typography>
                <Typography variant='body2' color='text.secondary' noWrap>
                  {formatDate(image.createdAt)} •{' '}
                  {getProviderName(image.provider)}
                </Typography>
              </CardContent>

              <CardActions
                sx={{ mt: 'auto', p: 2, justifyContent: 'space-between' }}
              >
                <Tooltip title='Download'>
                  <IconButton
                    onClick={() =>
                      handleDownloadImage(
                        image.generatedImageUrl,
                        image.title || 'ghibli-vision-image',
                      )
                    }
                    aria-label='download'
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>

                <Box>
                  <Tooltip title='View details'>
                    <IconButton
                      onClick={() => {
                        setSelectedImage(image)
                        setDetailsOpen(true)
                      }}
                      aria-label='details'
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    onClick={event => handleMenuOpen(event, image)}
                    aria-label='more options'
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Image details dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth='md'
        fullWidth
      >
        {selectedImage && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              {selectedImage.title || 'Untitled Artwork'}
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  mx: -2,
                }}
              >
                <Box sx={{ flex: 1, px: 2, mb: { xs: 3, md: 0 } }}>
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Original Image
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '75%',
                      mb: 2,
                    }}
                  >
                    <Image
                      src={selectedImage.originalImageUrl}
                      alt='Original image'
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </Box>

                <Box sx={{ flex: 1, px: 2 }}>
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Generated Image
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '75%',
                      mb: 2,
                    }}
                  >
                    <Image
                      src={selectedImage.generatedImageUrl}
                      alt='Generated image'
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  gutterBottom
                >
                  Prompt
                </Typography>
                <Typography variant='body1' paragraph>
                  {selectedImage.prompt}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  <Chip
                    label={`Generated with ${getProviderName(selectedImage.provider)}`}
                    variant='outlined'
                    size='small'
                  />
                  <Chip
                    label={formatDate(selectedImage.createdAt)}
                    variant='outlined'
                    size='small'
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownloadImage(
                    selectedImage.generatedImageUrl,
                    selectedImage.title || 'ghibli-vision-image',
                  )
                }
              >
                Download
              </Button>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit title dialog */}
      <Dialog open={titleDialogOpen} onClose={() => setTitleDialogOpen(false)}>
        <DialogTitle>Edit Image Title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Title'
            fullWidth
            variant='outlined'
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTitleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTitle} variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <InfoIcon fontSize='small' sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditTitle}>
          <EditIcon fontSize='small' sx={{ mr: 1 }} />
          Edit Title
        </MenuItem>
        <MenuItem onClick={handleFavoriteImage}>
          <StarIcon fontSize='small' sx={{ mr: 1 }} />
          {selectedImage?.isFavorite
            ? 'Remove from Favorites'
            : 'Add to Favorites'}
        </MenuItem>
        <MenuItem onClick={handleDeleteImage}>
          <DeleteIcon fontSize='small' sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}
