import { ImageResponse } from 'next/og'

export const runtime = 'edge'

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (resource) {
    const response = await fetch(resource[1])
    if (response.status == 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error('failed to load font data')
}

export async function GET() {
  try {
    const fontData = await loadGoogleFont(
      'Bangers',
      'bang.town Your custom search engine with powerful (and shareable!) bang shortcuts! !4o sup? !g cats !w science'
    )

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            padding: '40px 80px',
            fontFamily: 'Bangers',
          }}
        >
          {/* Logo and Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: 120,
                background: '#2563eb',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '16px',
                lineHeight: 1,
                letterSpacing: '0.05em',
              }}
            >
              bang.town
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 48,
              textAlign: 'center',
              color: '#4b5563',
              marginBottom: '40px',
              maxWidth: '800px',
              lineHeight: 1.2,
              letterSpacing: '0.05em',
            }}
          >
            Your custom search engine with powerful (and shareable!) bang shortcuts!
          </div>

          {/* Example Commands */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              fontSize: 36,
              color: '#1f2937',
              letterSpacing: '0.05em',
            }}
          >
            <code
              style={{
                background: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              !4o sup?
            </code>
            <code
              style={{
                background: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              !g cats
            </code>
            <code
              style={{
                background: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              !w science
            </code>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Bangers',
            data: fontData,
            style: 'normal',
            weight: 400,
          },
        ],
      }
    )
  } catch (error: any) {
    console.error('OG Image generation error:', error)
    return new Response(`Failed to generate the image: ${error.message}`, {
      status: 500,
    })
  }
} 