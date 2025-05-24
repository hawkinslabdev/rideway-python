'use client'

import { useState } from 'react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

export function Header() {
  const [notifications] = useState(0) // Mock notification count

  return (
    <header className="border-b bg-white px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Add padding on mobile to account for menu button */}
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 ml-16 md:ml-0">
            Motorcycle Maintenance Tracker
          </h2>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="h-5 w-5 md:h-6 md:w-6" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>
          
          <Button variant="ghost" size="icon">
            <UserCircleIcon className="h-6 w-6 md:h-8 md:w-8" />
          </Button>
        </div>
      </div>
    </header>
  )
}