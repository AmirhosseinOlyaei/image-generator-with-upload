/**
 * Utility functions for handling images and API requests to AI providers
 */

/**
 * Converts a File object to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = error => reject(error)
  })
}

/**
 * Resizes an image to the specified width and height
 */
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = event => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert canvas to blob
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'))
            return
          }

          // Create a new File object from the blob
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          })

          resolve(resizedFile)
        }, file.type)
      }
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
}

/**
 * Calls the OpenAI API to generate an image based on a prompt and reference image
 */
export const callOpenAI = async (
  image: string,
  prompt: string,
  apiKey: string,
) => {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'OpenAI API request failed')
  }

  const data = await response.json()
  return data.data[0].url
}

/**
 * Calls the Stability AI API to generate an image based on a prompt and reference image
 */
export const callStabilityAI = async (
  image: string,
  prompt: string,
  apiKey: string,
) => {
  const response = await fetch(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
        init_image: image,
        image_strength: 0.35,
        cfg_scale: 7,
        samples: 1,
        steps: 30,
      }),
    },
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Stability AI API request failed')
  }

  const data = await response.json()
  return `data:image/png;base64,${data.artifacts[0].base64}`
}

/**
 * Formats a date for display
 */
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Safely truncates a string to the specified length
 */
export const truncate = (str: string, length: number) => {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}
