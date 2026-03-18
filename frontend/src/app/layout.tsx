import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import ClickSpark from '@/components/ui/ClickSpark'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'AuroraLens | Professional Global Aurora Forecast',
  description: 'AI-Powered space weather and aurora borealis forecasting.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="bg-space-black antialiased">
        <AuthProvider>
          <ClickSpark
            sparkColor='#fff'
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
