import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package, DollarSign } from 'lucide-react'
import { supabase, type Product } from '@/lib/supabase'

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void
  selectedProduct: Product | null
}

export default function ProductSelector({ onProductSelect, selectedProduct }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .order('name')

      if (error) throw error

      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Select Product
          </CardTitle>
          <CardDescription>
            Choose a product to configure packaging and palletizing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Package className="w-5 h-5" />
            Error Loading Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProducts} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Select Product
        </CardTitle>
        <CardDescription>
          Choose a product to configure packaging and palletizing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products by name, SKU, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Product */}
        {selectedProduct && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{selectedProduct.name}</h3>
                <p className="text-sm text-blue-700">SKU: {selectedProduct.sku}</p>
                <p className="text-sm text-blue-600">{selectedProduct.description}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Selected
              </Badge>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No products found matching your search.' : 'No products available.'}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedProduct?.product_id === product.product_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onProductSelect(product)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">{Number(product.base_price).toFixed(2)}</span>
                    </div>
                    {product.recomended_price && (
                      <p className="text-xs text-gray-500">
                        Rec: ${Number(product.recomended_price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredProducts.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </CardContent>
    </Card>
  )
}