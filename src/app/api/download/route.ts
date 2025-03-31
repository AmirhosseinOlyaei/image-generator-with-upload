import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the image URL from the query parameters
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 },
      )
    }

    // Fetch the image from the remote URL
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image from source' },
        { status: response.status },
      )
    }

    // Get the image data as an array buffer
    const imageBuffer = await response.arrayBuffer()

    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'image/png'

    // Create a new response with the image data
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition':
          'attachment; filename="ghibli-transformation.png"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error downloading image:', error)
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 },
    )
  }
}
