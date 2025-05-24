import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RootLayoutContent } from '@/components/layout/app-sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rideway',
  description: 'Track your motorcycle maintenance, parts, and service records',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayoutContent>
          {children}
        </RootLayoutContent>
      </body>
    </html>
  )
}