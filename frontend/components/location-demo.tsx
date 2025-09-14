"use client"

import React, { useState } from 'react'
import { LocationSelector } from './location-selector'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { MapPin, CheckCircle } from 'lucide-react'

interface LocationData {
  name: string
  lat: number
  lon: number
  state?: string
  lga?: string
  country?: string
}

export function LocationDemo() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Selector Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            initialLocation={selectedLocation}
          />
        </CardContent>
      </Card>

      {selectedLocation && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Selected Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-medium text-green-900">{selectedLocation.name}</div>
            <div className="text-sm text-green-700">
              <div>Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lon.toFixed(6)}</div>
              {selectedLocation.state && (
                <div>State: {selectedLocation.state}</div>
              )}
              {selectedLocation.lga && (
                <div>LGA: {selectedLocation.lga}</div>
              )}
              {selectedLocation.country && (
                <div>Country: {selectedLocation.country}</div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary">Lat: {selectedLocation.lat.toFixed(4)}</Badge>
              <Badge variant="secondary">Lon: {selectedLocation.lon.toFixed(4)}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
