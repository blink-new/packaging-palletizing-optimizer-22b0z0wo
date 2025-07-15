import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Truck, Eye, RotateCcw, Maximize } from 'lucide-react'
import { useState } from 'react'
import { ProductData, CalculationResults } from '../App'

interface TruckVisualizationProps {
  data: ProductData
  results: CalculationResults | null
}

export default function TruckVisualization({ data, results }: TruckVisualizationProps) {
  const [viewAngle, setViewAngle] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  if (!results) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Truck className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">Complete input data to see 3D visualization</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const rotateView = () => {
    setViewAngle((prev) => (prev + 45) % 360)
  }

  const resetView = () => {
    setViewAngle(0)
    setIsZoomed(false)
  }

  // Calculate truck dimensions (standard truck bed)
  const truckWidth = 2400 // mm
  const truckLength = 6000 // mm
  // const truckHeight = 2400 // mm

  // Calculate how many pallets fit in truck
  const palletsX = Math.floor(truckWidth / data.palletWidth)
  const palletsY = Math.floor(truckLength / data.palletLength)
  const totalPalletsInTruck = palletsX * palletsY

  // Scale factors for visualization
  const scale = 0.15
  const scaledTruckWidth = truckWidth * scale
  const scaledTruckLength = truckLength * scale
  // const scaledTruckHeight = truckHeight * scale
  const scaledPalletWidth = data.palletWidth * scale
  const scaledPalletLength = data.palletLength * scale

  const boxWidth = data.boxWidth || data.productWidth
  const boxLength = data.boxLength || data.productLength
  const boxHeight = data.boxHeight || data.productHeight
  const scaledBoxWidth = boxWidth * scale
  const scaledBoxLength = boxLength * scale
  const scaledBoxHeight = boxHeight * scale

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            3D Load Visualization
          </CardTitle>
          <CardDescription>
            Interactive view of pallets and boxes loaded in truck space
          </CardDescription>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={rotateView}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Rotate View
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <Eye className="w-4 h-4 mr-2" />
              Reset View
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsZoomed(!isZoomed)}>
              <Maximize className="w-4 h-4 mr-2" />
              {isZoomed ? 'Zoom Out' : 'Zoom In'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Load Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{palletsX} × {palletsY}</div>
            <p className="text-xs text-muted-foreground">Pallet Layout</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalPalletsInTruck}</div>
            <p className="text-xs text-muted-foreground">Max Pallets in Truck</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Math.min(results.totalPalletsNeeded, totalPalletsInTruck)}</div>
            <p className="text-xs text-muted-foreground">Pallets Loaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {((Math.min(results.totalPalletsNeeded, totalPalletsInTruck) / totalPalletsInTruck) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Truck Utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Tabs */}
      <Tabs defaultValue="truck" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="truck">Truck View</TabsTrigger>
          <TabsTrigger value="pallet">Pallet Detail</TabsTrigger>
          <TabsTrigger value="layer">Layer Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="truck">
          <Card>
            <CardHeader>
              <CardTitle>Truck Loading View</CardTitle>
              <CardDescription>
                Full truck visualization with all pallets positioned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  className={`perspective-1000 ${isZoomed ? 'scale-150' : 'scale-100'} transition-transform duration-300`}
                  style={{ transform: `rotateX(-20deg) rotateY(${viewAngle}deg)` }}
                >
                  {/* Truck Bed */}
                  <div 
                    className="relative bg-gray-200 border-4 border-gray-400 rounded-lg shadow-2xl"
                    style={{
                      width: `${scaledTruckWidth}px`,
                      height: `${scaledTruckLength}px`,
                      minHeight: '300px'
                    }}
                  >
                    {/* Truck Floor Pattern */}
                    <div className="absolute inset-2 bg-gray-100 rounded opacity-50"
                         style={{
                           backgroundImage: `repeating-linear-gradient(45deg, 
                             transparent, transparent 10px, 
                             rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`
                         }}>
                    </div>

                    {/* Pallets */}
                    {Array.from({ length: Math.min(results.totalPalletsNeeded, totalPalletsInTruck) }, (_, index) => {
                      const row = Math.floor(index / palletsX)
                      const col = index % palletsX
                      const x = col * scaledPalletWidth + 10
                      const y = row * scaledPalletLength + 10

                      return (
                        <div
                          key={index}
                          className="absolute bg-amber-600 border-2 border-amber-700 rounded shadow-lg"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            width: `${scaledPalletWidth - 4}px`,
                            height: `${scaledPalletLength - 4}px`,
                            transform: 'translateZ(2px)'
                          }}
                        >
                          {/* Pallet Wood Pattern */}
                          <div className="absolute inset-1 bg-amber-500 rounded-sm opacity-70"
                               style={{
                                 backgroundImage: `repeating-linear-gradient(0deg, 
                                   rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, 
                                   transparent 2px, transparent 8px)`
                               }}>
                          </div>

                          {/* Boxes on Pallet */}
                          {Array.from({ length: results.boxesPerPalletLayer }, (_, boxIndex) => {
                            const boxRow = Math.floor(boxIndex / Math.floor(data.palletWidth / boxWidth))
                            const boxCol = boxIndex % Math.floor(data.palletWidth / boxWidth)
                            const boxX = boxCol * scaledBoxWidth + 2
                            const boxY = boxRow * scaledBoxLength + 2

                            return (
                              <div
                                key={boxIndex}
                                className="absolute bg-blue-500 border border-blue-600 rounded-sm"
                                style={{
                                  left: `${boxX}px`,
                                  top: `${boxY}px`,
                                  width: `${scaledBoxWidth - 1}px`,
                                  height: `${scaledBoxLength - 1}px`,
                                  transform: `translateZ(${scaledBoxHeight * results.layersPerPallet}px)`
                                }}
                              >
                                {/* Box Stack Indicator */}
                                {results.layersPerPallet > 1 && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-blue-300 rounded-sm opacity-80">
                                    <div className="absolute top-1 left-1 text-white text-xs font-bold">
                                      {results.layersPerPallet}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}

                          {/* Pallet Label */}
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                            #{index + 1}
                          </div>
                        </div>
                      )
                    })}

                    {/* Truck Capacity Indicator */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {Math.min(results.totalPalletsNeeded, totalPalletsInTruck)} / {totalPalletsInTruck} Pallets
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
                    <span>Truck Bed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-600 border border-amber-700 rounded"></div>
                    <span>Pallet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                    <span>Box Stack</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pallet">
          <Card>
            <CardHeader>
              <CardTitle>Single Pallet Detail</CardTitle>
              <CardDescription>
                Detailed view of box arrangement on one pallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  className={`perspective-1000 ${isZoomed ? 'scale-200' : 'scale-150'} transition-transform duration-300`}
                  style={{ transform: `rotateX(-30deg) rotateY(${viewAngle}deg)` }}
                >
                  {/* Single Pallet */}
                  <div 
                    className="relative bg-amber-600 border-4 border-amber-700 rounded-lg shadow-xl"
                    style={{
                      width: `${scaledPalletWidth}px`,
                      height: `${scaledPalletLength}px`,
                      minWidth: '200px',
                      minHeight: '150px'
                    }}
                  >
                    {/* Pallet Wood Pattern */}
                    <div className="absolute inset-2 bg-amber-500 rounded opacity-70"
                         style={{
                           backgroundImage: `repeating-linear-gradient(0deg, 
                             rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 3px, 
                             transparent 3px, transparent 12px)`
                         }}>
                    </div>

                    {/* Boxes */}
                    {Array.from({ length: results.boxesPerPalletLayer }, (_, boxIndex) => {
                      const boxRow = Math.floor(boxIndex / Math.floor(data.palletWidth / boxWidth))
                      const boxCol = boxIndex % Math.floor(data.palletWidth / boxWidth)
                      const boxX = boxCol * scaledBoxWidth + 8
                      const boxY = boxRow * scaledBoxLength + 8

                      return (
                        <div key={boxIndex}>
                          {/* Stack layers */}
                          {Array.from({ length: results.layersPerPallet }, (_, layerIndex) => (
                            <div
                              key={layerIndex}
                              className="absolute bg-blue-500 border-2 border-blue-600 rounded shadow-md"
                              style={{
                                left: `${boxX}px`,
                                top: `${boxY}px`,
                                width: `${scaledBoxWidth - 2}px`,
                                height: `${scaledBoxLength - 2}px`,
                                transform: `translateZ(${(layerIndex + 1) * scaledBoxHeight}px)`,
                                opacity: 0.8 + (layerIndex * 0.1)
                              }}
                            >
                              {/* Layer number */}
                              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                L{layerIndex + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Pallet Stats */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">{results.boxesPerPalletLayer}</div>
                  <div className="text-sm text-blue-800">Boxes per Layer</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{results.layersPerPallet}</div>
                  <div className="text-sm text-green-800">Total Layers</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-600">{results.totalUnitsPerPallet}</div>
                  <div className="text-sm text-purple-800">Units per Pallet</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">{data.palletUtilization?.toFixed(1) || results.palletUtilization.toFixed(1)}%</div>
                  <div className="text-sm text-orange-800">Space Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layer">
          <Card>
            <CardHeader>
              <CardTitle>Layer Breakdown</CardTitle>
              <CardDescription>
                Box arrangement within a single pallet layer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="relative bg-amber-100 border-2 border-amber-300 rounded-lg p-4"
                     style={{ transform: `rotate(${viewAngle / 8}deg)` }}>
                  
                  {/* Grid representation */}
                  <div 
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${Math.floor(data.palletWidth / boxWidth)}, 1fr)`,
                      gridTemplateRows: `repeat(${Math.floor(data.palletLength / boxLength)}, 1fr)`
                    }}
                  >
                    {Array.from({ length: results.boxesPerPalletLayer }, (_, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 border border-blue-600 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          width: '40px',
                          height: '30px'
                        }}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>

                  {/* Empty spaces */}
                  {Array.from({ 
                    length: (Math.floor(data.palletWidth / boxWidth) * Math.floor(data.palletLength / boxLength)) - results.boxesPerPalletLayer 
                  }, (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="bg-gray-200 border border-gray-300 rounded"
                      style={{
                        width: '40px',
                        height: '30px'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 text-center">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {results.boxesPerPalletLayer} boxes fit per layer
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}