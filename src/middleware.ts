import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next()
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Store the session in a custom header that our client components can read
  if (session) {
    res.headers.set('x-session-user', JSON.stringify({
      id: session.user.id,
      email: session.user.email
    }))
  }

  // Get the pathname from the URL
  const { pathname } = req.nextUrl

  // Allow public paths to proceed without authentication
  if (
    pathname === '/' || 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth/callback')
  ) {
    return res
  }

  // If there's no session and the request is for a protected route, redirect to login
  if (
    !session &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/profile'))
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/signin'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there is a session and the user is trying to access auth pages, redirect to dashboard
  if (
    session &&
    (pathname.startsWith('/auth/signin') ||
      pathname.startsWith('/auth/signup'))
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify the paths that the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
