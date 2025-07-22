import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Package, DollarSign, Settings, Calendar } from 'lucide-react'
import { ProductData } from '../App'

interface ProductInputFormProps {
  data: ProductData
  onUpdate: (newData: Partial<ProductData>) => void
}

export default function ProductInputForm({ data, onUpdate }: ProductInputFormProps) {
  const [useBoxDimensions, setUseBoxDimensions] = useState(false)
  const [useTargetPallets, setUseTargetPallets] = useState(false)

  const handleInputChange = (field: keyof ProductData, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    onUpdate({ [field]: numValue })
  }

  return (
    <div className="space-y-6">
      {/* Product Dimensions - Mandatory */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Dimensions
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </CardTitle>
          <CardDescription>
            Enter the dimensions of a single product unit (in millimeters)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productWidth">Width (mm)</Label>
              <Input
                id="productWidth"
                type="number"
                value={data.productWidth || ''}
                onChange={(e) => handleInputChange('productWidth', e.target.value)}
                placeholder="e.g., 100"
                className={!data.productWidth ? 'border-red-300' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productLength">Length (mm)</Label>
              <Input
                id="productLength"
                type="number"
                value={data.productLength || ''}
                onChange={(e) => handleInputChange('productLength', e.target.value)}
                placeholder="e.g., 150"
                className={!data.productLength ? 'border-red-300' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productHeight">Height (mm)</Label>
              <Input
                id="productHeight"
                type="number"
                value={data.productHeight || ''}
                onChange={(e) => handleInputChange('productHeight', e.target.value)}
                placeholder="e.g., 50"
                className={!data.productHeight ? 'border-red-300' : ''}
              />
            </div>
          </div>
          {(!data.productWidth || !data.productLength || !data.productHeight) && (
            <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Product dimensions are required for calculations
            </div>
          )}
        </CardContent>
      </Card>

      {/* Box Container Dimensions - Optional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Box Container Dimensions
            <Badge variant="outline" className="text-xs">Optional</Badge>
          </CardTitle>
          <CardDescription>
            If products are packed in boxes, specify box dimensions
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Switch
              id="use-box"
              checked={useBoxDimensions}
              onCheckedChange={setUseBoxDimensions}
            />
            <Label htmlFor="use-box">Pack products in boxes</Label>
          </div>
        </CardHeader>
        {useBoxDimensions && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="boxWidth">Box Width (mm)</Label>
                <Input
                  id="boxWidth"
                  type="number"
                  value={data.boxWidth || ''}
                  onChange={(e) => handleInputChange('boxWidth', e.target.value)}
                  placeholder="e.g., 300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boxLength">Box Length (mm)</Label>
                <Input
                  id="boxLength"
                  type="number"
                  value={data.boxLength || ''}
                  onChange={(e) => handleInputChange('boxLength', e.target.value)}
                  placeholder="e.g., 450"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boxHeight">Box Height (mm)</Label>
                <Input
                  id="boxHeight"
                  type="number"
                  value={data.boxHeight || ''}
                  onChange={(e) => handleInputChange('boxHeight', e.target.value)}
                  placeholder="e.g., 150"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pallet Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Pallet Configuration
          </CardTitle>
          <CardDescription>
            Standard pallet dimensions and height constraints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="palletWidth">Pallet Width (mm)</Label>
              <Input
                id="palletWidth"
                type="number"
                value={data.palletWidth || 1200}
                onChange={(e) => handleInputChange('palletWidth', e.target.value)}
                placeholder="1200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="palletLength">Pallet Length (mm)</Label>
              <Input
                id="palletLength"
                type="number"
                value={data.palletLength || 800}
                onChange={(e) => handleInputChange('palletLength', e.target.value)}
                placeholder="800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="palletMaxHeight">Max Height (mm)</Label>
              <Input
                id="palletMaxHeight"
                type="number"
                value={data.palletMaxHeight || 1800}
                onChange={(e) => handleInputChange('palletMaxHeight', e.target.value)}
                placeholder="1800"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Weight and Cost Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-600" />
              Weight Information
            </CardTitle>
            <CardDescription>
              Weight per unit and packaging materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productWeight">Product Weight (kg)</Label>
                <Input
                  id="productWeight"
                  type="number"
                  step="0.001"
                  value={data.productWeight || ''}
                  onChange={(e) => handleInputChange('productWeight', e.target.value)}
                  placeholder="e.g., 0.5"
                />
              </div>
              {useBoxDimensions && (
                <div className="space-y-2">
                  <Label htmlFor="boxWeight">Box Weight (kg)</Label>
                  <Input
                    id="boxWeight"
                    type="number"
                    step="0.001"
                    value={data.boxWeight || ''}
                    onChange={(e) => handleInputChange('boxWeight', e.target.value)}
                    placeholder="e.g., 0.1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Cost Information
            </CardTitle>
            <CardDescription>
              Production costs and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productCost">Product Cost ($)</Label>
                <Input
                  id="productCost"
                  type="number"
                  step="0.01"
                  value={data.productCost || ''}
                  onChange={(e) => handleInputChange('productCost', e.target.value)}
                  placeholder="e.g., 12.50"
                />
              </div>
              {useBoxDimensions && (
                <div className="space-y-2">
                  <Label htmlFor="boxCost">Box Cost ($)</Label>
                  <Input
                    id="boxCost"
                    type="number"
                    step="0.01"
                    value={data.boxCost || ''}
                    onChange={(e) => handleInputChange('boxCost', e.target.value)}
                    placeholder="e.g., 1.20"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Order Configuration
          </CardTitle>
          <CardDescription>
            Production targets and timeline parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Target Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-target-pallets"
                  checked={useTargetPallets}
                  onCheckedChange={setUseTargetPallets}
                />
                <Label htmlFor="use-target-pallets">
                  {useTargetPallets ? 'Target Number of Pallets' : 'Target Number of Products'}
                </Label>
              </div>
              
              {useTargetPallets ? (
                <div className="space-y-2">
                  <Label htmlFor="targetPallets">Number of Pallets</Label>
                  <Input
                    id="targetPallets"
                    type="number"
                    value={data.targetPallets || ''}
                    onChange={(e) => handleInputChange('targetPallets', e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="targetProducts">Number of Products</Label>
                  <Input
                    id="targetProducts"
                    type="number"
                    value={data.targetProducts || ''}
                    onChange={(e) => handleInputChange('targetProducts', e.target.value)}
                    placeholder="e.g., 1000"
                  />
                </div>
              )}
            </div>

            {/* Production Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productionSpeed">Production Speed (units/day)</Label>
                <Input
                  id="productionSpeed"
                  type="number"
                  value={data.productionSpeed || 100}
                  onChange={(e) => handleInputChange('productionSpeed', e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingDays">Working Days per Week</Label>
                <Input
                  id="workingDays"
                  type="number"
                  min="1"
                  max="7"
                  value={data.workingDays || 5}
                  onChange={(e) => handleInputChange('workingDays', e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}