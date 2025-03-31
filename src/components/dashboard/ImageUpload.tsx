'use client'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useRef, useState } from 'react'

interface ImageUploadProps {
  onFileUpload: (file: File | null) => void
}

export default function ImageUpload({ onFileUpload }: ImageUploadProps) {
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

            // Create a new canvas with the scaled dimensions
            const scaledCanvas = document.createElement('canvas')
            scaledCanvas.width = newWidth
            scaledCanvas.height = newHeight

            // Draw the scaled image
            const scaledCtx = scaledCanvas.getContext('2d')
            if (!scaledCtx) {
              reject(new Error('Failed to get scaled canvas context'))
              return
            }
            scaledCtx.drawImage(img, 0, 0, newWidth, newHeight)

            // Convert to PNG again
            scaledCanvas.toBlob(
              scaledBlob => {
                if (!scaledBlob) {
                  reject(new Error('Failed to convert scaled image to PNG'))
                  return
                }

                // Create a new File object from the blob
                const processedFile = new File([scaledBlob], file.name, {
                  type: 'image/png',
                  lastModified: Date.now(),
                })
                resolve(processedFile)
              },
              'image/png',
              0.9,
            )
          } else {
            // If already under 5MB, use the original blob
            const processedFile = new File([blob], file.name, {
              type: 'image/png',
              lastModified: Date.now(),
            })
            resolve(processedFile)
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
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      await processFile(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        setUploading(false)
        return
      }

      // Process the file (convert to PNG and resize if needed)
      const processedFile = await convertToValidPNG(file)

      // Pass the processed file to the parent component
      onFileUpload(processedFile)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Error processing file')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <input
        type='file'
        accept='image/*'
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && (
        <Typography color='error' sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

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
            <Typography variant='caption' color='text.secondary' sx={{ mt: 2 }}>
              Supported formats: JPEG, PNG, WebP (will be converted to PNG)
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Maximum size: 5MB
            </Typography>
          </>
        )}
      </Box>
    </Box>
  )
}
