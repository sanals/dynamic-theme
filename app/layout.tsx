import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import { DEFAULT_PALETTE } from '@/lib/design-config'
import { GlobalDesignWidget } from '@/components/global-design-widget'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Aura — Luxury 3D Prints',
  description:
    'A theme-switchable gallery of high-fidelity 3D prints. Toggle color palettes and layout structures on the fly.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1a1814',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_PALETTE}
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <GlobalDesignWidget />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
