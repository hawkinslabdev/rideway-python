'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Motorcycle } from '@/lib/types'

interface MotorcycleFormProps {
  motorcycle?: Motorcycle
  onSubmit: (data: Partial<Motorcycle>) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

// Common motorcycle makes for the dropdown
const MOTORCYCLE_MAKES = [
  'Yamaha', 'Honda', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 
  'KTM', 'Harley-Davidson', 'Triumph', 'Aprilia', 'Moto Guzzi',
  'Royal Enfield', 'Indian', 'Husqvarna', 'Beta', 'GasGas', 'Other'
]

export function MotorcycleForm({ motorcycle, onSubmit, onCancel, loading = false }: MotorcycleFormProps) {
  const [formData, setFormData] = useState({
    name: motorcycle?.name || '',
    make: motorcycle?.make || '',
    model: motorcycle?.model || '',
    year: motorcycle?.year || new Date().getFullYear(),
    engine_size: motorcycle?.engine_size || '',
    license_plate: motorcycle?.license_plate || '',
    vin: motorcycle?.vin || '',
    current_mileage: motorcycle?.current_mileage || 0,
    purchase_date: motorcycle?.purchase_date?.split('T')[0] || '',
    purchase_price: motorcycle?.purchase_price || '',
    notes: motorcycle?.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Motorcycle name is required'
    }
    if (!formData.make.trim()) {
      newErrors.make = 'Make is required'
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 2) {
      newErrors.year = 'Please enter a valid year'
    }
    if (formData.current_mileage < 0) {
      newErrors.current_mileage = 'Mileage cannot be negative'
    }
    if (formData.engine_size && (Number(formData.engine_size) < 0 || Number(formData.engine_size) > 3000)) {
      newErrors.engine_size = 'Engine size should be between 0-3000cc'
    }
    if (formData.purchase_price && Number(formData.purchase_price) < 0) {
      newErrors.purchase_price = 'Purchase price cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const submitData: Partial<Motorcycle> = {
      ...formData,
      engine_size: formData.engine_size ? Number(formData.engine_size) : undefined,
      purchase_price: formData.purchase_price ? Number(formData.purchase_price) : undefined,
      purchase_date: formData.purchase_date || undefined,
      // Clean up empty strings
      license_plate: formData.license_plate.trim() || undefined,
      vin: formData.vin.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    }

    await onSubmit(submitData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required fields section */}
      <div className="space-y-4">
        <div className="pb-2 border-b">
          <h3 className="font-semibold text-lg">Basic Information</h3>
          <p className="text-sm text-muted-foreground">Required fields are marked with *</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Motorcycle Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Thumper, Rebel"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Select 
              value={formData.make} 
              onValueChange={(value: string) => handleChange('make', value)}
              disabled={loading}
            >
              <SelectTrigger className={errors.make ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
              <SelectContent>
                {MOTORCYCLE_MAKES.map((make) => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.make && <p className="text-sm text-red-500">{errors.make}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              placeholder="e.g., MT-07, CBR600RR, R1250GS"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className={errors.model ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 2}
              value={formData.year}
              onChange={(e) => handleChange('year', Number(e.target.value))}
              className={errors.year ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="current_mileage">Current Mileage (km) *</Label>
            <Input
              id="current_mileage"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 15000"
              value={formData.current_mileage}
              onChange={(e) => handleChange('current_mileage', Number(e.target.value))}
              className={errors.current_mileage ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.current_mileage && <p className="text-sm text-red-500">{errors.current_mileage}</p>}
          </div>
        </div>
      </div>

      {/* Optional fields section */}
      <div className="space-y-4">
        <div className="pb-2 border-b">
          <h3 className="font-semibold text-lg">Additional Details</h3>
          <p className="text-sm text-muted-foreground">Optional information</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="engine_size">Engine Size (cc)</Label>
            <Input
              id="engine_size"
              type="number"
              min="0"
              max="3000"
              placeholder="e.g., 689, 600, 1254"
              value={formData.engine_size}
              onChange={(e) => handleChange('engine_size', e.target.value)}
              className={errors.engine_size ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.engine_size && <p className="text-sm text-red-500">{errors.engine_size}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="license_plate">License Plate</Label>
            <Input
              id="license_plate"
              placeholder="e.g., AB-123-CD"
              value={formData.license_plate}
              onChange={(e) => handleChange('license_plate', e.target.value.toUpperCase())}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vin">VIN Number</Label>
          <Input
            id="vin"
            placeholder="Vehicle Identification Number (17 characters)"
            value={formData.vin}
            onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
            maxLength={17}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input
              id="purchase_date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.purchase_date}
              onChange={(e) => handleChange('purchase_date', e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Purchase Price (€)</Label>
            <Input
              id="purchase_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 8500.00"
              value={formData.purchase_price}
              onChange={(e) => handleChange('purchase_price', e.target.value)}
              className={errors.purchase_price ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.purchase_price && <p className="text-sm text-red-500">{errors.purchase_price}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about your motorcycle..."
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={loading}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {formData.notes.length}/500 characters
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <Button 
          type="submit" 
          disabled={loading} 
          className="flex-1"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {motorcycle ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            motorcycle ? 'Update Motorcycle' : 'Add Motorcycle'
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}