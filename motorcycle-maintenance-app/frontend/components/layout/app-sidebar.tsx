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
  XMarkIcon
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
    <div className={cn(
      "bg-gray-900 text-white transition-all duration-300 flex-shrink-0",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <h1 className="text-xl font-bold">Moto Tracker</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-2 hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  {!collapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

// Mobile Menu Button
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 left-4 z-50 rounded-md p-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg"
      aria-label="Open menu"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  )
}

// Mobile Sidebar Overlay
export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  if (!isOpen) return null

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative flex flex-col w-64 bg-gray-900 text-white shadow-xl">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Moto Tracker</h1>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8 px-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="h-6 w-6 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}

// Main App Sidebar Component that handles both desktop and mobile
export function AppSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar - only shows on md+ screens */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Mobile Menu Button - only shows on smaller screens */}
      <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  )
}