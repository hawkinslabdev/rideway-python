export interface Motorcycle {
  id: number
  name: string
  make: string
  model: string
  year: number
  engine_size?: number
  license_plate?: string
  vin?: string
  current_mileage: number
  purchase_date?: string
  purchase_price?: number
  is_active: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  notes?: string
}

export interface MaintenanceRecord {
  id: number
  motorcycle_id: number
  service_type: ServiceType
  service_name: string
  description?: string
  performed_at: string
  mileage_at_service: number
  next_service_mileage?: number
  next_service_date?: string
  service_interval_km?: number
  service_interval_months?: number
  labor_cost: number
  parts_cost: number
  total_cost: number
  currency: string
  service_provider?: string
  technician?: string
  receipt_path?: string
  photos?: string
  is_completed: boolean
  is_scheduled: boolean
  created_at: string
  updated_at: string
}

export enum ServiceType {
  OIL_CHANGE = 'oil_change',
  TIRE_REPLACEMENT = 'tire_replacement',
  BRAKE_SERVICE = 'brake_service',
  CHAIN_MAINTENANCE = 'chain_maintenance',
  VALVE_ADJUSTMENT = 'valve_adjustment',
  SPARK_PLUG = 'spark_plug',
  AIR_FILTER = 'air_filter',
  COOLANT_CHANGE = 'coolant_change',
  GENERAL_INSPECTION = 'general_inspection',
  CUSTOM = 'custom'
}

export interface WebhookConfig {
  id: number
  name: string
  url: string
  secret?: string
  is_active: boolean
  event_types: string[]
  service_type: string
  max_retries: number
  retry_delay: number
  created_at: string
  updated_at: string
  last_triggered?: string
  total_calls: number
  successful_calls: number
  failed_calls: number
}