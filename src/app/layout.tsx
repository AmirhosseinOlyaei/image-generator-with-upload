import ThemeRegistry from '@/components/ThemeRegistry'
import { AppProvider } from '@/contexts/AppContext'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Ghibli Vision - Transform Photos into Studio Ghibli Artwork',
  description:
    'Upload your photos and transform them into Studio Ghibli-inspired artwork using AI',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <ThemeRegistry>
          <AppProvider>{children}</AppProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
