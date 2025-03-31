import axios from 'axios'
import OpenAI from 'openai'

// Define ExecutionContext interface for Cloudflare Workers
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
}

export interface Env {
  // Environment variables
  OPENAI_API_KEY: string
  STABILITY_API_KEY: string
  MIDJOURNEY_API_KEY: string
  LEONARDO_API_KEY: string
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
}

// Function for calling different provider APIs
async function callProviderApi(
  provider: string,
  imageBase64: string,
  prompt: string,
  apiKey?: string,
  env?: Env,
) {
  // Prepare the prompt for image generation
  const fullPrompt =
    `Transform this image into Studio Ghibli style. ${prompt}`.trim()

  switch (provider) {
    case 'openai':
      return await callOpenAI(imageBase64, fullPrompt, apiKey, env)
    case 'stability':
      // Check if API key is available
      if (!apiKey && !env?.STABILITY_API_KEY) {
        throw new Error(
          'Stability AI API key not found. Please provide your own API key.',
        )
      }
      return await callStabilityAI(imageBase64, fullPrompt, apiKey, env)
    case 'midjourney':
      // Check if API key is available
      if (!apiKey && !env?.MIDJOURNEY_API_KEY) {
        throw new Error(
          'Midjourney API key not found. Please provide your own API key.',
        )
      }
      return await callMidjourney(imageBase64, fullPrompt, apiKey, env)
    case 'leonardo':
      // Check if API key is available
      if (!apiKey && !env?.LEONARDO_API_KEY) {
        throw new Error(
          'Leonardo AI API key not found. Please provide your own API key.',
        )
      }
      return await callLeonardoAI(imageBase64, fullPrompt, apiKey, env)
    default:
      throw new Error('Invalid AI provider')
  }
}

// OpenAI DALL-E 3 API implementation
async function callOpenAI(
  base64Image: string,
  prompt: string,
  apiKey?: string,
  env?: Env,
) {
  const key = apiKey || env?.OPENAI_API_KEY

  if (!key) {
    throw new Error(
      'OpenAI API key not found. Please provide your own API key.',
    )
  }

  const openai = new OpenAI({
    apiKey: key,
  })

  // Remove any data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

  // Check file size (OpenAI limit is 20MB for API calls)
  const fileSizeInBytes = Math.ceil((base64Data.length * 3) / 4)
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024)

  if (fileSizeInMB > 20) {
    throw new Error(
      'Image size exceeds 20MB limit. Please use a smaller image.',
    )
  }

  // First, use the GPT-4o model to analyze the image
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

  // Now use DALL-E 3 to generate a Ghibli-style version based on the description
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

  return response.data[0].url
}

// Stability AI API implementation
async function callStabilityAI(
  base64Image: string,
  prompt: string,
  apiKey?: string,
  env?: Env,
) {
  const key = apiKey || env?.STABILITY_API_KEY

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

  // Extract image URL from response
  return response.data.artifacts[0].base64
}

// Midjourney API implementation (via third-party API)
async function callMidjourney(
  base64Image: string,
  prompt: string,
  apiKey?: string,
  env?: Env,
) {
  const key = apiKey || env?.MIDJOURNEY_API_KEY

  const response = await axios.post(
    'https://api.midjourney.com/v1/imagine',
    {
      image: base64Image,
      prompt: prompt,
      style: 'ghibli',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    },
  )

  return response.data.imageUrl
}

// Leonardo AI API implementation
async function callLeonardoAI(
  base64Image: string,
  prompt: string,
  apiKey?: string,
  env?: Env,
) {
  const key = apiKey || env?.LEONARDO_API_KEY

  const uploadResponse = await axios.post(
    'https://cloud.leonardo.ai/api/rest/v1/init-image',
    {
      image: `data:image/jpeg;base64,${base64Image}`,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    },
  )

  const imageId = uploadResponse.data.id

  const generationResponse = await axios.post(
    'https://cloud.leonardo.ai/api/rest/v1/generations',
    {
      prompt: prompt,
      imageId: imageId,
      modelId: 'e316348f-7773-490e-adcd-46757c738eb7', // Anime style model
      width: 1024,
      height: 1024,
      num_images: 1,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    },
  )

  const generationId = generationResponse.data.generationId

  let attempts = 0
  while (attempts < 30) {
    const resultResponse = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      },
    )

    if (resultResponse.data.generations_by_pk.status === 'COMPLETE') {
      return resultResponse.data.generations_by_pk.generated_images[0].url
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
    attempts++
  }

  throw new Error('Leonardo AI generation timed out')
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    if (
      request.method !== 'POST' ||
      !request.url.endsWith('/api/worker/generate')
    ) {
      return new Response('Not Found', { status: 404 })
    }

    try {
      const formData = await request.formData()
      const imageFile = formData.get('image') as File
      const prompt = formData.get('prompt') as string
      const provider = formData.get('provider') as string
      const apiKey = formData.get('apiKey') as string

      if (!imageFile) {
        return new Response(
          JSON.stringify({ error: 'No image file provided' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        )
      }

      if (!provider) {
        return new Response(
          JSON.stringify({ error: 'No AI provider specified' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        )
      }

      const arrayBuffer = await imageFile.arrayBuffer()
      const base64Image = Buffer.from(arrayBuffer).toString('base64')

      const imageUrl = await callProviderApi(
        provider,
        base64Image,
        prompt || '',
        apiKey,
        env,
      )

      return new Response(
        JSON.stringify({
          imageUrl,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    } catch (error) {
      return new Response(
        JSON.stringify({
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  },
}
