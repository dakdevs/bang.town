import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'experimental-edge'

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Handle redirect from /b/ to root for settings
  if (request.nextUrl.pathname === '/b/' && request.nextUrl.searchParams.has('s')) {
    const query = request.nextUrl.searchParams.get('s')
    if (query === '!settings') {
      const searchParams = new URLSearchParams(request.nextUrl.searchParams.toString())
      searchParams.delete('s')
      return NextResponse.redirect(new URL(`/?${searchParams.toString()}`, request.url))
    }
  }

  // Add cache headers for /b route
  if (request.nextUrl.pathname.startsWith('/b')) {
    response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800')
    response.headers.set('CDN-Cache-Control', 'public, max-age=86400, immutable, stale-while-revalidate=604800')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=86400, immutable, stale-while-revalidate=604800')
    response.headers.set('Surrogate-Control', 'public, max-age=86400, immutable, stale-while-revalidate=604800')
  } else {
    // Default caching strategy for other routes
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=3600')
    response.headers.set('CDN-Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=3600')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=3600')
    response.headers.set('Surrogate-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=3600')
  }

  // Performance headers
  response.headers.set('x-edge-region', process.env.VERCEL_REGION || '')
  response.headers.set('x-middleware-cache', 'yes')
  response.headers.set('Accept-CH', 'Sec-CH-Prefers-Color-Scheme, Viewport-Width, Width')
  response.headers.set('Timing-Allow-Origin', '*')
  response.headers.set('Server-Timing', 'edge;desc="Vercel Edge Network"')

  // Enable preloading for critical assets with correct 'as' values
  const preloadHeaders = [
    '</fonts/bangers.woff2>; rel=preload; as=font; type=font/woff2; crossorigin=anonymous',
    '</favicon.ico>; rel=icon; as=image; type=image/x-icon',
    '</icon.png>; rel=icon; as=image; type=image/png'
  ]
  response.headers.set('Link', preloadHeaders.join(', '))

  // Security Headers
  const headers = response.headers

  // Prevent XSS attacks
  headers.set('X-XSS-Protection', '1; mode=block')

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Control iframe embedding
  headers.set('X-Frame-Options', 'DENY')

  // Enhanced Permissions Policy
  headers.set(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'navigation-override=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ].join(', ')
  )

  // Enhanced Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live *.vercel.app blob:",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' data: blob: *.vercel.app",
    "font-src 'self' fonts.gstatic.com data:",
    "frame-src 'self'",
    "connect-src 'self' *.vercel.app vitals.vercel-insights.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'"
  ]

  // Add upgrade-insecure-requests only in production
  if (process.env.NODE_ENV === 'production') {
    cspDirectives.push("upgrade-insecure-requests")
  }

  headers.set('Content-Security-Policy', cspDirectives.join('; '))

  // Cross-Origin headers
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // NEL (Network Error Logging) and Report-To for monitoring
  if (process.env.NODE_ENV === 'production') {
    headers.set('NEL', '{"report_to":"default","max_age":31536000,"include_subdomains":true}')
    headers.set('Report-To', '{"group":"default","max_age":31536000,"endpoints":[{"url":"https://bang.town/api/nel"}]}')
  }

  return response
}

// Specify which paths this middleware will run on
export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
} 