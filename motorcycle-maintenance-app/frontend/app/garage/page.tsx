'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motorcycleApi } from '@/lib/api'
import { formatDistance, formatDate } from '@/lib/utils'
import type { Motorcycle } from '@/lib/types'
import { PlusIcon, PencilIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'

export default function GaragePage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetchMotorcycles()
  }, [showArchived])

  const fetchMotorcycles = async () => {
    try {
      setLoading(true)
      const response = await motorcycleApi.getAll(showArchived)
      setMotorcycles(response.data)
    } catch (error) {
      console.error('Failed to fetch motorcycles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (id: number) => {
    if (confirm('Are you sure you want to archive this motorcycle?')) {
      try {
        await motorcycleApi.delete(id)
        await fetchMotorcycles()
      } catch (error) {
        console.error('Failed to archive motorcycle:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Garage</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Garage</h1>
          <p className="text-muted-foreground">
            Manage your motorcycles and their information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Link href="/garage/add">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Motorcycle
            </Button>
          </Link>
        </div>
      </div>

      {motorcycles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🏍️</div>
            <h3 className="text-lg font-semibold mb-2">No Motorcycles Found</h3>
            <p className="text-muted-foreground mb-4">
              {showArchived 
                ? "You don't have any archived motorcycles."
                : "Get started by adding your first motorcycle to track its maintenance."
              }
            </p>
            {!showArchived && (
              <Link href="/garage/add">
                <Button>Add Your First Motorcycle</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {motorcycles.map((motorcycle) => (
            <Card key={motorcycle.id} className={motorcycle.is_archived ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{motorcycle.name}</CardTitle>
                  <div className="flex gap-1">
                    <Link href={`/garage/${motorcycle.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Link>
                    {!motorcycle.is_archived && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleArchive(motorcycle.id)}
                      >
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Make & Model</p>
                  <p className="font-semibold">{motorcycle.make} {motorcycle.model}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Year</p>
                    <p className="font-medium">{motorcycle.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engine</p>
                    <p className="font-medium">{motorcycle.engine_size || 'N/A'} cc</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Current Mileage</p>
                  <p className="font-semibold text-lg">
                    {formatDistance(motorcycle.current_mileage)}
                  </p>
                </div>

                {motorcycle.license_plate && (
                  <div>
                    <p className="text-muted-foreground text-sm">License Plate</p>
                    <p className="font-medium font-mono">{motorcycle.license_plate}</p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(motorcycle.created_at)}
                  </p>
                  {motorcycle.is_archived && (
                    <p className="text-xs text-orange-600 font-medium">Archived</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
