import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase, type Product, type PackagingConfiguration } from '@/lib/supabase'
import { ProductData, CalculationResults } from '@/App'

interface SaveConfigurationProps {
  selectedProduct: Product | null
  productData: ProductData
  calculationResults: CalculationResults | null
  onSaved?: (config: PackagingConfiguration) => void
}

export default function SaveConfiguration({ 
  selectedProduct, 
  productData, 
  calculationResults,
  onSaved 
}: SaveConfigurationProps) {
  const [configName, setConfigName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!selectedProduct || !calculationResults || !configName.trim()) {
      setError('Please provide a configuration name and ensure calculations are complete')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser()

      const configData: Omit<PackagingConfiguration, 'id' | 'created_at' | 'updated_at'> = {
        product_id: selectedProduct.product_id,
        user_id: user?.id || null,
        configuration_name: configName.trim(),
        
        // Product dimensions
        product_width: productData.productWidth,
        product_length: productData.productLength,
        product_height: productData.productHeight,
        product_weight: productData.productWeight,
        product_cost: productData.productCost,
        
        // Box dimensions (optional)
        box_width: productData.boxWidth,
        box_length: productData.boxLength,
        box_height: productData.boxHeight,
        box_weight: productData.boxWeight,
        box_cost: productData.boxCost,
        
        // Pallet dimensions
        pallet_width: productData.palletWidth,
        pallet_length: productData.palletLength,
        pallet_max_height: productData.palletMaxHeight,
        
        // Order details
        target_pallets: productData.targetPallets,
        target_products: productData.targetProducts,
        production_speed: productData.productionSpeed,
        working_days: productData.workingDays,
        deadline: productData.deadline?.toISOString().split('T')[0],
        
        // Calculated results
        units_per_box: calculationResults.unitsPerBox,
        boxes_per_pallet_layer: calculationResults.boxesPerPalletLayer,
        layers_per_pallet: calculationResults.layersPerPallet,
        total_units_per_pallet: calculationResults.totalUnitsPerPallet,
        total_boxes_needed: calculationResults.totalBoxesNeeded,
        total_pallets_needed: calculationResults.totalPalletsNeeded,
        
        // Weight calculations
        weight_per_box: calculationResults.weightPerBox,
        weight_per_pallet_layer: calculationResults.weightPerPalletLayer,
        weight_per_pallet: calculationResults.weightPerPallet,
        total_weight: calculationResults.totalWeight,
        
        // Cost calculations
        cost_per_box: calculationResults.costPerBox,
        cost_per_pallet_layer: calculationResults.costPerPalletLayer,
        cost_per_pallet: calculationResults.costPerPallet,
        total_cost: calculationResults.totalCost,
        
        // Timeline
        estimated_days: calculationResults.estimatedDays,
        daily_production: calculationResults.dailyProduction,
        
        // Efficiency metrics
        pallet_utilization: calculationResults.palletUtilization,
        box_utilization: calculationResults.boxUtilization
      }

      const { data, error } = await supabase
        .from('packaging_configurations')
        .upsert([configData], { 
          onConflict: 'product_id,user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error

      setSaved(true)
      onSaved?.(data)
      
      // Reset form after successful save
      setTimeout(() => {
        setSaved(false)
        setConfigName('')
        setNotes('')
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (!selectedProduct) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Save className="w-5 h-5" />
            Save Configuration
          </CardTitle>
          <CardDescription>
            Select a product first to save packaging configuration
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!calculationResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Save className="w-5 h-5" />
            Save Configuration
          </CardTitle>
          <CardDescription>
            Complete the packaging calculations to save configuration
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Configuration
        </CardTitle>
        <CardDescription>
          Save this packaging configuration for {selectedProduct.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
            </div>
            <Badge variant="outline">
              ${Number(selectedProduct.base_price).toFixed(2)}
            </Badge>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-blue-900">Total Pallets</p>
            <p className="text-lg font-bold text-blue-700">{calculationResults.totalPalletsNeeded}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Total Cost</p>
            <p className="text-lg font-bold text-blue-700">${calculationResults.totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Pallet Efficiency</p>
            <p className="text-lg font-bold text-blue-700">{calculationResults.palletUtilization.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Estimated Days</p>
            <p className="text-lg font-bold text-blue-700">{calculationResults.estimatedDays}</p>
          </div>
        </div>

        {/* Save Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="configName">Configuration Name *</Label>
            <Input
              id="configName"
              placeholder="e.g., Standard Pallet Config, Export Configuration..."
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this configuration..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-600">Configuration saved successfully!</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || !configName.trim() || saved}
            className="w-full"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}