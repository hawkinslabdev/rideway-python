'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDate, formatDistance, formatServiceType } from '@/lib/utils'
import apiClient from '@/lib/api'
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

interface UpcomingMaintenanceItem {
  id: number
  motorcycle_id: number
  motorcycle_name: string
  service_name: string
  service_type: string
  due_date?: string
  due_mileage?: number
  current_mileage: number
  is_overdue: boolean
  days_overdue?: number
  mileage_overdue?: number
  priority: 'low' | 'medium' | 'high'
}

export function UpcomingMaintenance() {
  const [upcomingItems, setUpcomingItems] = useState<UpcomingMaintenanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchUpcomingMaintenance()
  }, [])

  const fetchUpcomingMaintenance = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/dashboard/maintenance-due?days_ahead=60')
      setUpcomingItems(response.data || [])
    } catch (error) {
      console.error('Failed to fetch upcoming maintenance:', error)
      setError('Failed to load upcoming maintenance')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityIcon = (priority: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
    }
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
      case 'medium':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    }
  }

  const getPriorityColor = (priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
    switch (priority) {
      case 'high':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      default:
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
    }
  }

  const getOverdueText = (item: UpcomingMaintenanceItem) => {
    if (!item.is_overdue) return null
    
    const parts = []
    if (item.days_overdue && item.days_overdue > 0) {
      parts.push(`${item.days_overdue} day${item.days_overdue === 1 ? '' : 's'} overdue`)
    }
    if (item.mileage_overdue && item.mileage_overdue > 0) {
      parts.push(`${formatDistance(item.mileage_overdue)} overdue`)
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Overdue'
  }

  const getDueText = (item: UpcomingMaintenanceItem) => {
    if (item.is_overdue) return getOverdueText(item)
    
    const parts = []
    if (item.due_date) {
      const dueDate = new Date(item.due_date)
      const today = new Date()
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= 7) {
        parts.push(`Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`)
      } else {
        parts.push(`Due ${formatDate(item.due_date)}`)
      }
    }
    if (item.due_mileage && item.current_mileage) {
      const remaining = item.due_mileage - item.current_mileage
      if (remaining > 0) {
        parts.push(`${formatDistance(remaining)} remaining`)
      } else if (remaining === 0) {
        parts.push('Due now')
      }
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Due soon'
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'oil_change':
        return '🛢️'
      case 'tire_replacement':
        return '🛞'
      case 'brake_service':
        return '🛑'
      case 'chain_maintenance':
        return '⛓️'
      case 'valve_adjustment':
        return '🔧'
      case 'spark_plug':
        return '⚡'
      case 'air_filter':
        return '🌪️'
      case 'coolant_change':
        return '❄️'
      case 'general_inspection':
        return '🔍'
      default:
        return '🔧'
    }
  }

  // Sort items by priority and overdue status
  const sortedItems = [...upcomingItems].sort((a, b) => {
    // Overdue items first
    if (a.is_overdue && !b.is_overdue) return -1
    if (!a.is_overdue && b.is_overdue) return 1
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Finally by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    
    return 0
  })

  const overdueCount = upcomingItems.filter(item => item.is_overdue).length
  const highPriorityCount = upcomingItems.filter(item => item.priority === 'high' && !item.is_overdue).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={fetchUpcomingMaintenance} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Upcoming Maintenance</CardTitle>
        {upcomingItems.length > 0 && (
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full">
                {overdueCount} overdue
              </span>
            )}
            {highPriorityCount > 0 && (
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-full">
                {highPriorityCount} urgent
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {sortedItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold text-green-700 dark:text-green-400">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">
              No upcoming maintenance in the next 60 days
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.slice(0, 5).map((item) => (
              <Link 
                key={item.id} 
                href={`/garage/${item.motorcycle_id}`}
                className="block"
              >
                <div 
                  className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${getPriorityColor(item.priority, item.is_overdue)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getPriorityIcon(item.priority, item.is_overdue)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getServiceIcon(item.service_type)}</span>
                          <p className="font-medium text-sm">
                            {item.service_name}
                          </p>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.motorcycle_name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          Current: {formatDistance(item.current_mileage)}
                        </span>
                        <span className={`text-xs font-medium ${
                          item.is_overdue 
                            ? 'text-red-600 dark:text-red-400' 
                            : item.priority === 'high'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-muted-foreground'
                        }`}>
                          {getDueText(item)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {sortedItems.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/maintenance/schedule">
                  <Button variant="ghost" size="sm" className="group">
                    View All ({sortedItems.length} items)
                    <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        
        {upcomingItems.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Link href="/maintenance/schedule" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Schedule
              </Button>
            </Link>
            <Link href="/maintenance/garage-visit" className="flex-1">
              <Button size="sm" className="w-full">
                Service Mode
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}