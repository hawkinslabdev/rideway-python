'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Cog6ToothIcon,
  BellIcon,
  CurrencyEuroIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'data'>('general')
  const [saved, setSaved] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState({
    currency: 'EUR',
    distanceUnit: 'km',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    notifications: {
      maintenanceDue: true,
      maintenanceOverdue: true,
      lowStock: true,
      webhooksEnabled: false
    },
    webhooks: [
      {
        id: 1,
        name: 'Discord Webhook',
        url: 'https://discord.com/api/webhooks/...',
        enabled: true
      }
    ]
  })

  const handleSave = () => {
    // In a real app, this would save to the backend
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'data', label: 'Data & Privacy', icon: ShieldCheckIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences
        </p>
      </div>

      {/* Success Alert */}
      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure your location and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(value) => setSettings({...settings, currency: value})}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance Unit</Label>
                    <Select 
                      value={settings.distanceUnit} 
                      onValueChange={(value) => setSettings({...settings, distanceUnit: value})}
                    >
                      <SelectTrigger id="distance">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">Kilometers</SelectItem>
                        <SelectItem value="mi">Miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={settings.dateFormat} 
                      onValueChange={(value) => setSettings({...settings, dateFormat: value})}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => setSettings({...settings, language: value})}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="nl">Nederlands</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Values</CardTitle>
                <CardDescription>
                  Set default values for new entries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultGarage">Default Service Provider</Label>
                  <Input 
                    id="defaultGarage"
                    placeholder="e.g., Local Motorcycle Shop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelPrice">Average Fuel Price (per liter)</Label>
                  <Input 
                    id="fuelPrice"
                    type="number"
                    step="0.01"
                    placeholder="1.85"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Due</p>
                      <p className="text-sm text-muted-foreground">
                        Notify when maintenance is approaching
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.maintenanceDue}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          maintenanceDue: e.target.checked
                        }
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Overdue</p>
                      <p className="text-sm text-muted-foreground">
                        Alert when maintenance is overdue
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.maintenanceOverdue}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          maintenanceOverdue: e.target.checked
                        }
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Low Stock Parts</p>
                      <p className="text-sm text-muted-foreground">
                        Notify when parts inventory is low
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.lowStock}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          lowStock: e.target.checked
                        }
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>
                  Configure external notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {webhook.url.substring(0, 40)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={webhook.enabled}
                          onChange={() => {
                            // Toggle webhook enabled status
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    Add Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>
                  Download your data in various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="justify-start">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Export as PDF Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Backup Everything
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>
                  Manage your privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <ShieldCheckIcon className="h-4 w-4" />
                  <AlertDescription>
                    Your data is stored locally and never shared with third parties.
                    All data is encrypted and backed up securely.
                  </AlertDescription>
                </Alert>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your data, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end max-w-2xl">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}