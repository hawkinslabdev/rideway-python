'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { logsApi, motorcycleApi } from '@/lib/api'
import { formatDate, formatDistance, formatCurrency } from '@/lib/utils'
import type { RideLog, Motorcycle } from '@/lib/types'
import { 
  PlusIcon,
  MapPinIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function LogsPage() {
  const searchParams = useSearchParams()
  const preselectedMotorcycle = searchParams.get('motorcycle')
  
  const [logs, setLogs] = useState<RideLog[]>([])
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [stats, setStats] = useState({
    totalRides: 0,
    totalDistance: 0,
    totalFuel: 0,
    totalCost: 0,
    avgEfficiency: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch motorcycles
      const motorcyclesRes = await motorcycleApi.getAll()
      setMotorcycles(motorcyclesRes.data || [])
      
      // Fetch logs
      const logsRes = await logsApi.getAll()
      const logsData = logsRes.data || []
      setLogs(logsData)
      
      // Calculate statistics
      calculateStats(logsData)
      
    } catch (error: any) {
      console.error('Failed to fetch logs:', error)
      setError('Failed to load ride logs')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logsList: RideLog[]) => {
    const totalDistance = logsList.reduce((sum, log) => sum + (log.distance || 0), 0)
    const totalFuel = logsList.reduce((sum, log) => sum + (log.fuel_consumed || 0), 0)
    const totalCost = logsList.reduce((sum, log) => sum + (log.fuel_cost || 0), 0)
    
    const efficiencyLogs = logsList.filter(log => log.fuel_efficiency)
    const avgEfficiency = efficiencyLogs.length > 0
      ? efficiencyLogs.reduce((sum, log) => sum + (log.fuel_efficiency || 0), 0) / efficiencyLogs.length
      : 0
    
    setStats({
      totalRides: logsList.length,
      totalDistance,
      totalFuel,
      totalCost,
      avgEfficiency
    })
  }

  const getTripTypeIcon = (tripType?: string) => {
    switch (tripType?.toLowerCase()) {
      case 'commute':
        return '🏢'
      case 'touring':
        return '🏞️'
      case 'recreation':
        return '🎯'
      case 'track':
        return '🏁'
      default:
        return '🏍️'
    }
  }

  const getWeatherIcon = (weather?: string) => {
    if (!weather) return null
    const w = weather.toLowerCase()
    if (w.includes('sun') || w.includes('clear')) return '☀️'
    if (w.includes('rain')) return '🌧️'
    if (w.includes('cloud')) return '☁️'
    if (w.includes('snow')) return '❄️'
    return '🌤️'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Ride Logs</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ride Logs</h1>
          <p className="text-muted-foreground">
            Track your rides and fuel consumption
          </p>
        </div>
        <Link href={`/logs/add${preselectedMotorcycle ? `?motorcycle=${preselectedMotorcycle}` : ''}`}>
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Ride Log
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRides}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDistance(stats.totalDistance)}</div>
            <p className="text-xs text-muted-foreground">
              Logged rides
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fuel Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFuel.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">
              Total consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fuel Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Total spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEfficiency.toFixed(1)} km/L</div>
            <p className="text-xs text-muted-foreground">
              {(100 / stats.avgEfficiency).toFixed(1)} L/100km
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Ride Logs List */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPinIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No ride logs yet</p>
            <p className="text-muted-foreground mb-4">
              Start tracking your rides and fuel consumption
            </p>
            <Link href="/logs/add">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Log Your First Ride
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const motorcycle = motorcycles.find(m => m.id === log.motorcycle_id)
            
            return (
              <Card key={log.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTripTypeIcon(log.trip_type)}</span>
                        <h3 className="text-lg font-semibold">
                          {log.start_location || 'Unknown'} → {log.end_location || 'Unknown'}
                        </h3>
                        {getWeatherIcon(log.weather_conditions) && (
                          <span className="text-xl">{getWeatherIcon(log.weather_conditions)}</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{formatDate(log.start_date)}</p>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Distance</p>
                          <p className="font-medium">{formatDistance(log.distance || 0)}</p>
                        </div>
                        
                        {log.fuel_consumed && (
                          <div>
                            <p className="text-muted-foreground">Fuel</p>
                            <p className="font-medium">{log.fuel_consumed.toFixed(1)} L</p>
                          </div>
                        )}
                        
                        {log.fuel_efficiency && (
                          <div>
                            <p className="text-muted-foreground">Efficiency</p>
                            <p className="font-medium">{log.fuel_efficiency.toFixed(1)} km/L</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{motorcycle?.name || 'Unknown Motorcycle'}</span>
                        {log.trip_type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{log.trip_type}</span>
                          </>
                        )}
                        {log.fuel_cost && (
                          <>
                            <span>•</span>
                            <span>{formatCurrency(log.fuel_cost)}</span>
                          </>
                        )}
                      </div>
                      
                      {log.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{log.notes}</p>
                      )}
                    </div>
                    
                    <Link href={`/logs/${log.id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}