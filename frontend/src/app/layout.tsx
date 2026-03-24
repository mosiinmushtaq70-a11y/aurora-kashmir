import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import ClickSpark from '@/components/ui/ClickSpark'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'AuroraLens | Professional Global Aurora Forecast',
  description: 'AI-powered space weather and aurora borealis forecasting for the globe.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        {/* ─── Google Fonts: Design System v1.0 Typography ─── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-void antialiased">
        <AuthProvider>
          <ClickSpark
            sparkColor='#00DC82'
            sparkSize={8}
            sparkRadius={15}
            sparkCount={7}
            duration={400}
          >
            {/* Navigation is a floating overlay, does not consume layout space */}
            <Navigation />
            <main className="min-h-screen w-screen relative overflow-x-hidden p-0 m-0">
              {children}
            </main>
          </ClickSpark>
        </AuthProvider>
      </body>
    </html>
  )
}
