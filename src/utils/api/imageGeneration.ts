import axios from 'axios'

// Define the base URL for the Cloudflare Worker
// In development, this will be localhost, in production it will be your deployed worker URL
const WORKER_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://ghibli-vision-worker.workers.dev' // This will need to be updated with your actual worker URL after deployment
    : 'http://localhost:8787'

export interface GenerateImageParams {
  image: File
  prompt?: string
  provider: string
  apiKey?: string
}

export async function generateImage({
  image,
  prompt = '',
  provider,
  apiKey,
}: GenerateImageParams): Promise<{
  success: boolean
  imageUrl?: string
  error?: string
}> {
  try {
    // Create FormData to send the image and parameters
    const formData = new FormData()
    formData.append('image', image)
    formData.append('prompt', prompt)
    formData.append('provider', provider)

    if (apiKey) {
      formData.append('apiKey', apiKey)
    }

    // First try the Cloudflare Worker
    try {
      const response = await axios.post(
        `${WORKER_BASE_URL}/api/worker/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      return {
        success: true,
        imageUrl: response.data.imageUrl,
      }
    } catch (workerError) {
      // If the worker fails, fall back to the original API route
      const fallbackResponse = await axios.post('/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return {
        success: true,
        imageUrl: fallbackResponse.data.imageUrl,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
