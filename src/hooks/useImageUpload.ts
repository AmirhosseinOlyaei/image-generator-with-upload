import { resizeImage } from '@/lib/imageUtils'
import { useCallback, useState } from 'react'

interface ImageUploadState {
  file: File | null
  preview: string | null
  uploading: boolean
  error: string | null
}

interface UseImageUploadOptions {
  maxWidth?: number
  maxHeight?: number
  maxSizeInMB?: number
  acceptedTypes?: string[]
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    maxSizeInMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options

  const [state, setState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    uploading: false,
    error: null,
  })

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`
      }

      // Check file size
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024
      if (file.size > maxSizeInBytes) {
        return `File size exceeds the maximum allowed size of ${maxSizeInMB}MB`
      }

      return null
    },
    [acceptedTypes, maxSizeInMB],
  )

  const handleFileChange = useCallback(
    async (file: File) => {
      try {
        setState({ ...state, uploading: true, error: null })

        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setState({
            ...state,
            uploading: false,
            error: validationError,
          })
          return false
        }

        // Resize image if needed
        let processedFile = file
        try {
          processedFile = await resizeImage(file, maxWidth, maxHeight)
        } catch (error) {
          console.warn('Error resizing image:', error)
          // Continue with the original file if resizing fails
        }

        // Create a preview URL
        const previewUrl = URL.createObjectURL(processedFile)

        setState({
          file: processedFile,
          preview: previewUrl,
          uploading: false,
          error: null,
        })

        return true
      } catch (error: any) {
        setState({
          ...state,
          uploading: false,
          error: error.message || 'Failed to process image',
        })
        return false
      }
    },
    [maxWidth, maxHeight, validateFile, state],
  )

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0]
        return handleFileChange(file)
      }
      return false
    },
    [handleFileChange],
  )

  const handleFileDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        return handleFileChange(file)
      }
      return false
    },
    [handleFileChange],
  )

  const reset = useCallback(() => {
    if (state.preview) {
      URL.revokeObjectURL(state.preview)
    }
    setState({
      file: null,
      preview: null,
      uploading: false,
      error: null,
    })
  }, [state.preview])

  return {
    file: state.file,
    preview: state.preview,
    uploading: state.uploading,
    error: state.error,
    handleFileSelect,
    handleFileDrop,
    handleFileChange,
    reset,
  }
}
