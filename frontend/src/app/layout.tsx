import type { Metadata } from 'next'
import { Orbitron, IBM_Plex_Sans, JetBrains_Mono, Manrope, Inter } from 'next/font/google'
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

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AuroraLens',
  description: 'Precision aurora borealis visibility scores based on live NASA DSCOVR telemetry and XGBoost machine learning. Tracking space weather since 1981.',
  keywords: ['aurora forecast', 'northern lights', 'space weather', 'DSCOVR telemetry', 'aurora score', 'NASA OMNI'],
  openGraph: {
    title: 'AuroraLens',
    description: 'Precision aurora visibility scoring powered by NASA open data.',
    url: 'https://auroralens.online',
    siteName: 'AuroraLens',
    images: [
      {
        url: 'https://auroralens.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AuroraLens Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuroraLens',
    description: 'Precision aurora visibility scores powered by AI.',
    images: ['https://auroralens.online/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} ${manrope.variable} ${inter.variable}`} style={{ colorScheme: 'dark' }}>
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

