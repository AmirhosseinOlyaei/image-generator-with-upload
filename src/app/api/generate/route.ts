import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import axios from 'axios'

// Function for calling different provider APIs
async function callProviderApi(
  provider: string,
  imageFile: File,
  prompt: string,
  apiKey?: string,
) {
  // Convert image file to base64 for API requests
  const arrayBuffer = await imageFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Image = buffer.toString('base64')

  // Prepare the prompt for image generation
  const fullPrompt =
    `Transform this image into Studio Ghibli style. ${prompt}`.trim()

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(base64Image, fullPrompt, apiKey)
      case 'stability':
        if (!apiKey && !process.env.STABILITY_API_KEY) {
          throw new Error(
            'Stability AI API key not found. Please provide your own API key.',
          )
        }
        return await callStabilityAI(base64Image, fullPrompt, apiKey)
      case 'midjourney':
        if (!apiKey && !process.env.MIDJOURNEY_API_KEY) {
          throw new Error(
            'Midjourney API key not found. Please provide your own API key.',
          )
        }
        return await callMidjourney(base64Image, fullPrompt, apiKey)
      case 'leonardo':
        if (!apiKey && !process.env.LEONARDO_API_KEY) {
          throw new Error(
            'Leonardo AI API key not found. Please provide your own API key.',
          )
        }
        return await callLeonardoAI(base64Image, fullPrompt, apiKey)
      default:
        throw new Error('Invalid AI provider')
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error calling ${provider} API:`, error)
    throw error
  }
}

// OpenAI DALL-E 3 API implementation
async function callOpenAI(
  base64Image: string,
  prompt: string,
  apiKey?: string,
) {
  const key = apiKey || process.env.OPENAI_API_KEY

  if (!key) {
    throw new Error(
      'OpenAI API key not found. Please provide your own API key.',
    )
  }

  const openai = new OpenAI({
    apiKey: key,
  })

  try {
    // eslint-disable-next-line no-console
    console.log('Calling OpenAI API with prompt:', prompt)

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

    const imageBuffer = Buffer.from(base64Data, 'base64')

    const fileSizeInMB = imageBuffer.length / (1024 * 1024)
    if (fileSizeInMB > 5) {
      throw new Error(
        'Image size exceeds 5MB limit. Please use a smaller image.',
      )
    }

    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing images and describing them in detail for artistic transformation.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this person/image in detail so it can be transformed into Studio Ghibli style. Focus on facial features, hair, clothing, and expression.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const imageDescription =
      visionResponse.choices[0]?.message?.content || 'A person'

    const enhancedPrompt = `Create a Studio Ghibli style character based on this exact description: ${imageDescription}. 
    
    The character should have:
    1. The same facial features, expression, and pose as in the original image
    2. Soft watercolor-like textures with delicate brush strokes typical of Ghibli films
    3. Gentle color gradients and simplified but expressive features
    4. The same hairstyle and clothing as the original, but in Ghibli style
    5. A slightly stylized appearance while maintaining recognizable likeness
    
    Original prompt: ${prompt}`

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('OpenAI returned empty response')
    }

    // eslint-disable-next-line no-console
    console.log('OpenAI response received:', response.data[0].url)

    return response.data[0].url
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OpenAI API error:', error)
    throw new Error(
      `Failed to generate image with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

// Stability AI API implementation
async function callStabilityAI(
  base64Image: string,
  prompt: string,
  apiKey?: string,
) {
  const key = apiKey || process.env.STABILITY_API_KEY

  try {
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      {
        init_image: base64Image,
        prompt: prompt,
        cfg_scale: 7,
        samples: 1,
        steps: 30,
        style_preset: 'anime',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${key}`,
        },
      },
    )

    return response.data.artifacts[0].base64
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Stability AI API error:', error)
    throw new Error('Failed to generate image with Stability AI')
  }
}

// Midjourney API implementation (via third-party API)
async function callMidjourney(
  _base64Image: string,
  _prompt: string,
  _apiKey?: string,
) {
  try {
    // This is a placeholder for a Midjourney API call
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Return a placeholder image URL
    return 'https://placehold.co/1024x1024/EEE/31343C?text=Midjourney+API+Placeholder'
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Midjourney API error:', error)
    throw new Error('Failed to generate image with Midjourney')
  }
}

// Leonardo AI API implementation
async function callLeonardoAI(
  _base64Image: string,
  _prompt: string,
  _apiKey?: string,
) {
  try {
    // This is a placeholder for a Leonardo AI API call
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Return a placeholder image URL
    return 'https://placehold.co/1024x1024/EEE/31343C?text=Leonardo+AI+API+Placeholder'
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Leonardo AI API error:', error)
    throw new Error('Failed to generate image with Leonardo AI')
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get the uploaded image file
    const imageFile = formData.get('image') as File
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 },
      )
    }

    // Get the prompt and provider from the form data
    const prompt = (formData.get('prompt') as string) || ''
    const provider = (formData.get('provider') as string) || 'openai'
    const apiKey = (formData.get('apiKey') as string) || undefined

    // Call the appropriate provider API
    const imageUrl = await callProviderApi(provider, imageFile, prompt, apiKey)

    // Return the generated image URL
    return NextResponse.json({ imageUrl })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in API route:', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
