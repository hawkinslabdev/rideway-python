import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { Toast, ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Motorcycle Maintenance Tracker',
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
        <ToastProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-6">
                  {children}
                </main>
              </div>
            </div>
          </div>
          <Toast />
        </ToastProvider>
      </body>
    </html>
  )
}
