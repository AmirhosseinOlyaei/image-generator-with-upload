import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client with direct API access
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

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
    // eslint-disable-next-line no-console
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'An error occurred during Google authentication' },
      { status: 500 },
    )
  }
}
