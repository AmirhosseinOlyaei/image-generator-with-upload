import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Initialize Supabase client with cookies for the user's session
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!checkError && existingProfile) {
      // Profile already exists, return it
      return NextResponse.json({ 
        success: true, 
        profile: existingProfile 
      })
    }

    // Create a profile for the user
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || '',
          plan: 'free',
          credits: 1, // Start with 1 free credit
        },
      ])
      .select('*')
      .single()

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      profile: newProfile
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
