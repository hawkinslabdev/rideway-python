'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { maintenanceApi } from '@/lib/api'
import { 
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  TruckIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function MaintenancePage() {
  const searchParams = useSearchParams()
  const motorcycleId = searchParams.get('motorcycle')
  
  const [stats, setStats] = useState({
    upcoming: 0,
    overdue: 0,
    completed: 0,
    totalCost: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchMaintenanceStats()
  }, [])

  const fetchMaintenanceStats = async () => {
    try {
      setLoading(true)
      const upcomingRes = await maintenanceApi.getUpcoming()
      const maintenanceRes = await maintenanceApi.getAll()
      
      const upcoming = upcomingRes.data || []
      const allMaintenance = maintenanceRes.data || []
      
      const overdue = upcoming.filter((item: any) => item.is_overdue).length
      const completed = allMaintenance.filter((item: any) => item.is_completed).length
      const totalCost = allMaintenance.reduce((sum: number, item: any) => sum + (item.total_cost || 0), 0)
      
      setStats({
        upcoming: upcoming.length - overdue,
        overdue,
        completed,
        totalCost
      })
    } catch (error) {
      console.error('Failed to fetch maintenance stats:', error)
      setError('Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }

  const maintenanceOptions = [
    {
      title: 'Quick Service',
      description: 'Record a completed maintenance service',
      icon: WrenchScrewdriverIcon,
      href: `/maintenance/add${motorcycleId ? `?motorcycle=${motorcycleId}` : ''}`,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Schedule Service',
      description: 'Plan upcoming maintenance',
      icon: CalendarIcon,
      href: '/maintenance/schedule',
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Garage Visit Mode',
      description: 'Bulk update during service',
      icon: TruckIcon,
      href: '/maintenance/garage-visit',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Service History',
      description: 'View all past maintenance',
      icon: ClockIcon,
      href: '/maintenance/records',
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
    },
    {
      title: 'Maintenance Templates',
      description: 'Manage service templates',
      icon: DocumentTextIcon,
      href: '/maintenance/templates',
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
    },
    {
      title: 'Reminders',
      description: 'Set up maintenance alerts',
      icon: ClipboardDocumentCheckIcon,
      href: '/maintenance/reminders',
      color: 'text-pink-600 bg-pink-50 hover:bg-pink-100'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <p className="text-muted-foreground">
          Track and manage your motorcycle maintenance
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Due in next 60 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Total services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalCost.toLocaleString('de-DE')}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {maintenanceOptions.map((option) => (
            <Link key={option.title} href={option.href}>
              <Card className={`hover:shadow-lg transition-all cursor-pointer h-full ${option.color}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <option.icon className="h-8 w-8" />
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <p className="text-sm opacity-90 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Most common service</span>
              <span className="font-medium">Oil Change</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average cost per service</span>
              <span className="font-medium">
                €{stats.completed > 0 ? (stats.totalCost / stats.completed).toFixed(2) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Services this month</span>
              <span className="font-medium">Coming soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}