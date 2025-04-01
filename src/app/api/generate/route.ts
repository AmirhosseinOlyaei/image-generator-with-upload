import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const prompt = formData.get('prompt') as string
    const provider = formData.get('provider') as string
    const userApiKey = formData.get('apiKey') as string | null

    // Validate inputs
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    // Check file size (5MB limit for Vercel)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size exceeds 5MB limit' },
        { status: 400 },
      )
    }

    // Process based on provider
    if (provider === 'openai') {
      // Use user-provided API key if available, otherwise use environment variable
      const apiKey = userApiKey || process.env.OPENAI_API_KEY

      if (!apiKey) {
        return NextResponse.json(
          { error: 'No API key available. Please set your OpenAI API key.' },
          { status: 401 },
        )
      }

      return await callOpenAI(image, prompt, apiKey)
    } else if (provider === 'stability') {
      // TODO: Implement Stability AI
      return NextResponse.json(
        { error: 'Stability AI not implemented yet' },
        { status: 501 },
      )
    } else if (provider === 'midjourney') {
      // TODO: Implement Midjourney
      return NextResponse.json(
        { error: 'Midjourney not implemented yet' },
        { status: 501 },
      )
    } else if (provider === 'leonardo') {
      // TODO: Implement Leonardo AI
      return NextResponse.json(
        { error: 'Leonardo AI not implemented yet' },
        { status: 501 },
      )
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }
  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 },
    )
  }
}

async function callOpenAI(image: File, prompt: string, apiKey: string) {
  try {
    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const mimeType = image.type

    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({
      apiKey,
    })

    // First use GPT-4o to analyze the image and create a detailed description
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing images and describing people in detail. Focus on facial features, hair, clothing, and expression. Be specific and detailed.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this person in detail, focusing on their appearance.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
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
    const enhancedPrompt = `Transform the uploaded selfie or group into a Studio Ghibli-style character. The subject should have expressive, simplified features with slightly larger eyes in the signature Ghibli aesthetic. Render the image in a soft watercolor style with warm, nostalgic lighting. The background should be an enhanced, dreamlike version of the original, incorporating fantastical elements like glowing dust particles. Maintain wooden beams and pendant lights but stylize them with Ghibli’s rich textures. Use soft, rich colors with a painterly effect. The final image should feel contemplative yet warm, capturing the essence of Hayao Miyazaki and Isao Takahata's art. Example of bad generation: This is a very bad user experience to see user's provided image that has for example four people see generated image with five people.


    Based on this image description: ${imageDescription}
    
    Additional details from user: ${prompt}`

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error calling OpenAI:', error)

    // Return a more specific error message
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Unknown error occurred with OpenAI API' },
      { status: 500 },
    )
  }
}
