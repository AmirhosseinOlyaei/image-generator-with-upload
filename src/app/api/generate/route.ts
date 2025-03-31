import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import axios from 'axios'
import { Buffer } from 'buffer'

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
  const fullPrompt = `Transform this image into Studio Ghibli style. ${prompt}`.trim()
  
  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(base64Image, fullPrompt, apiKey)
      case 'stability':
        // Check if API key is available
        if (!apiKey && !process.env.STABILITY_API_KEY) {
          throw new Error('Stability AI API key not found. Please provide your own API key.')
        }
        return await callStabilityAI(base64Image, fullPrompt, apiKey)
      case 'midjourney':
        // Check if API key is available
        if (!apiKey && !process.env.MIDJOURNEY_API_KEY) {
          throw new Error('Midjourney API key not found. Please provide your own API key.')
        }
        return await callMidjourney(base64Image, fullPrompt, apiKey)
      case 'leonardo':
        // Check if API key is available
        if (!apiKey && !process.env.LEONARDO_API_KEY) {
          throw new Error('Leonardo AI API key not found. Please provide your own API key.')
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
async function callOpenAI(base64Image: string, prompt: string, apiKey?: string) {
  const key = apiKey || process.env.OPENAI_API_KEY
  
  if (!key) {
    throw new Error('OpenAI API key not found. Please provide your own API key.')
  }
  
  const openai = new OpenAI({
    apiKey: key,
  })

  try {
    // Convert base64 to Buffer for OpenAI SDK
    const imageBuffer = Buffer.from(base64Image, 'base64')
    
    // eslint-disable-next-line no-console
    console.log('Calling OpenAI API with prompt:', prompt)
    
    const response = await openai.images.edit({
      image: imageBuffer,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
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
    throw new Error(`Failed to generate image with OpenAI: ${error.message || 'Unknown error'}`)
  }
}

// Stability AI API implementation
async function callStabilityAI(base64Image: string, prompt: string, apiKey?: string) {
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
      }
    )

    // Extract image URL from response
    return response.data.artifacts[0].base64
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Stability AI API error:', error)
    throw new Error('Failed to generate image with Stability AI')
  }
}

// Midjourney API implementation (via third-party API)
async function callMidjourney(base64Image: string, prompt: string, apiKey?: string) {
  const key = apiKey || process.env.MIDJOURNEY_API_KEY
  
  try {
    // Using a third-party API for Midjourney access
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
      }
    )

    return response.data.imageUrl
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Midjourney API error:', error)
    throw new Error('Failed to generate image with Midjourney')
  }
}

// Leonardo AI API implementation
async function callLeonardoAI(base64Image: string, prompt: string, apiKey?: string) {
  const key = apiKey || process.env.LEONARDO_API_KEY
  
  try {
    // First, upload the image
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
      }
    )

    const imageId = uploadResponse.data.id

    // Then, generate with the uploaded image
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
      }
    )

    // Get generation ID
    const generationId = generationResponse.data.generationId

    // Poll for results
    let attempts = 0
    while (attempts < 30) {
      const resultResponse = await axios.get(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        {
          headers: {
            Authorization: `Bearer ${key}`,
          },
        }
      )

      if (resultResponse.data.generations_by_pk.status === 'COMPLETE') {
        return resultResponse.data.generations_by_pk.generated_images[0].url
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    throw new Error('Leonardo AI generation timed out')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Leonardo AI API error:', error)
    throw new Error('Failed to generate image with Leonardo AI')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client using the route handler
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get session to verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check free image usage
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const prompt = formData.get('prompt') as string || 'Transform this image into Studio Ghibli style'
    const provider = formData.get('provider') as string
    const customApiKey = formData.get('apiKey') as string | null

    if (!imageFile || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // Check if user has free image usage available or is subscribed
    const hasRemainingFreeGenerations =
      profile.free_generations_used < 1 && profile.subscription_tier === 'free'
    const isSubscribed = profile.subscription_tier !== 'free'

    if (!hasRemainingFreeGenerations && !isSubscribed && !customApiKey) {
      return NextResponse.json(
        {
          error:
            'Free image generations already used. Please provide API key or subscribe.',
        },
        { status: 403 },
      )
    }

    // Call the selected provider's API
    const generatedImageUrl = await callProviderApi(
      provider, 
      imageFile, 
      prompt, 
      customApiKey || undefined
    )

    // If this was their free image, increment the counter
    if (hasRemainingFreeGenerations) {
      await supabase
        .from('profiles')
        .update({ free_generations_used: profile.free_generations_used + 1 })
        .eq('id', session.user.id)
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      provider: provider,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 },
    )
  }
}
