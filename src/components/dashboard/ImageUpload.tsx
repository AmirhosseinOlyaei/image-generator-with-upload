'use client'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  onFileSelected: (file: File | null) => void
  imagePreview: string | null
}

export default function ImageUpload({
  onFileSelected,
  imagePreview,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convertToValidPNG = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Create an image element to load the file
      const img = new window.Image()
      img.onload = () => {
        // Create a canvas to draw and convert the image
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0)

        // Convert to PNG
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Failed to convert image to PNG'))
            return
          }

          // Check if the blob size is less than 5MB
          if (blob.size > 5 * 1024 * 1024) {
            // If larger than 5MB, resize the image
            const scaleFactor = Math.sqrt((5 * 1024 * 1024) / blob.size)
            const newWidth = Math.floor(img.width * scaleFactor)
            const newHeight = Math.floor(img.height * scaleFactor)

            // Create a new canvas for the resized image
            const resizeCanvas = document.createElement('canvas')
            resizeCanvas.width = newWidth
            resizeCanvas.height = newHeight

            // Draw the resized image
            const resizeCtx = resizeCanvas.getContext('2d')
            if (!resizeCtx) {
              reject(new Error('Failed to get resize canvas context'))
              return
            }

            resizeCtx.drawImage(img, 0, 0, newWidth, newHeight)

            // Convert the resized image to PNG
            resizeCanvas.toBlob(resizedBlob => {
              if (!resizedBlob) {
                reject(new Error('Failed to convert resized image to PNG'))
                return
              }

              // Create a new File object with the PNG blob
              const pngFile = new File(
                [resizedBlob],
                file.name.replace(/\.[^/.]+$/, '') + '.png',
                {
                  type: 'image/png',
                  lastModified: file.lastModified,
                },
              )

              resolve(pngFile)
            }, 'image/png')
          } else {
            // If less than 5MB, use the original size
            const pngFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.png',
              {
                type: 'image/png',
                lastModified: file.lastModified,
              },
            )

            resolve(pngFile)
          }
        }, 'image/png')
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      // Load the image from the file
      const reader = new FileReader()
      reader.onload = e => {
        if (e.target?.result) {
          img.src = e.target.result as string
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleUpload = async (file: File) => {
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Convert the image to a valid PNG format and ensure it's under 5MB
      const processedFile = await convertToValidPNG(file)

      // Pass the processed file to the parent component
      onFileSelected(processedFile)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error processing file:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to process image',
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleClearImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileSelected(null)
    setError(null)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <input
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {error && (
        <Typography color='error' variant='body2' sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {imagePreview ? (
        <Box sx={{ position: 'relative', width: '100%', mt: 2 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 300,
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: 1,
            }}
          >
            <img
              src={imagePreview}
              alt='Uploaded preview'
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </Box>

          <Box
            sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}
          >
            <Button
              variant='outlined'
              color='primary'
              startIcon={<CloudUploadIcon />}
              onClick={handleButtonClick}
            >
              Change Image
            </Button>

            <Button
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={handleClearImage}
            >
              Remove
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: isDragging
              ? 'rgba(77, 124, 138, 0.08)'
              : 'transparent',
            transition: 'background-color 0.3s, border-color 0.3s',
            cursor: 'pointer',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <CircularProgress />
          ) : (
            <>
              <CloudUploadIcon color='primary' sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant='h6' gutterBottom>
                Drag & Drop your image here
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                or
              </Typography>
              <Button variant='contained' color='primary' component='span'>
                Browse Files
              </Button>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 2 }}
              >
                Supported formats: JPEG, PNG, WebP (will be converted to PNG)
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Maximum size: 5MB
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}
