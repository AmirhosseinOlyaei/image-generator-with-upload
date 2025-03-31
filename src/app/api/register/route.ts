import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

// Reference: https://github.com/vercel/next.js/discussions/46498#discussioncomment-5077080

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // Initialize Supabase client with direct API access
    // This avoids using cookies in the API route which causes issues in Next.js 15
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Sign up the user
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // No need to manually create a profile here
    // The database trigger will automatically create a profile for the user
    // when they sign up, avoiding RLS policy issues

    return NextResponse.json(
      { message: 'Check your email for the confirmation link' },
      { status: 200 },
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 },
    )
  }
}
