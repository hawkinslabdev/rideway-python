// frontend/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

// Distance/mileage formatting (European format)
export function formatDistance(distance: number | null | undefined): string {
  if (distance == null) return 'N/A'
  return new Intl.NumberFormat('de-DE').format(Math.round(distance)) + ' km'
}

export function formatMileage(mileage: number | null | undefined): string {
  return formatDistance(mileage)
}

// Currency formatting (European format with Euro)
export function formatCurrency(amount: number | null | undefined, currency = 'EUR'): string {
  if (amount == null) return 'N/A'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Calculate days between dates
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate if maintenance is overdue
export function isMaintenanceOverdue(
  nextServiceDate?: string,
  nextServiceMileage?: number,
  currentMileage?: number
): boolean {
  const now = new Date()
  
  // Check date-based overdue
  if (nextServiceDate) {
    const serviceDate = new Date(nextServiceDate)
    if (serviceDate < now) return true
  }
  
  // Check mileage-based overdue
  if (nextServiceMileage && currentMileage) {
    if (currentMileage >= nextServiceMileage) return true
  }
  
  return false
}

// Get maintenance priority
export function getMaintenancePriority(
  nextServiceDate?: string,
  nextServiceMileage?: number,
  currentMileage?: number
): 'low' | 'medium' | 'high' {
  const now = new Date()
  
  // Check if overdue
  if (isMaintenanceOverdue(nextServiceDate, nextServiceMileage, currentMileage)) {
    return 'high'
  }
  
  // Check if due soon (within 30 days or 1000km)
  if (nextServiceDate) {
    const serviceDate = new Date(nextServiceDate)
    const daysUntilService = Math.ceil((serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilService <= 30) return 'medium'
  }
  
  if (nextServiceMileage && currentMileage) {
    const mileageUntilService = nextServiceMileage - currentMileage
    if (mileageUntilService <= 1000) return 'medium'
  }
  
  return 'low'
}

// Format service type for display
export function formatServiceType(serviceType: string): string {
  return serviceType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Generate next service date based on interval
export function calculateNextServiceDate(
  lastServiceDate: string,
  intervalMonths: number
): string {
  const lastDate = new Date(lastServiceDate)
  const nextDate = new Date(lastDate)
  nextDate.setMonth(nextDate.getMonth() + intervalMonths)
  return nextDate.toISOString().split('T')[0]
}

// Generate next service mileage
export function calculateNextServiceMileage(
  lastServiceMileage: number,
  intervalKm: number
): number {
  return lastServiceMileage + intervalKm
}

// Validate VIN number (basic validation)
export function isValidVIN(vin: string): boolean {
  if (!vin) return true // VIN is optional
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)
}

// Validate license plate (basic European format)
export function isValidLicensePlate(plate: string): boolean {
  if (!plate) return true // License plate is optional
  // Basic validation - adjust for your country's format
  return /^[A-Z0-9\-]{2,10}$/i.test(plate)
}

// Format fuel efficiency
export function formatFuelEfficiency(efficiency: number | null | undefined): string {
  if (efficiency == null) return 'N/A'
  return efficiency.toFixed(1) + ' L/100km'
}

// Convert L/100km to km/L and vice versa
export function convertFuelEfficiency(value: number, fromUnit: 'l100km' | 'kml'): number {
  if (fromUnit === 'l100km') {
    return 100 / value // L/100km to km/L
  } else {
    return 100 / value // km/L to L/100km
  }
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}