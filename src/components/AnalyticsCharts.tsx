import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'
import { ProductData, CalculationResults } from '../App'

interface AnalyticsChartsProps {
  data: ProductData
  results: CalculationResults | null
}

export default function AnalyticsCharts({ data, results }: AnalyticsChartsProps) {
  if (!results) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">Complete calculations to view analytics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for various charts
  const quantityData = [
    { name: 'Units per Box', value: results.unitsPerBox, color: '#3B82F6' },
    { name: 'Boxes per Layer', value: results.boxesPerPalletLayer, color: '#10B981' },
    { name: 'Layers per Pallet', value: results.layersPerPallet, color: '#8B5CF6' },
    { name: 'Units per Pallet', value: results.totalUnitsPerPallet, color: '#F59E0B' }
  ]

  const weightDistribution = [
    { name: 'Per Box', weight: results.weightPerBox, color: '#EF4444' },
    { name: 'Per Layer', weight: results.weightPerPalletLayer, color: '#F97316' },
    { name: 'Per Pallet', weight: results.weightPerPallet, color: '#EAB308' }
  ]

  const costBreakdown = [
    { name: 'Product Cost', value: data.productCost * results.unitsPerBox, color: '#06B6D4' },
    { name: 'Box Cost', value: (data.boxCost || 0), color: '#8B5CF6' }
  ]

  const efficiencyMetrics = [
    { name: 'Pallet Utilization', value: results.palletUtilization, target: 85, color: '#10B981' },
    { name: 'Box Utilization', value: results.boxUtilization, target: 80, color: '#3B82F6' }
  ]

  // Simulate production timeline data
  const timelineData = Array.from({ length: Math.ceil(results.estimatedDays) }, (_, i) => ({
    day: i + 1,
    cumulative: Math.min((i + 1) * results.dailyProduction, results.totalPalletsNeeded * results.totalUnitsPerPallet),
    daily: i + 1 <= results.estimatedDays ? results.dailyProduction : 0,
    target: results.totalPalletsNeeded * results.totalUnitsPerPallet
  }))

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Chart Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Visual analysis of packaging efficiency, costs, and production metrics
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="quantities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quantities">Quantities</TabsTrigger>
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="quantities">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quantity Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Packaging Quantities
                </CardTitle>
                <CardDescription>
                  Units at each packaging level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quantityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatNumber(value as number), 'Quantity']} />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hierarchy Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Packaging Hierarchy
                </CardTitle>
                <CardDescription>
                  Step-by-step packaging breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={quantityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatNumber(value as number), 'Units']} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Total Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(results.totalBoxesNeeded)}</div>
                  <div className="text-sm text-blue-800">Total Boxes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.totalPalletsNeeded}</div>
                  <div className="text-sm text-green-800">Total Pallets</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(results.totalPalletsNeeded * results.totalUnitsPerPallet)}
                  </div>
                  <div className="text-sm text-purple-800">Total Units</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.ceil(results.estimatedDays)}</div>
                  <div className="text-sm text-orange-800">Production Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Weight Distribution
                </CardTitle>
                <CardDescription>
                  Weight at each packaging level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weightDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(2)} kg`, 'Weight']} />
                    <Bar dataKey="weight" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weight Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Weight Composition
                </CardTitle>
                <CardDescription>
                  Proportional weight breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Product Weight', value: data.productWeight * results.unitsPerBox },
                        { name: 'Packaging Weight', value: (data.boxWeight || 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {weightDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(3)} kg`, 'Weight']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weight Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <div className="text-2xl font-bold text-orange-600">
                    {(results.totalWeight / 1000).toFixed(1)}t
                  </div>
                  <div className="text-sm text-orange-800">Total Weight</div>
                  <div className="text-xs text-orange-600 mt-1">
                    {(results.totalWeight / results.totalPalletsNeeded).toFixed(1)} kg/pallet avg
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="text-2xl font-bold text-red-600">
                    {((data.productWeight / (data.productWeight + (data.boxWeight || 0))) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-800">Product Weight Ratio</div>
                  <div className="text-xs text-red-600 mt-1">vs packaging weight</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <div className="text-2xl font-bold text-amber-600">
                    {(results.totalWeight / (results.totalPalletsNeeded * results.totalUnitsPerPallet)).toFixed(3)}
                  </div>
                  <div className="text-sm text-amber-800">kg per Unit</div>
                  <div className="text-xs text-amber-600 mt-1">including packaging</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Cost Structure
                </CardTitle>
                <CardDescription>
                  Cost analysis per packaging level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Per Box', cost: results.costPerBox },
                    { name: 'Per Layer', cost: results.costPerPalletLayer },
                    { name: 'Per Pallet', cost: results.costPerPallet }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Cost']} />
                    <Bar dataKey="cost" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Cost Distribution
                </CardTitle>
                <CardDescription>
                  Product vs packaging cost ratio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {costBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(results.totalCost)}</div>
                  <div className="text-sm text-green-800">Total Order Value</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(results.costPerPallet)}</div>
                  <div className="text-sm text-blue-800">Revenue per Pallet</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(data.productCost)}
                  </div>
                  <div className="text-sm text-purple-800">Cost per Unit</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {(((data.boxCost || 0) / results.costPerBox) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-indigo-800">Packaging Cost Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Space Efficiency
                </CardTitle>
                <CardDescription>
                  Utilization rates vs targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={efficiencyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Utilization']} />
                    <Bar dataKey="value" fill="#3B82F6" />
                    <Bar dataKey="target" fill="#E5E7EB" opacity={0.5} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Production Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Production Timeline
                </CardTitle>
                <CardDescription>
                  Daily and cumulative production progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Cumulative Production"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#EF4444" 
                      strokeDasharray="5 5"
                      name="Target"
                    />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Efficiency Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.palletUtilization.toFixed(1)}%</div>
                  <div className="text-sm text-blue-800">Pallet Space Used</div>
                  <Badge className={`mt-1 ${results.palletUtilization >= 80 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {results.palletUtilization >= 80 ? 'Excellent' : 'Needs Improvement'}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.boxUtilization.toFixed(1)}%</div>
                  <div className="text-sm text-green-800">Box Space Used</div>
                  <Badge className={`mt-1 ${results.boxUtilization >= 80 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {results.boxUtilization >= 80 ? 'Excellent' : 'Needs Improvement'}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.dailyProduction}</div>
                  <div className="text-sm text-purple-800">Daily Capacity</div>
                  <div className="text-xs text-purple-600 mt-1">units per day</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.ceil(results.estimatedDays)}</div>
                  <div className="text-sm text-orange-800">Days to Complete</div>
                  <div className="text-xs text-orange-600 mt-1">at current capacity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}