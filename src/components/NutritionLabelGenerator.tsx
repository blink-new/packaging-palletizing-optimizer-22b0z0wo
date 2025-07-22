import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Download, FileText, Save, Upload, Printer, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface NutritionData {
  id?: number
  label_name: string
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
}

interface NutritionTemplate {
  id: number
  template_name: string
  html_template: string
  css_template: string
  is_default: boolean
}

interface NutritionLabelGeneratorProps {
  productId?: number
  onClose?: () => void
}

export default function NutritionLabelGenerator({ productId, onClose }: NutritionLabelGeneratorProps) {
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    label_name: '',
    serving_size: '2/3 cup',
    serving_size_metric: '2/3 taza (55g)',
    servings_per_container: '8',
    calories: 230,
    
    total_fat_g: 8,
    total_fat_dv: 10,
    saturated_fat_g: 1,
    saturated_fat_dv: 5,
    trans_fat_g: 0,
    
    cholesterol_mg: 0,
    cholesterol_dv: 0,
    sodium_mg: 160,
    sodium_dv: 7,
    total_carbohydrate_g: 37,
    total_carbohydrate_dv: 13,
    dietary_fiber_g: 4,
    dietary_fiber_dv: 14,
    total_sugars_g: 12,
    added_sugars_g: 10,
    added_sugars_dv: 20,
    protein_g: 3,
    
    vitamin_d_mcg: 2,
    vitamin_d_dv: 10,
    calcium_mg: 260,
    calcium_dv: 20,
    iron_mg: 8,
    iron_dv: 45,
    potassium_mg: 235,
    potassium_dv: 6,
    
    is_bilingual: true,
    language_primary: 'en',
    language_secondary: 'es'
  })

  const [templates, setTemplates] = useState<NutritionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<NutritionTemplate | null>(null)
  const [savedLabels, setSavedLabels] = useState<NutritionData[]>([])
  const [activeTab, setActiveTab] = useState('form')
  const [isLoading, setIsLoading] = useState(false)

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_label_templates')
        .select('*')
        .order('is_default', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
      
      // Select default template
      const defaultTemplate = data?.find(t => t.is_default)
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load label templates",
        variant: "destructive"
      })
    }
  }

  const loadSavedLabels = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_facts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedLabels(data || [])
    } catch (error) {
      console.error('Error loading saved labels:', error)
    }
  }

  useEffect(() => {
    loadTemplates()
    loadSavedLabels()
  }, [])

  const handleInputChange = (field: keyof NutritionData, value: string | number | boolean) => {
    setNutritionData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveLabel = async () => {
    if (!nutritionData.label_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a label name",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser()
      
      const dataToSave = {
        ...nutritionData,
        product_id: productId || null,
        user_id: user?.id || null
      }

      const { data, error } = await supabase
        .from('nutrition_facts')
        .insert([dataToSave])
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Nutrition label saved successfully"
      })

      loadSavedLabels()
    } catch (error) {
      console.error('Error saving label:', error)
      toast({
        title: "Error",
        description: "Failed to save nutrition label",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadLabel = (label: NutritionData) => {
    setNutritionData(label)
    setActiveTab('form')
  }

  const generateLabelHTML = () => {
    if (!selectedTemplate) return ''

    let html = selectedTemplate.html_template
    
    // Replace all template variables
    Object.entries(nutritionData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, String(value || '0'))
    })

    return html
  }

  const generateLabelCSS = () => {
    return selectedTemplate?.css_template || ''
  }

  const exportLabel = (format: 'html' | 'json') => {
    if (format === 'html') {
      const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Nutrition Facts Label</title>
  <style>
    ${generateLabelCSS()}
  </style>
</head>
<body>
  ${generateLabelHTML()}
</body>
</html>`
      
      const blob = new Blob([fullHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nutritionData.label_name || 'nutrition-label'}.html`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(nutritionData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nutritionData.label_name || 'nutrition-data'}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const importLabel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setNutritionData(imported)
        setActiveTab('form')
        toast({
          title: "Success",
          description: "Label data imported successfully"
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON file",
          variant: "destructive"
        })
      }
    }
    reader.readAsText(file)
  }

  const printLabel = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Nutrition Facts Label</title>
          <style>
            ${generateLabelCSS()}
            @media print {
              body { margin: 0; }
              .nutrition-label { margin: 20px auto; }
            }
          </style>
        </head>
        <body>
          ${generateLabelHTML()}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Nutrition Label Generator
            <Badge variant="outline" className="text-xs">FDA Compliant</Badge>
          </CardTitle>
          <CardDescription>
            Create FDA-compliant nutrition facts labels with bilingual support
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="saved">Saved Labels</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label_name">Label Name *</Label>
                  <Input
                    id="label_name"
                    value={nutritionData.label_name}
                    onChange={(e) => handleInputChange('label_name', e.target.value)}
                    placeholder="e.g., Cereal Box Label"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings_per_container">Servings per Container</Label>
                  <Input
                    id="servings_per_container"
                    value={nutritionData.servings_per_container}
                    onChange={(e) => handleInputChange('servings_per_container', e.target.value)}
                    placeholder="e.g., 8"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serving_size">Serving Size (English)</Label>
                  <Input
                    id="serving_size"
                    value={nutritionData.serving_size}
                    onChange={(e) => handleInputChange('serving_size', e.target.value)}
                    placeholder="e.g., 2/3 cup"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving_size_metric">Serving Size (Spanish/Metric)</Label>
                  <Input
                    id="serving_size_metric"
                    value={nutritionData.serving_size_metric}
                    onChange={(e) => handleInputChange('serving_size_metric', e.target.value)}
                    placeholder="e.g., 2/3 taza (55g)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={nutritionData.calories}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || 0)}
                  placeholder="230"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fats Section */}
          <Card>
            <CardHeader>
              <CardTitle>Fats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_fat_g">Total Fat (g)</Label>
                  <Input
                    id="total_fat_g"
                    type="number"
                    step="0.1"
                    value={nutritionData.total_fat_g}
                    onChange={(e) => handleInputChange('total_fat_g', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_fat_dv">Total Fat Daily Value (%)</Label>
                  <Input
                    id="total_fat_dv"
                    type="number"
                    value={nutritionData.total_fat_dv}
                    onChange={(e) => handleInputChange('total_fat_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saturated_fat_g">Saturated Fat (g)</Label>
                  <Input
                    id="saturated_fat_g"
                    type="number"
                    step="0.1"
                    value={nutritionData.saturated_fat_g}
                    onChange={(e) => handleInputChange('saturated_fat_g', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saturated_fat_dv">Saturated Fat Daily Value (%)</Label>
                  <Input
                    id="saturated_fat_dv"
                    type="number"
                    value={nutritionData.saturated_fat_dv}
                    onChange={(e) => handleInputChange('saturated_fat_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trans_fat_g">Trans Fat (g)</Label>
                <Input
                  id="trans_fat_g"
                  type="number"
                  step="0.1"
                  value={nutritionData.trans_fat_g}
                  onChange={(e) => handleInputChange('trans_fat_g', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Other Nutrients */}
          <Card>
            <CardHeader>
              <CardTitle>Other Nutrients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cholesterol_mg">Cholesterol (mg)</Label>
                  <Input
                    id="cholesterol_mg"
                    type="number"
                    step="0.1"
                    value={nutritionData.cholesterol_mg}
                    onChange={(e) => handleInputChange('cholesterol_mg', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cholesterol_dv">Cholesterol Daily Value (%)</Label>
                  <Input
                    id="cholesterol_dv"
                    type="number"
                    value={nutritionData.cholesterol_dv}
                    onChange={(e) => handleInputChange('cholesterol_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sodium_mg">Sodium (mg)</Label>
                  <Input
                    id="sodium_mg"
                    type="number"
                    step="0.1"
                    value={nutritionData.sodium_mg}
                    onChange={(e) => handleInputChange('sodium_mg', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sodium_dv">Sodium Daily Value (%)</Label>
                  <Input
                    id="sodium_dv"
                    type="number"
                    value={nutritionData.sodium_dv}
                    onChange={(e) => handleInputChange('sodium_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_carbohydrate_g">Total Carbohydrate (g)</Label>
                  <Input
                    id="total_carbohydrate_g"
                    type="number"
                    step="0.1"
                    value={nutritionData.total_carbohydrate_g}
                    onChange={(e) => handleInputChange('total_carbohydrate_g', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_carbohydrate_dv">Total Carbohydrate Daily Value (%)</Label>
                  <Input
                    id="total_carbohydrate_dv"
                    type="number"
                    value={nutritionData.total_carbohydrate_dv}
                    onChange={(e) => handleInputChange('total_carbohydrate_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dietary_fiber_g">Dietary Fiber (g)</Label>
                  <Input
                    id="dietary_fiber_g"
                    type="number"
                    step="0.1"
                    value={nutritionData.dietary_fiber_g}
                    onChange={(e) => handleInputChange('dietary_fiber_g', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietary_fiber_dv">Dietary Fiber Daily Value (%)</Label>
                  <Input
                    id="dietary_fiber_dv"
                    type="number"
                    value={nutritionData.dietary_fiber_dv}
                    onChange={(e) => handleInputChange('dietary_fiber_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_sugars_g">Total Sugars (g)</Label>
                  <Input
                    id="total_sugars_g"
                    type="number"
                    step="0.1"
                    value={nutritionData.total_sugars_g}
                    onChange={(e) => handleInputChange('total_sugars_g', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="added_sugars_g">Added Sugars (g)</Label>
                  <Input
                    id="added_sugars_g"
                    type="number"
                    step="0.1"
                    value={nutritionData.added_sugars_g}
                    onChange={(e) => handleInputChange('added_sugars_g', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="added_sugars_dv">Added Sugars Daily Value (%)</Label>
                  <Input
                    id="added_sugars_dv"
                    type="number"
                    value={nutritionData.added_sugars_dv}
                    onChange={(e) => handleInputChange('added_sugars_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein_g">Protein (g)</Label>
                <Input
                  id="protein_g"
                  type="number"
                  step="0.1"
                  value={nutritionData.protein_g}
                  onChange={(e) => handleInputChange('protein_g', parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vitamins and Minerals */}
          <Card>
            <CardHeader>
              <CardTitle>Vitamins and Minerals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vitamin_d_mcg">Vitamin D (mcg)</Label>
                  <Input
                    id="vitamin_d_mcg"
                    type="number"
                    step="0.1"
                    value={nutritionData.vitamin_d_mcg}
                    onChange={(e) => handleInputChange('vitamin_d_mcg', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vitamin_d_dv">Vitamin D Daily Value (%)</Label>
                  <Input
                    id="vitamin_d_dv"
                    type="number"
                    value={nutritionData.vitamin_d_dv}
                    onChange={(e) => handleInputChange('vitamin_d_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calcium_mg">Calcium (mg)</Label>
                  <Input
                    id="calcium_mg"
                    type="number"
                    step="0.1"
                    value={nutritionData.calcium_mg}
                    onChange={(e) => handleInputChange('calcium_mg', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calcium_dv">Calcium Daily Value (%)</Label>
                  <Input
                    id="calcium_dv"
                    type="number"
                    value={nutritionData.calcium_dv}
                    onChange={(e) => handleInputChange('calcium_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iron_mg">Iron (mg)</Label>
                  <Input
                    id="iron_mg"
                    type="number"
                    step="0.1"
                    value={nutritionData.iron_mg}
                    onChange={(e) => handleInputChange('iron_mg', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iron_dv">Iron Daily Value (%)</Label>
                  <Input
                    id="iron_dv"
                    type="number"
                    value={nutritionData.iron_dv}
                    onChange={(e) => handleInputChange('iron_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="potassium_mg">Potassium (mg)</Label>
                  <Input
                    id="potassium_mg"
                    type="number"
                    step="0.1"
                    value={nutritionData.potassium_mg}
                    onChange={(e) => handleInputChange('potassium_mg', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="potassium_dv">Potassium Daily Value (%)</Label>
                  <Input
                    id="potassium_dv"
                    type="number"
                    value={nutritionData.potassium_dv}
                    onChange={(e) => handleInputChange('potassium_dv', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveLabel} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Save Label
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('preview')}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => exportLabel('html')}>
              <Download className="w-4 h-4 mr-2" />
              Export HTML
            </Button>
            <Button variant="outline" onClick={() => exportLabel('json')}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={printLabel}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importLabel}
                style={{ display: 'none' }}
                id="import-file"
              />
              <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import JSON
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Label Preview</CardTitle>
              <CardDescription>
                Preview of your nutrition facts label
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
                <div 
                  dangerouslySetInnerHTML={{ __html: generateLabelHTML() }}
                  style={{ 
                    fontFamily: 'Arial, sans-serif',
                  }}
                />
              </div>
              <style dangerouslySetInnerHTML={{ __html: generateLabelCSS() }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Labels</CardTitle>
              <CardDescription>
                Previously saved nutrition labels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedLabels.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No saved labels found</p>
                ) : (
                  savedLabels.map((label) => (
                    <div key={label.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{label.label_name}</h3>
                        <p className="text-sm text-gray-500">
                          {label.calories} calories • Created {new Date(label.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => loadLabel(label)}>
                        Load
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Label Templates</CardTitle>
              <CardDescription>
                Available nutrition label templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{template.template_name}</h3>
                      {template.is_default && (
                        <Badge variant="outline" className="mt-1">Default</Badge>
                      )}
                    </div>
                    <Button 
                      variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {selectedTemplate?.id === template.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}