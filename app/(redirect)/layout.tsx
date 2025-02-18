import type React from "react"

export default function RedirectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ background: 'transparent' }}>{children}</body>
    </html>
  )
}

