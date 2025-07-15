import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Calculator, TruckIcon, ChartBar, Save, Settings, FileText } from 'lucide-react'
import ProductInputForm from '@/components/ProductInputForm'
import PackagingCalculator from '@/components/PackagingCalculator'
import TruckVisualization from '@/components/TruckVisualization'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import ProductSelector from '@/components/ProductSelector'
import SaveConfiguration from '@/components/SaveConfiguration'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import NutritionLabelGenerator from '@/components/NutritionLabelGenerator'
import { type Product } from '@/lib/supabase'

export interface ProductData {
  // Product dimensions (mandatory)
  productWidth: number
  productLength: number
  productHeight: number
  
  // Box dimensions (optional)
  boxWidth?: number
  boxLength?: number
  boxHeight?: number
  
  // Pallet dimensions
  palletWidth: number
  palletLength: number
  palletMaxHeight?: number
  
  // Weight data
  productWeight: number
  boxWeight?: number
  
  // Cost data
  productCost: number
  boxCost?: number
  
  // Order details
  targetPallets?: number
  targetProducts?: number
  productionSpeed: number // units per day
  workingDays: number // days per week
  deadline?: Date
}

export interface CalculationResults {
  unitsPerBox: number
  boxesPerPalletLayer: number
  layersPerPallet: number
  totalUnitsPerPallet: number
  totalBoxesNeeded: number
  totalPalletsNeeded: number
  
  // Weight calculations
  weightPerBox: number
  weightPerPalletLayer: number
  weightPerPallet: number
  totalWeight: number
  
  // Cost calculations
  costPerBox: number
  costPerPalletLayer: number
  costPerPallet: number
  totalCost: number
  
  // Timeline
  estimatedDays: number
  dailyProduction: number
  
  // Efficiency metrics
  palletUtilization: number
  boxUtilization: number
}

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productData, setProductData] = useState<ProductData>({
    productWidth: 0,
    productLength: 0,
    productHeight: 0,
    palletWidth: 1200, // Standard pallet width in mm
    palletLength: 800, // Standard pallet length in mm
    productWeight: 0,
    productCost: 0,
    productionSpeed: 100,
    workingDays: 5
  })

  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null)
  const [activeTab, setActiveTab] = useState('product-select')

  // Update product data when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setProductData(prev => ({
        ...prev,
        productCost: Number(selectedProduct.base_price) || 0
      }))
      setActiveTab('input')
    }
  }, [selectedProduct])

  const handleDataUpdate = (newData: Partial<ProductData>) => {
    const updatedData = { ...productData, ...newData }
    setProductData(updatedData)
    
    // Trigger recalculation
    if (updatedData.productWidth && updatedData.productLength && updatedData.productHeight) {
      calculateResults(updatedData)
    }
  }

  const calculateResults = (data: ProductData): void => {
    try {
      // Calculate units per box (if box dimensions provided)
      let unitsPerBox = 1
      if (data.boxWidth && data.boxLength && data.boxHeight) {
        const unitsX = Math.floor(data.boxWidth / data.productWidth)
        const unitsY = Math.floor(data.boxLength / data.productLength)
        const unitsZ = Math.floor(data.boxHeight / data.productHeight)
        unitsPerBox = unitsX * unitsY * unitsZ
      }

      // Calculate boxes per pallet layer
      const containerWidth = data.boxWidth || data.productWidth
      const containerLength = data.boxLength || data.productLength
      const containerHeight = data.boxHeight || data.productHeight
      
      const boxesX = Math.floor(data.palletWidth / containerWidth)
      const boxesY = Math.floor(data.palletLength / containerLength)
      const boxesPerPalletLayer = boxesX * boxesY

      // Calculate layers per pallet
      const maxHeight = data.palletMaxHeight || 1800 // Standard max height
      const layersPerPallet = Math.floor(maxHeight / containerHeight)

      // Calculate totals
      const totalUnitsPerPallet = unitsPerBox * boxesPerPalletLayer * layersPerPallet
      
      let totalPalletsNeeded = 1
      let totalBoxesNeeded = boxesPerPalletLayer * layersPerPallet
      
      if (data.targetPallets) {
        totalPalletsNeeded = data.targetPallets
        totalBoxesNeeded = totalPalletsNeeded * boxesPerPalletLayer * layersPerPallet
      } else if (data.targetProducts) {
        totalPalletsNeeded = Math.ceil(data.targetProducts / totalUnitsPerPallet)
        totalBoxesNeeded = Math.ceil(data.targetProducts / unitsPerBox)
      }

      // Weight calculations
      const weightPerBox = (data.productWeight * unitsPerBox) + (data.boxWeight || 0)
      const weightPerPalletLayer = weightPerBox * boxesPerPalletLayer
      const weightPerPallet = weightPerPalletLayer * layersPerPallet
      const totalWeight = weightPerPallet * totalPalletsNeeded

      // Cost calculations
      const costPerBox = (data.productCost * unitsPerBox) + (data.boxCost || 0)
      const costPerPalletLayer = costPerBox * boxesPerPalletLayer
      const costPerPallet = costPerPalletLayer * layersPerPallet
      const totalCost = costPerPallet * totalPalletsNeeded

      // Timeline calculations
      const totalUnitsNeeded = totalPalletsNeeded * totalUnitsPerPallet
      const dailyProduction = data.productionSpeed * data.workingDays
      const estimatedDays = Math.ceil(totalUnitsNeeded / dailyProduction) * 7 / data.workingDays

      // Efficiency metrics
      const palletArea = data.palletWidth * data.palletLength
      const usedArea = boxesPerPalletLayer * containerWidth * containerLength
      const palletUtilization = (usedArea / palletArea) * 100

      const boxVolume = (data.boxWidth || containerWidth) * (data.boxLength || containerLength) * (data.boxHeight || containerHeight)
      const productVolume = data.productWidth * data.productLength * data.productHeight
      const boxUtilization = (unitsPerBox * productVolume) / boxVolume * 100

      const results: CalculationResults = {
        unitsPerBox,
        boxesPerPalletLayer,
        layersPerPallet,
        totalUnitsPerPallet,
        totalBoxesNeeded,
        totalPalletsNeeded,
        weightPerBox,
        weightPerPalletLayer,
        weightPerPallet,
        totalWeight,
        costPerBox,
        costPerPalletLayer,
        costPerPallet,
        totalCost,
        estimatedDays,
        dailyProduction,
        palletUtilization,
        boxUtilization
      }

      setCalculationResults(results)
    } catch (error) {
      console.error('Calculation error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* PWA Install Prompt */}
        <div className="mb-6">
          <PWAInstallPrompt />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Packaging & Palletizing Optimizer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a product, optimize packaging configurations, and visualize logistics planning
            with real-time calculations and insights.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Product Integration
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Real-time Calculations
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Save Configurations
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Nutrition Labels
            </Badge>
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              PWA Ready
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-fit lg:mx-auto">
            <TabsTrigger value="product-select" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Product</span>
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-2" disabled={!selectedProduct}>
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configure</span>
            </TabsTrigger>
            <TabsTrigger value="calculations" className="flex items-center gap-2" disabled={!calculationResults}>
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2" disabled={!calculationResults}>
              <TruckIcon className="w-4 h-4" />
              <span className="hidden sm:inline">3D View</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={!calculationResults}>
              <ChartBar className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition-label" className="flex items-center gap-2" disabled={!selectedProduct}>
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Label</span>
            </TabsTrigger>
            <TabsTrigger value="save" className="flex items-center gap-2" disabled={!calculationResults}>
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="product-select">
            <ProductSelector 
              onProductSelect={setSelectedProduct}
              selectedProduct={selectedProduct}
            />
          </TabsContent>

          <TabsContent value="input">
            <Card>
              <CardHeader>
                <CardTitle>Product & Packaging Configuration</CardTitle>
                <CardDescription>
                  Configure packaging details for {selectedProduct?.name || 'selected product'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductInputForm 
                  data={productData} 
                  onUpdate={handleDataUpdate} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculations">
            <PackagingCalculator 
              data={productData} 
              results={calculationResults} 
            />
          </TabsContent>

          <TabsContent value="visualization">
            <TruckVisualization 
              data={productData} 
              results={calculationResults} 
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts 
              data={productData} 
              results={calculationResults} 
            />
          </TabsContent>

          <TabsContent value="nutrition-label">
            <NutritionLabelGenerator 
              productId={selectedProduct?.product_id}
            />
          </TabsContent>

          <TabsContent value="save">
            <SaveConfiguration
              selectedProduct={selectedProduct}
              productData={productData}
              calculationResults={calculationResults}
              onSaved={(config) => {
                console.log('Configuration saved:', config)
                // Could show a success message or redirect
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App