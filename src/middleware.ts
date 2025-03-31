import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Refresh session if expired - required for Server Components
    // Await the session refresh to ensure it's completed
    await supabase.auth.getSession()

    // Get a fresh session after the refresh
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Store the session in a custom header that our client components can read
    if (session) {
      res.headers.set(
        'x-session-user',
        JSON.stringify({
          id: session.user.id,
          email: session.user.email,
        }),
      )
    }

    // Get the pathname from the URL
    const { pathname } = req.nextUrl

    // Allow all paths to proceed without authentication
    const publicPaths = ['/*']
    if (publicPaths.includes(pathname) || pathname.startsWith('/_next')) {
      return res
    }

    // If there's no session and the request is for a protected route, redirect to login
    // if (
    //   !session &&
    //   (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))
    // ) {
    //   const redirectUrl = req.nextUrl.clone()
    //   redirectUrl.pathname = '/auth/signin'
    //   redirectUrl.searchParams.set('redirectedFrom', pathname)
    //   return NextResponse.redirect(redirectUrl)
    // }

    // If there is a session and the user is trying to access auth pages, redirect to dashboard
    // if (
    //   session &&
    //   (pathname.startsWith('/auth/signin') ||
    //     pathname.startsWith('/auth/signup'))
    // ) {
    //   const redirectUrl = req.nextUrl.clone()
    //   redirectUrl.pathname = '/dashboard'
    //   return NextResponse.redirect(redirectUrl)
    // }

    return res
  } catch (error) {
    // Log the error but return the response to avoid breaking the app
    // We're keeping console.error here as it's important for debugging auth issues
    // eslint-disable-next-line no-console
    console.error('Auth middleware error:', error)
    return res
  }
}

// Specify the paths that the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
