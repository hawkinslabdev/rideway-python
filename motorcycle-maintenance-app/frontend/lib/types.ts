// frontend/lib/types.ts
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
  notes?: string
  is_active: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
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
  photos?: string[]
  is_completed: boolean
  is_scheduled: boolean
  created_at: string
  updated_at: string
  motorcycle?: Motorcycle
}

export interface Part {
  id: number
  motorcycle_id: number
  name: string
  part_number?: string
  manufacturer?: string
  category?: string
  quantity_in_stock: number
  quantity_used: number
  unit_price?: number
  total_cost?: number
  currency: string
  purchase_date?: string
  vendor?: string
  installed_date?: string
  installed_mileage?: number
  replacement_interval_km?: number
  replacement_interval_months?: number
  receipt_path?: string
  installation_notes?: string
  is_installed: boolean
  is_consumable: boolean
  created_at: string
  updated_at: string
  motorcycle?: Motorcycle
}

export interface RideLog {
  id: number
  motorcycle_id: number
  start_date: string
  end_date?: string
  start_mileage: number
  end_mileage?: number
  distance?: number
  fuel_consumed?: number
  fuel_cost?: number
  fuel_efficiency?: number
  start_location?: string
  end_location?: string
  route_description?: string
  weather_conditions?: string
  road_conditions?: string
  trip_type?: string
  notes?: string
  created_at: string
  updated_at: string
  motorcycle?: Motorcycle
}

export interface WebhookConfig {
  id: number
  name: string
  url: string
  secret?: string
  is_active: boolean
  event_types?: string[]
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

export enum ServiceType {
  OIL_CHANGE = "oil_change",
  TIRE_REPLACEMENT = "tire_replacement", 
  BRAKE_SERVICE = "brake_service",
  CHAIN_MAINTENANCE = "chain_maintenance",
  VALVE_ADJUSTMENT = "valve_adjustment",
  SPARK_PLUG = "spark_plug",
  AIR_FILTER = "air_filter",
  COOLANT_CHANGE = "coolant_change",
  GENERAL_INSPECTION = "general_inspection",
  CUSTOM = "custom"
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface DashboardStats {
  total_motorcycles: number
  active_motorcycles: number
  total_mileage: number
  upcoming_services: number
  overdue_services: number
  monthly_expenses: number
  recent_activities: MaintenanceRecord[]
}

export interface UpcomingMaintenance {
  id: number
  motorcycle_name: string
  service_name: string
  due_date?: string
  due_mileage?: number
  current_mileage: number
  days_overdue?: number
  mileage_overdue?: number
  is_overdue: boolean
  priority: 'low' | 'medium' | 'high'
}