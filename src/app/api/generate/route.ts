import { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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
        // Check if API key is available
        if (!apiKey && !process.env.STABILITY_API_KEY) {
          throw new Error(
            'Stability AI API key not found. Please provide your own API key.',
          )
        }
        return await callStabilityAI(base64Image, fullPrompt, apiKey)
      case 'midjourney':
        // Check if API key is available
        if (!apiKey && !process.env.MIDJOURNEY_API_KEY) {
          throw new Error(
            'Midjourney API key not found. Please provide your own API key.',
          )
        }
        return await callMidjourney(base64Image, fullPrompt, apiKey)
      case 'leonardo':
        // Check if API key is available
        if (!apiKey && !process.env.LEONARDO_API_KEY) {
          throw new Error(
            'Leonardo AI API key not found. Please provide your own API key.',
          )
        }
        return await callLeonardoAI(base64Image, fullPrompt, apiKey)
      default:
        throw new Error('Invalid AI provider')
    }
  } catch (error: unknown) {
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

    // Ensure the base64 string is properly formatted for PNG
    // Remove any data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

    // Convert base64 to Buffer
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Check file size (OpenAI limit is 10MB, but we're limiting to 5MB for Vercel)
    const fileSizeInMB = imageBuffer.length / (1024 * 1024)
    if (fileSizeInMB > 5) {
      throw new Error(
        'Image size exceeds 5MB limit. Please use a smaller image.',
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

    // eslint-disable-next-line no-console
    console.log('OpenAI response received:', response.data[0].url)

    return response.data[0].url
  } catch (error: unknown) {
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

    // Extract image URL from response
    return response.data.artifacts[0].base64
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Stability AI API error:', error)
    throw new Error('Failed to generate image with Stability AI')
  }
}

// Midjourney API implementation (via third-party API)
async function callMidjourney(
  base64Image: string,
  prompt: string,
  apiKey?: string,
) {
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
      },
    )

    return response.data.imageUrl
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Midjourney API error:', error)
    throw new Error('Failed to generate image with Midjourney')
  }
}

// Leonardo AI API implementation
async function callLeonardoAI(
  base64Image: string,
  prompt: string,
  apiKey?: string,
) {
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
      },
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
      },
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
        },
      )

      if (resultResponse.data.generations_by_pk.status === 'COMPLETE') {
        return resultResponse.data.generations_by_pk.generated_images[0].url
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    throw new Error('Leonardo AI generation timed out')
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Leonardo AI API error:', error)
    throw new Error('Failed to generate image with Leonardo AI')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client with direct API access
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // TEMPORARILY DISABLED AUTH: Skip session check
    // Get session to verify user is authenticated
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession()

    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TEMPORARILY DISABLED AUTH: Skip profile check
    // Get user profile to check free image usage
    // const { data: profile, error: profileError } = await supabase
    //   .from('profiles')
    //   .select('*')
    //   .eq('id', session.user.id)
    //   .single()

    // if (profileError) {
    //   return NextResponse.json(
    //     { error: 'Failed to get user profile' },
    //     { status: 500 },
    //   )
    // }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const prompt =
      (formData.get('prompt') as string) ||
      'Transform this image into Studio Ghibli style'
    const provider = formData.get('provider') as string
    const customApiKey = formData.get('apiKey') as string | null

    if (!imageFile || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // TEMPORARILY DISABLED AUTH: Skip usage checks
    // Check if user has free image usage available or is subscribed
    // const hasRemainingFreeGenerations =
    //   profile.credits > 0 && profile.plan === 'free'
    // const isSubscribed = profile.plan !== 'free'

    // if (!hasRemainingFreeGenerations && !isSubscribed && !customApiKey) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         'Free image generations already used. Please provide API key or subscribe.',
    //     },
    //     { status: 403 },
    //   )
    // }

    // Call the selected provider's API
    const generatedImageUrl = await callProviderApi(
      provider,
      imageFile,
      prompt,
      customApiKey || undefined,
    )

    // TEMPORARILY DISABLED AUTH: Skip updating profile
    // If this was their free image, decrement the counter
    // if (hasRemainingFreeGenerations) {
    //   await supabase
    //     .from('profiles')
    //     .update({ credits: profile.credits - 1 })
    //     .eq('id', session.user.id)
    // }

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      provider: provider,
    })
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Error generating image:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 500 },
    )
  }
}
