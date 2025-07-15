import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Layers, 
  Truck, 
  Weight, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { ProductData, CalculationResults } from '../App'

interface PackagingCalculatorProps {
  data: ProductData
  results: CalculationResults | null
}

export default function PackagingCalculator({ data, results }: PackagingCalculatorProps) {
  if (!results) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Package className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">Enter product dimensions to see calculations</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getEfficiencyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pallets</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.totalPalletsNeeded}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(results.totalUnitsPerPallet)} units per pallet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boxes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.totalBoxesNeeded}</div>
            <p className="text-xs text-muted-foreground">
              {results.unitsPerBox} units per box
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(results.totalWeight, 1)} kg</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(results.weightPerPallet, 1)} kg per pallet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(results.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(results.costPerPallet)} per pallet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Packing Efficiency
          </CardTitle>
          <CardDescription>
            Space utilization and optimization metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pallet Utilization</span>
                {getEfficiencyBadge(results.palletUtilization)}
              </div>
              <Progress value={results.palletUtilization} className="h-2" />
              <p className={`text-sm ${getEfficiencyColor(results.palletUtilization)}`}>
                {formatNumber(results.palletUtilization, 1)}% of pallet area used
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Box Utilization</span>
                {getEfficiencyBadge(results.boxUtilization)}
              </div>
              <Progress value={results.boxUtilization} className="h-2" />
              <p className={`text-sm ${getEfficiencyColor(results.boxUtilization)}`}>
                {formatNumber(results.boxUtilization, 1)}% of box volume used
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packaging Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Packaging Structure
            </CardTitle>
            <CardDescription>
              Hierarchical breakdown of packaging units
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Units per Box</span>
                <span className="text-lg font-semibold">{results.unitsPerBox}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Boxes per Layer</span>
                <span className="text-lg font-semibold">{results.boxesPerPalletLayer}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Layers per Pallet</span>
                <span className="text-lg font-semibold">{results.layersPerPallet}</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-blue-50 px-3 rounded">
                <span className="font-bold">Total Units per Pallet</span>
                <span className="text-xl font-bold text-blue-600">{results.totalUnitsPerPallet}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="w-5 h-5 text-orange-600" />
              Weight Distribution
            </CardTitle>
            <CardDescription>
              Weight breakdown by packaging level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Per Box</span>
                <span className="text-lg font-semibold">{formatNumber(results.weightPerBox, 2)} kg</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Per Layer</span>
                <span className="text-lg font-semibold">{formatNumber(results.weightPerPalletLayer, 1)} kg</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Per Pallet</span>
                <span className="text-lg font-semibold">{formatNumber(results.weightPerPallet, 1)} kg</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-orange-50 px-3 rounded">
                <span className="font-bold">Total Weight</span>
                <span className="text-xl font-bold text-orange-600">{formatNumber(results.totalWeight, 1)} kg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Cost Analysis
          </CardTitle>
          <CardDescription>
            Detailed cost breakdown and financial projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Per Box</div>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(results.costPerBox)}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Per Layer</div>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(results.costPerPalletLayer)}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Per Pallet</div>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(results.costPerPallet)}</div>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-200">
              <div className="text-sm text-green-600 font-medium">Total Order</div>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(results.totalCost)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Optimization Insights
          </CardTitle>
          <CardDescription>
            Recommendations to improve packing efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.palletUtilization < 80 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low pallet utilization ({formatNumber(results.palletUtilization, 1)}%):</strong> 
                  Consider adjusting box dimensions or product arrangement to better fill the pallet space.
                </AlertDescription>
              </Alert>
            )}
            
            {results.boxUtilization < 70 && data.boxWidth && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low box utilization ({formatNumber(results.boxUtilization, 1)}%):</strong> 
                  The current box size is too large for the products. Consider smaller box dimensions.
                </AlertDescription>
              </Alert>
            )}

            {results.palletUtilization >= 80 && results.boxUtilization >= 80 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Excellent packing efficiency!</strong> 
                  Your current configuration makes optimal use of space.
                </AlertDescription>
              </Alert>
            )}

            {results.layersPerPallet === 1 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Single layer stacking:</strong> 
                  You may be able to stack more layers if the product can support additional weight.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}