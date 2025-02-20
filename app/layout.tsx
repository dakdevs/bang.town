import type React from "react"
import { Bangers } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import "./globals.css"

const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: '--font-bangers' })

export const runtime = 'edge'

export const metadata = {
  title: "bang.town",
  description: "Your custom search engine with powerful (and shareable!) bang shortcuts",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any"
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512"
      }
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180"
    }
  },
  openGraph: {
    title: 'bang.town',
    description: 'Your custom search engine with powerful (and shareable!) bang shortcuts',
    url: 'https://bang.town',
    siteName: 'bang.town',
    images: [
      {
        url: 'https://bang.town/api/og',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bang.town',
    description: 'Your custom search engine with powerful (and shareable!) bang shortcuts',
    creator: '@dakdevs',
    images: ['https://bang.town/api/og'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={bangers.variable}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}