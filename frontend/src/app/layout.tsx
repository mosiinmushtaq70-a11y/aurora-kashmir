import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import ClickSpark from '@/components/ui/ClickSpark'

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
    <html lang="en" className="dark">
      <body className="bg-space-black antialiased">
        <ClickSpark
          sparkColor='#fff'
          sparkSize={8}
          sparkRadius={15}
          sparkCount={7}
          duration={400}
        >
          {/* Navigation is a floating overlay, does not consume layout space */}
          <Navigation />
          <main className="min-h-screen overflow-y-auto relative p-6 pt-20">
            <div className="aurora-glow top-[-20%] left-[-10%] blur-3xl"></div>
            {children}
          </main>
        </ClickSpark>
      </body>
    </html>
  )
}
