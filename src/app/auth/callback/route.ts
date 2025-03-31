import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

// Reference: https://github.com/vercel/next.js/discussions/46498#discussioncomment-5077080

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectedFrom =
      requestUrl.searchParams.get('redirectedFrom') || '/dashboard'

    if (code) {
      // Initialize Supabase client with direct API access
      // This avoids using cookies in the API route which causes issues in Next.js 15
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      // Get the redirected from path or default to dashboard
      const redirectPath = redirectedFrom.startsWith('/')
        ? redirectedFrom
        : '/dashboard'

      // URL to redirect to after sign in process completes
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // If no code is present, redirect to home page
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}
