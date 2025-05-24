'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motorcycleApi, maintenanceApi, partsApi, logsApi } from '@/lib/api'
import { formatDate, formatDistance, formatCurrency, formatServiceType } from '@/lib/utils'
import type { Motorcycle, MaintenanceRecord, Part, RideLog } from '@/lib/types'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  WrenchIcon,
  CogIcon,
  MapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function MotorcycleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const motorcycleId = Number(params.bikeId)
  
  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null)
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<any[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [rideLogs, setRideLogs] = useState<RideLog[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'parts' | 'logs'>('overview')

  useEffect(() => {
    if (motorcycleId) {
      fetchMotorcycleDetails()
    }
  }, [motorcycleId])

  const fetchMotorcycleDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch motorcycle details
      const motorcycleResponse = await motorcycleApi.getById(motorcycleId)
      setMotorcycle(motorcycleResponse.data)
      
      // Fetch related data in parallel
      const [maintenanceRes, upcomingRes, partsRes, logsRes] = await Promise.all([
        maintenanceApi.getAll(motorcycleId),
        maintenanceApi.getUpcoming(motorcycleId),
        partsApi.getAll(motorcycleId),
        logsApi.getAll(motorcycleId)
      ])
      
      setMaintenance(maintenanceRes.data || [])
      setUpcomingMaintenance(upcomingRes.data || [])
      setParts(partsRes.data || [])
      setRideLogs(logsRes.data || [])
      
      // Calculate statistics
      calculateStatistics(
        motorcycleResponse.data,
        maintenanceRes.data || [],
        partsRes.data || [],
        logsRes.data || []
      )
      
    } catch (error: any) {
      console.error('Failed to fetch motorcycle details:', error)
      setError('Failed to load motorcycle details')
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (
    bike: Motorcycle,
    maintenanceRecords: MaintenanceRecord[],
    partsList: Part[],
    logs: RideLog[]
  ) => {
    const currentYear = new Date().getFullYear()
    const age = currentYear - bike.year
    
    const ownershipDays = bike.purchase_date 
      ? Math.floor((new Date().getTime() - new Date(bike.purchase_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + (m.total_cost || 0), 0)
    const totalPartsCost = partsList.reduce((sum, p) => sum + (p.total_cost || 0), 0)
    const totalRides = logs.length
    const totalDistance = logs.reduce((sum, l) => sum + (l.distance || 0), 0)
    
    setStatistics({
      age,
      ownershipDays,
      totalMaintenanceCost,
      totalPartsCost,
      totalCost: totalMaintenanceCost + totalPartsCost,
      totalRides,
      totalDistance,
      avgKmPerYear: age > 0 ? bike.current_mileage / age : 0,
      avgKmPerDay: ownershipDays > 0 ? bike.current_mileage / ownershipDays : 0,
      maintenanceCount: maintenanceRecords.length,
      partsCount: partsList.length
    })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this motorcycle? You can restore it later.')) {
      return
    }
    
    try {
      await motorcycleApi.delete(motorcycleId)
      router.push('/garage')
    } catch (error) {
      console.error('Failed to archive motorcycle:', error)
      setError('Failed to archive motorcycle')
    }
  }

  const handleUpdateMileage = async () => {
    const newMileage = prompt(`Update mileage (current: ${formatDistance(motorcycle?.current_mileage)}):`)
    if (!newMileage) return
    
    const mileageNum = parseFloat(newMileage)
    if (isNaN(mileageNum) || mileageNum < (motorcycle?.current_mileage || 0)) {
      alert('Invalid mileage. Must be greater than current mileage.')
      return
    }
    
    try {
      await motorcycleApi.updateMileage(motorcycleId, mileageNum)
      await fetchMotorcycleDetails()
    } catch (error) {
      console.error('Failed to update mileage:', error)
      setError('Failed to update mileage')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <Card className="animate-pulse">
          <CardContent className="h-48"></CardContent>
        </Card>
      </div>
    )
  }

  if (error || !motorcycle) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error || 'Motorcycle not found'}</AlertDescription>
        </Alert>
        <Link href="/garage">
          <Button variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Garage
          </Button>
        </Link>
      </div>
    )
  }

  const overdueCount = upcomingMaintenance.filter(item => item.is_overdue).length
  const upcomingCount = upcomingMaintenance.filter(item => !item.is_overdue).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/garage">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{motorcycle.name}</h1>
            <p className="text-muted-foreground">
              {motorcycle.make} {motorcycle.model} • {motorcycle.year}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/garage/${motorcycleId}/edit`}>
            <Button variant="outline">
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Mileage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDistance(motorcycle.current_mileage)}</div>
            <Button 
              variant="link" 
              size="sm" 
              className="px-0 h-auto text-xs"
              onClick={handleUpdateMileage}
            >
              Update mileage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{motorcycle.engine_size || 'N/A'} cc</div>
            <p className="text-xs text-muted-foreground">
              License: {motorcycle.license_plate || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.maintenanceCount || 0}</div>
            <p className="text-xs">
              {overdueCount > 0 && (
                <span className="text-red-600">{overdueCount} overdue</span>
              )}
              {overdueCount > 0 && upcomingCount > 0 && ' • '}
              {upcomingCount > 0 && (
                <span className="text-orange-600">{upcomingCount} upcoming</span>
              )}
              {overdueCount === 0 && upcomingCount === 0 && (
                <span className="text-green-600">All up to date</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics?.totalCost || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Since {motorcycle.purchase_date ? formatDate(motorcycle.purchase_date) : 'purchase'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintenance'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <WrenchIcon className="w-4 h-4 inline mr-1" />
            Maintenance ({maintenance.length})
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'parts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CogIcon className="w-4 h-4 inline mr-1" />
            Parts ({parts.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapIcon className="w-4 h-4 inline mr-1" />
            Ride Logs ({rideLogs.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Motorcycle Details */}
            <Card>
              <CardHeader>
                <CardTitle>Motorcycle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Make & Model</p>
                    <p className="font-medium">{motorcycle.make} {motorcycle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{motorcycle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engine Size</p>
                    <p className="font-medium">{motorcycle.engine_size || 'N/A'} cc</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Plate</p>
                    <p className="font-medium font-mono">{motorcycle.license_plate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">VIN</p>
                    <p className="font-medium font-mono text-xs">{motorcycle.vin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <p className="font-medium">
                      {motorcycle.purchase_date ? formatDate(motorcycle.purchase_date) : 'N/A'}
                    </p>
                  </div>
                </div>
                {motorcycle.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{motorcycle.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{statistics?.age || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ownership</p>
                    <p className="font-medium">{statistics?.ownershipDays || 0} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg km/year</p>
                    <p className="font-medium">{formatDistance(statistics?.avgKmPerYear || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg km/day</p>
                    <p className="font-medium">{statistics?.avgKmPerDay?.toFixed(1) || 0} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rides</p>
                    <p className="font-medium">{statistics?.totalRides || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                    <p className="font-medium">{formatDistance(statistics?.totalDistance || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Maintenance */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Maintenance</CardTitle>
                <Link href={`/maintenance?motorcycle=${motorcycleId}`}>
                  <Button size="sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Service
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingMaintenance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No upcoming maintenance scheduled
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingMaintenance.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border ${
                          item.is_overdue
                            ? 'border-red-200 bg-red-50'
                            : item.priority === 'high'
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.service_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatServiceType(item.service_type)}
                            </p>
                          </div>
                          <div className="text-right">
                            {item.due_date && (
                              <p className="text-sm">Due: {formatDate(item.due_date)}</p>
                            )}
                            {item.due_mileage && (
                              <p className="text-sm">At: {formatDistance(item.due_mileage)}</p>
                            )}
                            {item.is_overdue && (
                              <p className="text-xs text-red-600 font-medium">
                                {item.days_overdue ? `${item.days_overdue} days overdue` : 'Overdue'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Maintenance History</h3>
              <Link href={`/maintenance?motorcycle=${motorcycleId}`}>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Maintenance
                </Button>
              </Link>
            </div>
            
            {maintenance.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <WrenchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No maintenance records yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {maintenance.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{record.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatServiceType(record.service_type)} • {formatDate(record.performed_at)}
                          </p>
                          <p className="text-sm">
                            At {formatDistance(record.mileage_at_service)} • {formatCurrency(record.total_cost)}
                          </p>
                        </div>
                        <Link href={`/maintenance/${record.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'parts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Parts Inventory</h3>
              <Link href={`/parts?motorcycle=${motorcycleId}`}>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Part
                </Button>
              </Link>
            </div>
            
            {parts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CogIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No parts recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {parts.map((part) => (
                  <Card key={part.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {part.part_number} • {part.manufacturer}
                          </p>
                          <p className="text-sm">
                            Stock: {part.quantity_in_stock} • {formatCurrency(part.unit_price || 0)}
                          </p>
                        </div>
                        <Link href={`/parts/${part.id}`}>
                          <Button variant="ghost" size="sm">Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ride Logs</h3>
              <Link href={`/logs?motorcycle=${motorcycleId}`}>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Ride Log
                </Button>
              </Link>
            </div>
            
            {rideLogs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MapIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No ride logs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rideLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {log.start_location || 'Unknown'} → {log.end_location || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(log.start_date)} • {formatDistance(log.distance || 0)}
                          </p>
                          {log.fuel_efficiency && (
                            <p className="text-sm">
                              Fuel: {log.fuel_consumed}L • {log.fuel_efficiency.toFixed(1)} km/L
                            </p>
                          )}
                        </div>
                        <Link href={`/logs/${log.id}`}>
                          <Button variant="ghost" size="sm">Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}