import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { Save, Download, Printer, Upload, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  product_id: number
  name: string
  flavor?: string
  flavor_image?: string
  color_dark?: string
  color_light?: string
  net_weight?: string
  ingredients_flavor?: string
  barcode?: string
  qr_code?: string
}

interface NutritionFacts {
  id: number
  label_name: string
  serving_size?: string
  serving_size_metric?: string
  servings_per_container?: string
  calories?: number
  total_fat_g?: number
  total_fat_dv?: number
  saturated_fat_g?: number
  saturated_fat_dv?: number
  trans_fat_g?: number
  cholesterol_mg?: number
  cholesterol_dv?: number
  sodium_mg?: number
  sodium_dv?: number
  total_carbohydrate_g?: number
  total_carbohydrate_dv?: number
  dietary_fiber_g?: number
  dietary_fiber_dv?: number
  total_sugars_g?: number
  added_sugars_g?: number
  added_sugars_dv?: number
  protein_g?: number
  vitamin_d_mcg?: number
  vitamin_d_dv?: number
  calcium_mg?: number
  calcium_dv?: number
  iron_mg?: number
  iron_dv?: number
  potassium_mg?: number
  potassium_dv?: number
  is_bilingual?: boolean
  language_primary?: string
  language_secondary?: string
}

interface StickerLabelData {
  id?: number
  label_name: string
  label_size: string
  company_logo_url: string
  made_in_mexico_logo_url: string
  elaborated_by: string
  distributed_by: string
  product_name_override: string
  product_flavor_override: string
  product_flavor_image_override: string
  product_color_dark_override: string
  product_color_light_override: string
  product_net_weight_override: string
  ingredients: string
  how_to_serve_instructions: string
  barcode_image_url: string
  qr_code_url: string
  language_setting: number
  nutrition_facts_id?: number
  layout_config: any
}

interface StickerLabelGeneratorProps {
  selectedProduct: Product | null
}

export default function StickerLabelGenerator({ selectedProduct }: StickerLabelGeneratorProps) {
  const [labelData, setLabelData] = useState<StickerLabelData>({
    label_name: '',
    label_size: '4x4',
    company_logo_url: '/logo-lahermosa.png',
    made_in_mexico_logo_url: '',
    elaborated_by: '',
    distributed_by: '',
    product_name_override: '',
    product_flavor_override: '',
    product_flavor_image_override: '',
    product_color_dark_override: '',
    product_color_light_override: '',
    product_net_weight_override: '',
    ingredients: '',
    how_to_serve_instructions: '',
    barcode_image_url: '',
    qr_code_url: '',
    language_setting: 0,
    layout_config: {}
  })

  const [nutritionFacts, setNutritionFacts] = useState<NutritionFacts[]>([])
  const [selectedNutritionId, setSelectedNutritionId] = useState<number | undefined>()
  const [selectedNutrition, setSelectedNutrition] = useState<NutritionFacts | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [loading, setLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)



  // Load nutrition facts for the selected product
  useEffect(() => {
    if (selectedProduct) {
      // Load nutrition facts
      const loadNutrition = async () => {
        try {
          const { data, error } = await supabase
            .from('nutrition_facts')
            .select('*')
            .eq('product_id', selectedProduct.product_id)

          if (error) throw error
          setNutritionFacts(data || [])
        } catch (error) {
          console.error('Error loading nutrition facts:', error)
        }
      }

      // Load saved label
      const loadSaved = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          const userId = user?.id || 'anonymous'

          const { data, error } = await supabase
            .from('sticker_labels')
            .select('*')
            .eq('product_id', selectedProduct.product_id)
            .eq('user_id', userId)
            .single()

          if (error && error.code !== 'PGRST116') throw error
          
          if (data) {
            setLabelData({
              ...data,
              layout_config: data.layout_config || {}
            })
            setSelectedNutritionId(data.nutrition_facts_id)
          }
        } catch (error) {
          console.error('Error loading saved label:', error)
        }
      }

      loadNutrition()
      loadSaved()
      
      // Set default values from product
      setLabelData(prev => ({
        ...prev,
        label_name: `${selectedProduct.name} Label`,
        product_name_override: selectedProduct.name,
        product_flavor_override: selectedProduct.flavor || '',
        product_flavor_image_override: selectedProduct.flavor_image || '',
        product_color_dark_override: selectedProduct.color_dark || '#000000',
        product_color_light_override: selectedProduct.color_light || '#ffffff',
        product_net_weight_override: selectedProduct.net_weight || '',
        barcode_image_url: selectedProduct.barcode || '',
        qr_code_url: selectedProduct.qr_code || ''
      }))
    }
  }, [selectedProduct])

  // Update selected nutrition when ID changes
  useEffect(() => {
    if (selectedNutritionId) {
      const nutrition = nutritionFacts.find(n => n.id === selectedNutritionId)
      setSelectedNutrition(nutrition || null)
    } else {
      setSelectedNutrition(null)
    }
  }, [selectedNutritionId, nutritionFacts])

  const handleSave = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product first')
      return
    }

    if (!labelData.label_name.trim()) {
      toast.error('Please enter a label name')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'

      const saveData = {
        user_id: userId,
        product_id: selectedProduct.product_id,
        nutrition_facts_id: selectedNutritionId,
        ...labelData,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('sticker_labels')
        .upsert(saveData, {
          onConflict: 'user_id,product_id'
        })

      if (error) throw error

      toast.success('Label saved successfully!')
    } catch (error) {
      console.error('Error saving label:', error)
      toast.error('Failed to save label')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Label</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print {
                  body { margin: 0; padding: 0; }
                  .print-label { width: 4in; height: 4in; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleDownload = () => {
    const dataStr = JSON.stringify(labelData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${labelData.label_name || 'label'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLabelData(prev => ({ ...prev, [field]: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getLanguageText = (english: string, spanish: string) => {
    switch (labelData.language_setting) {
      case 1: return spanish
      case 2: return `${english} / ${spanish}`
      default: return english
    }
  }

  if (!selectedProduct) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please select a product to create a sticker label.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sticker Label Generator</h2>
          <p className="text-muted-foreground">Create product labels for {selectedProduct.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Label Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="product">Product</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="codes">Codes</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="label_name">Label Name</Label>
                      <Input
                        id="label_name"
                        value={labelData.label_name}
                        onChange={(e) => setLabelData(prev => ({ ...prev, label_name: e.target.value }))}
                        placeholder="Enter label name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="label_size">Label Size</Label>
                      <Select value={labelData.label_size} onValueChange={(value) => setLabelData(prev => ({ ...prev, label_size: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4x4">4" x 4" Square</SelectItem>
                          <SelectItem value="4x6">4" x 6" Rectangle</SelectItem>
                          <SelectItem value="3x5">3" x 5" Rectangle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="language">Language Setting</Label>
                    <Select value={labelData.language_setting.toString()} onValueChange={(value) => setLabelData(prev => ({ ...prev, language_setting: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">English Only</SelectItem>
                        <SelectItem value="1">Spanish Only</SelectItem>
                        <SelectItem value="2">Bilingual (Both)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="elaborated_by">Elaborated By</Label>
                      <Input
                        id="elaborated_by"
                        value={labelData.elaborated_by}
                        onChange={(e) => setLabelData(prev => ({ ...prev, elaborated_by: e.target.value }))}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="distributed_by">Distributed By</Label>
                      <Input
                        id="distributed_by"
                        value={labelData.distributed_by}
                        onChange={(e) => setLabelData(prev => ({ ...prev, distributed_by: e.target.value }))}
                        placeholder="Distributor name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_logo">Company Logo</Label>
                      <div className="flex gap-2">
                        <Input
                          value={labelData.company_logo_url}
                          onChange={(e) => setLabelData(prev => ({ ...prev, company_logo_url: e.target.value }))}
                          placeholder="Logo URL"
                        />
                        <Button variant="outline" size="sm" asChild>
                          <label htmlFor="company_logo_upload">
                            <Upload className="w-4 h-4" />
                            <input
                              id="company_logo_upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload('company_logo_url', e)}
                            />
                          </label>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="mexico_logo">Made in Mexico Logo</Label>
                      <div className="flex gap-2">
                        <Input
                          value={labelData.made_in_mexico_logo_url}
                          onChange={(e) => setLabelData(prev => ({ ...prev, made_in_mexico_logo_url: e.target.value }))}
                          placeholder="Mexico logo URL"
                        />
                        <Button variant="outline" size="sm" asChild>
                          <label htmlFor="mexico_logo_upload">
                            <Upload className="w-4 h-4" />
                            <input
                              id="mexico_logo_upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload('made_in_mexico_logo_url', e)}
                            />
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="product" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product_name">Product Name</Label>
                      <Input
                        id="product_name"
                        value={labelData.product_name_override}
                        onChange={(e) => setLabelData(prev => ({ ...prev, product_name_override: e.target.value }))}
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="product_flavor">Product Flavor</Label>
                      <Input
                        id="product_flavor"
                        value={labelData.product_flavor_override}
                        onChange={(e) => setLabelData(prev => ({ ...prev, product_flavor_override: e.target.value }))}
                        placeholder="Flavor name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="flavor_image">Flavor Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={labelData.product_flavor_image_override}
                        onChange={(e) => setLabelData(prev => ({ ...prev, product_flavor_image_override: e.target.value }))}
                        placeholder="Flavor image URL"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="flavor_image_upload">
                          <Upload className="w-4 h-4" />
                          <input
                            id="flavor_image_upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload('product_flavor_image_override', e)}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="color_dark">Dark Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color_dark"
                          type="color"
                          value={labelData.product_color_dark_override}
                          onChange={(e) => setLabelData(prev => ({ ...prev, product_color_dark_override: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={labelData.product_color_dark_override}
                          onChange={(e) => setLabelData(prev => ({ ...prev, product_color_dark_override: e.target.value }))}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="color_light">Light Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color_light"
                          type="color"
                          value={labelData.product_color_light_override}
                          onChange={(e) => setLabelData(prev => ({ ...prev, product_color_light_override: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={labelData.product_color_light_override}
                          onChange={(e) => setLabelData(prev => ({ ...prev, product_color_light_override: e.target.value }))}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="net_weight">Net Weight</Label>
                      <Input
                        id="net_weight"
                        value={labelData.product_net_weight_override}
                        onChange={(e) => setLabelData(prev => ({ ...prev, product_net_weight_override: e.target.value }))}
                        placeholder="5.38oz (152g)"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="ingredients">Ingredients</Label>
                    <Textarea
                      id="ingredients"
                      value={labelData.ingredients}
                      onChange={(e) => setLabelData(prev => ({ ...prev, ingredients: e.target.value }))}
                      placeholder="List all ingredients..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="how_to_serve">How to Serve Instructions</Label>
                    <Textarea
                      id="how_to_serve"
                      value={labelData.how_to_serve_instructions}
                      onChange={(e) => setLabelData(prev => ({ ...prev, how_to_serve_instructions: e.target.value }))}
                      placeholder="Instructions for serving..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nutrition_facts">Nutrition Facts</Label>
                    <Select value={selectedNutritionId?.toString() || ''} onValueChange={(value) => setSelectedNutritionId(value ? parseInt(value) : undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nutrition facts" />
                      </SelectTrigger>
                      <SelectContent>
                        {nutritionFacts.map((nutrition) => (
                          <SelectItem key={nutrition.id} value={nutrition.id.toString()}>
                            {nutrition.label_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="codes" className="space-y-4">
                  <div>
                    <Label htmlFor="barcode">Barcode Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        value={labelData.barcode_image_url}
                        onChange={(e) => setLabelData(prev => ({ ...prev, barcode_image_url: e.target.value }))}
                        placeholder="UPC-A barcode image URL"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="barcode_upload">
                          <Upload className="w-4 h-4" />
                          <input
                            id="barcode_upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload('barcode_image_url', e)}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qr_code">QR Code URL</Label>
                    <Input
                      id="qr_code"
                      value={labelData.qr_code_url}
                      onChange={(e) => setLabelData(prev => ({ ...prev, qr_code_url: e.target.value }))}
                      placeholder="Product URL for QR code"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Label Preview</CardTitle>
                <Badge variant="outline">{labelData.label_size} Label</Badge>
              </CardHeader>
              <CardContent>
                <div 
                  ref={printRef}
                  className="print-label relative w-full aspect-square border-2 border-dashed border-gray-300 bg-white overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${labelData.product_color_light_override || '#ffffff'} 0%, ${labelData.product_color_dark_override || '#000000'} 100%)`
                  }}
                >
                  {/* Company Logo */}
                  {labelData.company_logo_url && (
                    <img
                      src={labelData.company_logo_url}
                      alt="Company Logo"
                      className="absolute top-2 left-2 w-16 h-8 object-contain"
                    />
                  )}

                  {/* Made in Mexico Logo */}
                  {labelData.made_in_mexico_logo_url && (
                    <img
                      src={labelData.made_in_mexico_logo_url}
                      alt="Made in Mexico"
                      className="absolute top-2 right-2 w-12 h-6 object-contain"
                    />
                  )}

                  {/* Product Name */}
                  <div className="absolute top-12 left-2 right-2">
                    <h1 className="text-lg font-bold text-center text-white drop-shadow-lg">
                      {labelData.product_name_override || selectedProduct.name}
                    </h1>
                  </div>

                  {/* Product Flavor */}
                  {labelData.product_flavor_override && (
                    <div className="absolute top-20 left-2 right-2">
                      <h2 className="text-md font-semibold text-center text-white drop-shadow-lg">
                        {getLanguageText(labelData.product_flavor_override, labelData.product_flavor_override)}
                      </h2>
                    </div>
                  )}

                  {/* Flavor Image */}
                  {labelData.product_flavor_image_override && (
                    <img
                      src={labelData.product_flavor_image_override}
                      alt="Flavor"
                      className="absolute top-28 left-1/2 transform -translate-x-1/2 w-20 h-20 object-contain"
                    />
                  )}

                  {/* Net Weight */}
                  {labelData.product_net_weight_override && (
                    <div className="absolute top-2 right-16 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                      NET WEIGHT {labelData.product_net_weight_override}
                    </div>
                  )}

                  {/* Nutrition Facts */}
                  {selectedNutrition && (
                    <div className="absolute top-32 right-2 w-24 bg-white border border-black text-xs p-1">
                      <div className="font-bold text-center border-b border-black mb-1">
                        {getLanguageText('Nutrition Facts', 'Información Nutricional')}
                      </div>
                      <div className="space-y-0.5">
                        <div>Serving Size {selectedNutrition.serving_size}</div>
                        <div className="font-bold">Calories {selectedNutrition.calories}</div>
                        <div className="border-t border-black pt-0.5">
                          <div>Total Fat {selectedNutrition.total_fat_g}g</div>
                          <div>Sodium {selectedNutrition.sodium_mg}mg</div>
                          <div>Total Carb {selectedNutrition.total_carbohydrate_g}g</div>
                          <div>Protein {selectedNutrition.protein_g}g</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* How to Serve */}
                  {labelData.how_to_serve_instructions && (
                    <div className="absolute bottom-20 left-2 w-20 bg-white bg-opacity-90 p-1 text-xs rounded">
                      <div className="font-bold mb-1">{getLanguageText('HOW TO SERVE', 'COMO SERVIR')}</div>
                      <div className="text-xs leading-tight">
                        {labelData.how_to_serve_instructions.split('\n').slice(0, 4).map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  {labelData.ingredients && (
                    <div className="absolute bottom-8 left-2 right-2 bg-black bg-opacity-80 text-white p-1 text-xs">
                      <span className="font-bold">{getLanguageText('Ingredients:', 'Ingredientes:')}</span> {labelData.ingredients}
                    </div>
                  )}

                  {/* Barcode */}
                  {labelData.barcode_image_url && (
                    <img
                      src={labelData.barcode_image_url}
                      alt="Barcode"
                      className="absolute bottom-2 left-2 w-16 h-8 object-contain bg-white"
                    />
                  )}

                  {/* QR Code */}
                  {labelData.qr_code_url && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                      QR
                    </div>
                  )}

                  {/* Company Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 text-white text-xs p-1 text-center">
                    {labelData.elaborated_by && (
                      <div>{getLanguageText('ELABORATED BY', 'ELABORADO POR')} {labelData.elaborated_by}</div>
                    )}
                    {labelData.distributed_by && (
                      <div>{getLanguageText('DISTRIBUTED BY', 'DISTRIBUIDO POR')} {labelData.distributed_by}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}