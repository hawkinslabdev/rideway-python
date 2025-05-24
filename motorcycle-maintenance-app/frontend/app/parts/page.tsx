'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { partsApiExtended, motorcycleApi } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Part, Motorcycle } from '@/lib/types'
import { 
  PlusIcon, 
  CogIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function PartsPage() {
  const searchParams = useSearchParams()
  const preselectedMotorcycle = searchParams.get('motorcycle')
  
  const [parts, setParts] = useState<Part[]>([])
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  // Filters
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<string>(preselectedMotorcycle || 'all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Statistics
  const [stats, setStats] = useState({
    totalParts: 0,
    totalValue: 0,
    lowStockCount: 0,
    categoriesCount: 0
  })

  // Use part modal
  const [usePartModal, setUsePartModal] = useState<{ part: Part | null; isOpen: boolean }>({
    part: null,
    isOpen: false
  })
  const [useQuantity, setUseQuantity] = useState<number>(1)
  const [useLoading, setUseLoading] = useState(false)

  // Restock modal
  const [restockModal, setRestockModal] = useState<{ part: Part | null; isOpen: boolean }>({
    part: null,
    isOpen: false
  })
  const [restockQuantity, setRestockQuantity] = useState<number>(1)
  const [restockPrice, setRestockPrice] = useState<string>('')
  const [restockLoading, setRestockLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [parts, selectedMotorcycle, selectedCategory, stockFilter, searchQuery])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch motorcycles
      const motorcyclesRes = await motorcycleApi.getAll()
      setMotorcycles(motorcyclesRes.data || [])
      
      // Fetch all parts
      const partsRes = await partsApiExtended.getAll()
      const partsData = partsRes.data || []
      setParts(partsData)
      
      // Calculate statistics
      calculateStats(partsData)
      
    } catch (error: any) {
      console.error('Failed to fetch parts:', error)
      setError('Failed to load parts data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (partsList: Part[]) => {
    const totalValue = partsList.reduce((sum, part) => {
      return sum + ((part.unit_price || 0) * part.quantity_in_stock)
    }, 0)
    
    const lowStockCount = partsList.filter(part => 
      part.quantity_in_stock <= 5 && part.quantity_in_stock > 0
    ).length
    
    const categories = new Set(partsList.map(part => part.category).filter(Boolean))
    
    setStats({
      totalParts: partsList.length,
      totalValue,
      lowStockCount,
      categoriesCount: categories.size
    })
  }

  const applyFilters = () => {
    let filtered = [...parts]
    
    // Motorcycle filter
    if (selectedMotorcycle !== 'all') {
      filtered = filtered.filter(part => part.motorcycle_id === parseInt(selectedMotorcycle))
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(part => part.category === selectedCategory)
    }
    
    // Stock filter
    switch (stockFilter) {
      case 'in-stock':
        filtered = filtered.filter(part => part.quantity_in_stock > 0)
        break
      case 'low-stock':
        filtered = filtered.filter(part => part.quantity_in_stock <= 5 && part.quantity_in_stock > 0)
        break
      case 'out-of-stock':
        filtered = filtered.filter(part => part.quantity_in_stock === 0)
        break
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(part => 
        part.name.toLowerCase().includes(query) ||
        part.part_number?.toLowerCase().includes(query) ||
        part.manufacturer?.toLowerCase().includes(query) ||
        part.category?.toLowerCase().includes(query)
      )
    }
    
    setFilteredParts(filtered)
  }

  const handleUsePart = async () => {
    if (!usePartModal.part || useQuantity <= 0) return
    
    try {
      setUseLoading(true)
      await partsApiExtended.use(usePartModal.part.id, useQuantity)
      await fetchData()
      setUsePartModal({ part: null, isOpen: false })
      setUseQuantity(1)
    } catch (error: any) {
      console.error('Failed to use part:', error)
      setError(error.response?.data?.detail || 'Failed to use part')
    } finally {
      setUseLoading(false)
    }
  }

  const handleRestockPart = async () => {
    if (!restockModal.part || restockQuantity <= 0) return
    
    try {
      setRestockLoading(true)
      const price = restockPrice ? parseFloat(restockPrice) : undefined
      await partsApiExtended.restock(restockModal.part.id, restockQuantity, price)
      await fetchData()
      setRestockModal({ part: null, isOpen: false })
      setRestockQuantity(1)
      setRestockPrice('')
    } catch (error: any) {
      console.error('Failed to restock part:', error)
      setError(error.response?.data?.detail || 'Failed to restock part')
    } finally {
      setRestockLoading(false)
    }
  }

  const getStockStatus = (part: Part) => {
    if (part.quantity_in_stock === 0) {
      return { label: 'Out of Stock', color: 'text-red-600 bg-red-100' }
    } else if (part.quantity_in_stock <= 5) {
      return { label: 'Low Stock', color: 'text-orange-600 bg-orange-100' }
    }
    return { label: 'In Stock', color: 'text-green-600 bg-green-100' }
  }

  const getUniqueCategories = () => {
    const categories = new Set(parts.map(part => part.category).filter(Boolean))
    return Array.from(categories).sort()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Parts Inventory</h1>
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
          <h1 className="text-3xl font-bold">Parts Inventory</h1>
          <p className="text-muted-foreground">
            Manage your motorcycle parts and inventory
          </p>
        </div>
        <Link href={`/parts/add${preselectedMotorcycle ? `?motorcycle=${preselectedMotorcycle}` : ''}`}>
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParts}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.categoriesCount} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">
              Different part types
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Motorcycle Filter */}
            <div className="space-y-2">
              <Label htmlFor="motorcycle">Motorcycle</Label>
              <Select value={selectedMotorcycle} onValueChange={setSelectedMotorcycle}>
                <SelectTrigger id="motorcycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Motorcycles</SelectItem>
                  {motorcycles.map((motorcycle) => (
                    <SelectItem key={motorcycle.id} value={motorcycle.id.toString()}>
                      {motorcycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueCategories().map((category) => (
                    <SelectItem key={category ?? 'uncategorized'} value={category ?? 'uncategorized'}>
                      {category ?? 'Uncategorized'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Filter */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Status</Label>
              <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
                <SelectTrigger id="stock">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parts List */}
      {filteredParts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CogIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No parts found</p>
            <p className="text-muted-foreground mb-4">
              {parts.length === 0 
                ? "Start building your parts inventory" 
                : "Try adjusting your filters"
              }
            </p>
            {parts.length === 0 && (
              <Link href="/parts/add">
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Part
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParts.map((part) => {
            const motorcycle = motorcycles.find(m => m.id === part.motorcycle_id)
            const stockStatus = getStockStatus(part)
            
            return (
              <Card key={part.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{part.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {motorcycle?.name || 'Unknown Motorcycle'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Part Number</p>
                      <p className="font-medium font-mono">{part.part_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{part.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stock</p>
                      <p className="font-medium">{part.quantity_in_stock} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Price</p>
                      <p className="font-medium">{formatCurrency(part.unit_price || 0)}</p>
                    </div>
                  </div>

                  {part.manufacturer && (
                    <div>
                      <p className="text-muted-foreground text-sm">Manufacturer</p>
                      <p className="font-medium text-sm">{part.manufacturer}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setUsePartModal({ part, isOpen: true })}
                      disabled={part.quantity_in_stock === 0}
                    >
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setRestockModal({ part, isOpen: true })}
                    >
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                      Restock
                    </Button>
                    <Link href={`/parts/${part.id}`}>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Use Part Modal */}
      {usePartModal.isOpen && usePartModal.part && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Use Part</CardTitle>
              <p className="text-sm text-muted-foreground">
                {usePartModal.part.name} (Available: {usePartModal.part.quantity_in_stock})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="useQuantity">Quantity to Use</Label>
                <Input
                  id="useQuantity"
                  type="number"
                  min="1"
                  max={usePartModal.part.quantity_in_stock}
                  value={useQuantity}
                  onChange={(e) => setUseQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUsePart} 
                  disabled={useLoading || useQuantity > usePartModal.part.quantity_in_stock}
                  className="flex-1"
                >
                  {useLoading ? 'Using...' : 'Use Part'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setUsePartModal({ part: null, isOpen: false })}
                  disabled={useLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Restock Part Modal */}
      {restockModal.isOpen && restockModal.part && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Restock Part</CardTitle>
              <p className="text-sm text-muted-foreground">
                {restockModal.part.name} (Current Stock: {restockModal.part.quantity_in_stock})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restockQuantity">Quantity to Add</Label>
                <Input
                  id="restockQuantity"
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restockPrice">Unit Price (optional)</Label>
                <Input
                  id="restockPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={restockPrice}
                  onChange={(e) => setRestockPrice(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRestockPart} 
                  disabled={restockLoading}
                  className="flex-1"
                >
                  {restockLoading ? 'Restocking...' : 'Restock'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setRestockModal({ part: null, isOpen: false })}
                  disabled={restockLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}