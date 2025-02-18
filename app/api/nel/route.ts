import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const reports = await request.json()

    // Log the NEL reports
    console.log('NEL Report:', {
      timestamp: new Date().toISOString(),
      reports,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      geo: {
        country: request.headers.get('x-vercel-ip-country'),
        region: request.headers.get('x-vercel-ip-country-region'),
        city: request.headers.get('x-vercel-ip-city')
      }
    })

    // Here you could:
    // 1. Send to your logging service (e.g., Datadog, LogDNA)
    // 2. Store in your database
    // 3. Send to your monitoring system
    // 4. Forward to your error tracking service

    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://bang.town',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Max-Age': '86400',
      },
    })
  } catch (error) {
    console.error('Error processing NEL report:', error)
    return new Response(null, { status: 500 })
  }
} 