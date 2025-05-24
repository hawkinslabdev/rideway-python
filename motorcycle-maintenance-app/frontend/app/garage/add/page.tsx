'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MotorcycleForm } from '@/components/forms/motorcycle-form'
import { motorcycleApi } from '@/lib/api'
import type { Motorcycle } from '@/lib/types'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function AddMotorcyclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: Partial<Motorcycle>) => {
    try {
      setLoading(true)
      setError('')
      
      // Validate required fields
      if (!data.name || !data.make || !data.model || !data.year) {
        throw new Error('Please fill in all required fields')
      }

      const response = await motorcycleApi.create(data)
      
      setSuccess(true)
      
      // Redirect after a brief success message
      setTimeout(() => {
        router.push(`/garage/${response.data.id}`)
      }, 1500)
      
    } catch (error: any) {
      console.error('Failed to create motorcycle:', error)
      
      // Handle different error types
      if (error.response?.status === 409) {
        setError('A motorcycle with this license plate or VIN already exists.')
      } else if (error.response?.status === 400) {
        setError('Invalid data provided. Please check your inputs.')
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Failed to add motorcycle. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (loading) return
    
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/garage')
    }
  }

  // Show success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-12">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            Motorcycle Added Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Redirecting to your motorcycle profile...
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/garage">
          <Button variant="ghost" size="icon" disabled={loading}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Motorcycle</h1>
          <p className="text-muted-foreground">
            Enter your motorcycle details to start tracking maintenance
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏍️</span>
            Motorcycle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MotorcycleForm 
            onSubmit={handleSubmit} 
            loading={loading}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p className="text-sm">
            <strong>Name:</strong> Choose a memorable name like "Thumper" or "Rebel"
          </p>
          <p className="text-sm">
            <strong>Mileage:</strong> Enter the current odometer reading in kilometers
          </p>
          <p className="text-sm">
            <strong>Photos:</strong> You can add photos later from the motorcycle profile page
          </p>
          <p className="text-sm">
            <strong>VIN:</strong> Usually found on the steering neck or engine case
          </p>
        </CardContent>
      </Card>
    </div>
  )
}