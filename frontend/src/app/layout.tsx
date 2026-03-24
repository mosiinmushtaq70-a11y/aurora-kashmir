import type { Metadata } from 'next'
import { Orbitron, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ClickSpark from '@/components/ui/ClickSpark'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

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
    <html lang="en" className={`dark ${orbitron.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable}`} style={{ colorScheme: 'dark' }}>
      <head>
      </head>
      <body className="bg-bg-void antialiased">
          <ClickSpark
            sparkColor='#00DC82'
            sparkSize={8}
            sparkRadius={15}
            sparkCount={7}
            duration={400}
          >

            <main className="min-h-screen w-screen relative overflow-x-hidden p-0 m-0">
              {children}
            </main>
          </ClickSpark>
      </body>
    </html>
  )
}
