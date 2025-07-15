import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || isInstalled || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (!success) {
      setDismissed(true)
    }
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Install App</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              PWA
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          Install the Packaging Optimizer app for faster access and offline capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-blue-600">
            <div className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <Monitor className="w-4 h-4" />
              <span>Desktop Support</span>
            </div>
          </div>
          <Button onClick={handleInstall} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Install Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}