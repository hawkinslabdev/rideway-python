import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex">
            {/* Sidebar handles both desktop and mobile internally */}
            <AppSidebar />
            
            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 p-4 md:p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}