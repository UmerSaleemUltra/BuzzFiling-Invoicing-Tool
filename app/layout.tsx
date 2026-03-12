import type { Metadata } from 'next'
import { Unbounded, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _unbounded = Unbounded({ subsets: ["latin"], variable: "--font-heading" });
const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Buzz Filing — Invoice Generator',
  description: 'Professional invoice generator for Buzz Filing — LLC Formation, ITIN, and business filing services.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_unbounded.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
