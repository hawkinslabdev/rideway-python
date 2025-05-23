'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motorcycleApi } from '@/lib/api'
import type { Motorcycle } from '@/lib/types'

export function StatsCards() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMotorcycles = async () => {
      try {
        const response = await motorcycleApi.getAll()
        setMotorcycles(response.data)
      } catch (error) {
        console.error('Failed to fetch motorcycles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMotorcycles()
  }, [])

  const activeBikes = motorcycles.filter(bike => bike.is_active).length
  const totalMileage = motorcycles.reduce((sum, bike) => sum + bike.current_mileage, 0)
  const upcomingServices = 2 // Mock data - will be calculated from maintenance records
  const monthlyExpenses = 450 // Mock data - will be calculated from recent expenses

  const stats = [
    {
      title: 'Active Bikes',
      value: loading ? '...' : activeBikes.toString(),
      description: 'Currently registered',
      icon: '🏍️'
    },
    {
      title: 'Total Mileage',
      value: loading ? '...' : `${totalMileage.toLocaleString('de-DE')} km`,
      description: 'Across all bikes',
      icon: '📊'
    },
    {
      title: 'Upcoming Services',
      value: upcomingServices.toString(),
      description: 'Due this month',
      icon: '🔧'
    },
    {
      title: 'Monthly Expenses',
      value: `€${monthlyExpenses.toLocaleString('de-DE')}`,
      description: 'This month',
      icon: '💰'
    }
  ]

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