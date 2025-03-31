import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client with cookies for the user's session
    // Fix for Next.js cookies() warning
    const supabase = createRouteHandlerClient({ cookies })

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // If user was created successfully, create a profile for them
    // This happens on the server side and bypasses RLS policies
    if (authData.user) {
      // Create a profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            plan: 'free',
            credits: 1, // Start with 1 free credit
          },
        ])

      if (profileError) {
        // Return a warning but don't fail the registration
        return NextResponse.json({ 
          success: true, 
          message: 'Registration successful! Please check your email to confirm your account.',
          warning: 'Profile creation may be delayed. Please contact support if you experience issues.'
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please check your email to confirm your account.'
    })
  } catch (error) {
    // Use a type guard to check if error is an Error object
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during registration'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
