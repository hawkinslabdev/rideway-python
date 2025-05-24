'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Garage', href: '/garage', icon: TruckIcon },
  { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon },
  { name: 'Parts', href: '/parts', icon: CogIcon },
  { name: 'Logs', href: '/logs', icon: ClipboardDocumentListIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

// Desktop Sidebar Component
export function DesktopSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col bg-gray-900 text-white transition-all duration-300",
      collapsed ? "lg:w-16" : "lg:w-64"
    )}>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center min-w-0">
          <span className="text-2xl">🏍️</span>
          {!collapsed && (
            <h1 className="ml-2 text-lg font-bold truncate">Rideway</h1>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                  {collapsed && (
                    <span className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4 flex-shrink-0">
        <div className={cn(
          "text-xs text-gray-400",
          collapsed ? "text-center" : "text-left"
        )}>
          {collapsed ? "v1.0" : "Version 1.0.0"}
        </div>
      </div>
    </aside>
  )
}

// Mobile Sidebar
export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black transition-opacity duration-300",
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center">
            <span className="text-2xl">🏍️</span>
            <h1 className="ml-2 text-lg font-bold">Rideway</h1>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4 flex-shrink-0">
          <div className="text-xs text-gray-400">
            Version 1.0.0
          </div>
        </div>
      </aside>
    </>
  )
}

// Main App Sidebar Component
export function AppSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg"
        aria-label="Open menu"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  )
}

// Layout Component
export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      
      {/* Main content with proper left margin for desktop sidebar */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Account for mobile menu button */}
              <div className="ml-16 lg:ml-0">
                <h2 className="text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  Motorcycle Maintenance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Track your rides, maintenance, and parts
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                <span className="sr-only">Notifications</span>
                <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 10v-3.586a1 1 0 01.293-.707l6.414-6.414a1 1 0 011.414 0l6.414 6.414a1 1 0 01.293.707V17M6 2l3 3m-3-3l-3 3" />
                </svg>
              </button>
              
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="sr-only">User menu</span>
                <svg className="h-6 w-6 lg:h-8 lg:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}