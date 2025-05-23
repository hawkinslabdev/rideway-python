'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency, formatDistance, formatServiceType } from '@/lib/utils'
import apiClient from '@/lib/api'

interface Activity {
  id: number
  type: string
  description: string
  motorcycle_name: string
  motorcycle_id: number
  date: string
  mileage: number
  cost?: number
  service_type: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchRecentActivities()
  }, [])

  const fetchRecentActivities = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/dashboard/stats')
      setActivities(response.data.recent_activities || [])
    } catch (error) {
      console.error('Failed to fetch recent activities:', error)
      setError('Failed to load recent activities')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (serviceType: string) => {
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

  const getActivityColor = (serviceType: string) => {
    switch (serviceType) {
      case 'oil_change':
        return 'text-blue-600 dark:text-blue-400'
      case 'tire_replacement':
        return 'text-red-600 dark:text-red-400'
      case 'brake_service':
        return 'text-red-700 dark:text-red-300'
      case 'chain_maintenance':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-green-600 dark:text-green-400'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchRecentActivities} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-muted-foreground">No recent maintenance activities</p>
            <p className="text-sm text-muted-foreground mt-1">
              Activities will appear here after you complete maintenance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                    {getActivityIcon(activity.service_type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">
                      {activity.description}
                    </p>
                    {activity.cost && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(activity.cost)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {activity.motorcycle_name}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistance(activity.mileage)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full bg-muted ${getActivityColor(activity.service_type)}`}>
                      {formatServiceType(activity.service_type)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}