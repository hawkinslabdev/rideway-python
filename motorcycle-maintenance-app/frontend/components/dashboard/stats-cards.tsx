'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motorcycleApi, dashboardApi, testApi } from '@/lib/api'
import type { Motorcycle } from '@/lib/types'

export function StatsCards() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Test API connectivity first
        console.log('Testing API connectivity...')
        await testApi.health()
        console.log('Health check passed')
        
        // Fetch motorcycles
        console.log('Fetching motorcycles...')
        const motorcyclesResponse = await motorcycleApi.getAll()
        setMotorcycles(motorcyclesResponse.data)
        console.log('Motorcycles fetched:', motorcyclesResponse.data.length)
        
        // Try to fetch dashboard stats
        try {
          console.log('Fetching dashboard stats...')
          const statsResponse = await dashboardApi.getStats()
          setDashboardStats(statsResponse.data)
          console.log('Dashboard stats fetched:', statsResponse.data)
        } catch (statsError) {
          console.warn('Dashboard stats failed, using motorcycle data only:', statsError)
          // Continue with just motorcycle data
        }
        
      } catch (error: any) {
        console.error('Failed to fetch data:', error)
        setError(`Failed to load data: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats from motorcycles if dashboard stats aren't available
  const activeBikes = motorcycles.filter(bike => bike.is_active).length
  const totalMileage = motorcycles.reduce((sum, bike) => sum + bike.current_mileage, 0)
  
  // Use dashboard stats if available, otherwise use calculated stats
  const stats = [
    {
      title: 'Active Bikes',
      value: loading ? '...' : (dashboardStats?.active_motorcycles ?? activeBikes).toString(),
      description: 'Currently registered',
      icon: '🏍️'
    },
    {
      title: 'Total Mileage',
      value: loading ? '...' : `${(dashboardStats?.total_mileage ?? totalMileage).toLocaleString('de-DE')} km`,
      description: 'Across all bikes',
      icon: '📊'
    },
    {
      title: 'Upcoming Services',
      value: loading ? '...' : (dashboardStats?.upcoming_services ?? 0).toString(),
      description: 'Due this month',
      icon: '🔧'
    },
    {
      title: 'Monthly Expenses',
      value: loading ? '...' : `€${(dashboardStats?.monthly_expenses ?? 0).toLocaleString('de-DE')}`,
      description: 'This month',
      icon: '💰'
    }
  ]

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-xs underline mt-2"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}