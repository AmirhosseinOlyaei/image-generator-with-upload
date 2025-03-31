import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectedFrom = requestUrl.searchParams.get('redirectedFrom') || '/dashboard'

  if (code) {
    // Create a Supabase client using the route handler
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the redirected from path or default to dashboard
    const redirectPath = redirectedFrom.startsWith('/') ? redirectedFrom : '/dashboard'
    
    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
  }

  // If no code is present, redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
