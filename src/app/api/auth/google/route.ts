import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client with cookies for the user's session
    // Fix for Next.js cookies() warning
    const supabase = createRouteHandlerClient({ cookies })

    // Get the URL for Google OAuth sign-in
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Return the URL to redirect to
    return NextResponse.json({ url: data.url })
  } catch (error) {
    // Use a type guard to check if error is an Error object
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
