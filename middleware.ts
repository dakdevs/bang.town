import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Security Headers
  const headers = response.headers

  // Prevent XSS attacks
  headers.set('X-XSS-Protection', '1; mode=block')

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Control iframe embedding
  headers.set('X-Frame-Options', 'DENY')

  // Control browser features and APIs
  headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  )

  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live *.vercel.app",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: blob: *.vercel.app",
      "font-src 'self' fonts.gstatic.com",
      "frame-src 'self'",
      "connect-src 'self' *.vercel.app vitals.vercel-insights.com",
    ].join('; ')
  )

  // Strict Transport Security (HSTS)
  // Only enable this in production and when you're sure about HTTPS
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

// Specify which paths this middleware will run on
export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
} 