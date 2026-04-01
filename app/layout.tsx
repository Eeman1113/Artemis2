import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Artemis II Mission Tracker',
  description: 'Real-time spacecraft telemetry from NASA JPL Horizons API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
