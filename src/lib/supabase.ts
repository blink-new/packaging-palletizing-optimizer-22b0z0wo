import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Product {
  product_id: number
  sku: string
  name: string
  description?: string
  category_id?: number
  unit_of_measure?: string
  base_price: number
  min_stock_level?: number
  created_at?: string
  updated_at?: string
  recomended_price?: number
  company_id?: string
  barcode?: string
  qr_code?: string
}

export interface PackagingConfiguration {
  id?: number
  product_id: number
  user_id?: string
  configuration_name: string
  
  // Product dimensions
  product_width: number
  product_length: number
  product_height: number
  product_weight: number
  product_cost: number
  
  // Box dimensions (optional)
  box_width?: number
  box_length?: number
  box_height?: number
  box_weight?: number
  box_cost?: number
  
  // Pallet dimensions
  pallet_width: number
  pallet_length: number
  pallet_max_height?: number
  
  // Order details
  target_pallets?: number
  target_products?: number
  production_speed: number
  working_days: number
  deadline?: string
  
  // Calculated results
  units_per_box?: number
  boxes_per_pallet_layer?: number
  layers_per_pallet?: number
  total_units_per_pallet?: number
  total_boxes_needed?: number
  total_pallets_needed?: number
  
  // Weight calculations
  weight_per_box?: number
  weight_per_pallet_layer?: number
  weight_per_pallet?: number
  total_weight?: number
  
  // Cost calculations
  cost_per_box?: number
  cost_per_pallet_layer?: number
  cost_per_pallet?: number
  total_cost?: number
  
  // Timeline
  estimated_days?: number
  daily_production?: number
  
  // Efficiency metrics
  pallet_utilization?: number
  box_utilization?: number
  
  created_at?: string
  updated_at?: string
}

export interface NutritionFacts {
  id?: number
  user_id?: string
  product_id?: number
  label_name: string
  
  // Basic serving info
  serving_size: string
  serving_size_metric: string
  servings_per_container: string
  calories: number
  
  // Fats
  total_fat_g: number
  total_fat_dv: number
  saturated_fat_g: number
  saturated_fat_dv: number
  trans_fat_g: number
  
  // Other nutrients
  cholesterol_mg: number
  cholesterol_dv: number
  sodium_mg: number
  sodium_dv: number
  total_carbohydrate_g: number
  total_carbohydrate_dv: number
  dietary_fiber_g: number
  dietary_fiber_dv: number
  total_sugars_g: number
  added_sugars_g: number
  added_sugars_dv: number
  protein_g: number
  
  // Vitamins and minerals
  vitamin_d_mcg: number
  vitamin_d_dv: number
  calcium_mg: number
  calcium_dv: number
  iron_mg: number
  iron_dv: number
  potassium_mg: number
  potassium_dv: number
  
  // Bilingual support
  is_bilingual: boolean
  language_primary: string
  language_secondary: string
  
  created_at?: string
  updated_at?: string
}

export interface NutritionLabelTemplate {
  id: number
  user_id?: string
  template_name: string
  template_type: string
  html_template: string
  css_template: string
  js_template?: string
  is_default: boolean
  created_at?: string
  updated_at?: string
}