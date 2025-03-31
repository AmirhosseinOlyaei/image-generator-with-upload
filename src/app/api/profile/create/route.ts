import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

// Reference: https://github.com/vercel/next.js/discussions/46498#discussioncomment-5077080
export async function POST() {
  try {
    // Initialize Supabase client with direct API access
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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
        profile: existingProfile,
        message: 'Profile already exists',
      })
    }

    // Create a new profile for the user
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: session.user.id,
          email: session.user.email,
          credits: 10, // Default credits for new users
          plan: 'free', // Default plan
        },
      ])
      .select()
      .single()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating profile:', error)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile created successfully',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
