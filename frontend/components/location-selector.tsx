"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MapPin, 
  Search, 
  Navigation, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Globe
} from "lucide-react"

interface LocationData {
  name: string
  lat: number
  lon: number
  state?: string
  lga?: string
  country?: string
}

interface LocationSelectorProps {
  onLocationSelect: (location: LocationData) => void
  initialLocation?: LocationData
  className?: string
}

export function LocationSelector({ onLocationSelect, initialLocation, className }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation?.name || "")
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null)
  const [showMap, setShowMap] = useState(false)
  const [mapCoords, setMapCoords] = useState<{lat: number, lon: number} | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Nigerian states and major cities for autocomplete
  const nigerianLocations = [
    { name: "Lagos", lat: 6.5244, lon: 3.3792, state: "Lagos", country: "Nigeria" },
    { name: "Abuja", lat: 9.0765, lon: 7.3986, state: "FCT", country: "Nigeria" },
    { name: "Kano", lat: 12.0022, lon: 8.5920, state: "Kano", country: "Nigeria" },
    { name: "Ibadan", lat: 7.3776, lon: 3.9470, state: "Oyo", country: "Nigeria" },
    { name: "Port Harcourt", lat: 4.8156, lon: 7.0498, state: "Rivers", country: "Nigeria" },
    { name: "Kaduna", lat: 10.5200, lon: 7.4383, state: "Kaduna", country: "Nigeria" },
    { name: "Maiduguri", lat: 11.8333, lon: 13.1500, state: "Borno", country: "Nigeria" },
    { name: "Zaria", lat: 11.0667, lon: 7.7000, state: "Kaduna", country: "Nigeria" },
    { name: "Aba", lat: 5.1167, lon: 7.3667, state: "Abia", country: "Nigeria" },
    { name: "Jos", lat: 9.9167, lon: 8.9000, state: "Plateau", country: "Nigeria" },
    { name: "Ilorin", lat: 8.5000, lon: 4.5500, state: "Kwara", country: "Nigeria" },
    { name: "Oyo", lat: 7.8500, lon: 3.9333, state: "Oyo", country: "Nigeria" },
    { name: "Enugu", lat: 6.4500, lon: 7.5000, state: "Enugu", country: "Nigeria" },
    { name: "Abeokuta", lat: 7.1500, lon: 3.3500, state: "Ogun", country: "Nigeria" },
    { name: "Sokoto", lat: 13.0667, lon: 5.2333, state: "Sokoto", country: "Nigeria" },
    { name: "Onitsha", lat: 6.1667, lon: 6.7833, state: "Anambra", country: "Nigeria" },
    { name: "Warri", lat: 5.5167, lon: 5.7500, state: "Delta", country: "Nigeria" },
    { name: "Kaduna North", lat: 10.5200, lon: 7.4383, state: "Kaduna", country: "Nigeria" },
    { name: "Mushin", lat: 6.5167, lon: 3.3500, state: "Lagos", country: "Nigeria" },
    { name: "Maiduguri", lat: 11.8333, lon: 13.1500, state: "Borno", country: "Nigeria" }
  ]

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    // Filter Nigerian locations
    const filtered = nigerianLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.state?.toLowerCase().includes(query.toLowerCase())
    )

    // If we have results, use them; otherwise try geocoding
    if (filtered.length > 0) {
      setSearchResults(filtered)
      setIsSearching(false)
    } else {
      // Try to geocode the location
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query + ', Nigeria')}&key=YOUR_API_KEY&limit=5`
        )
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          const results = data.results.map((result: any) => ({
            name: result.formatted,
            lat: result.geometry.lat,
            lon: result.geometry.lng,
            state: result.components.state,
            country: result.components.country
          }))
          setSearchResults(results)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        setSearchResults([])
      }
      
      setIsSearching(false)
    }
  }

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
    setSearchQuery(location.name)
    setSearchResults([])
    onLocationSelect(location)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        
        // Reverse geocode to get location name
        fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_API_KEY&limit=1`
        )
        .then(response => response.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            const result = data.results[0]
            const location: LocationData = {
              name: result.formatted,
              lat: lat,
              lon: lon,
              state: result.components.state,
              country: result.components.country
            }
            handleLocationSelect(location)
          } else {
            // Fallback to coordinates
            const location: LocationData = {
              name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              lat: lat,
              lon: lon
            }
            handleLocationSelect(location)
          }
        })
        .catch(() => {
          // Fallback to coordinates
          const location: LocationData = {
            name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            lat: lat,
            lon: lon
          }
          handleLocationSelect(location)
        })
        .finally(() => {
          setIsGettingLocation(false)
        })
      },
      (error) => {
        console.error('Error getting location:', error)
        setIsGettingLocation(false)
        alert('Unable to get your current location. Please search for your location instead.')
      }
    )
  }

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return
    
    const rect = mapRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Simple coordinate conversion (this is a basic implementation)
    // In a real app, you'd use a proper map library like Leaflet or Google Maps
    const lat = 13.5 - (y / rect.height) * 10 // Approximate for Nigeria
    const lon = 2.5 + (x / rect.width) * 15   // Approximate for Nigeria
    
    setMapCoords({ lat, lon })
  }

  const confirmMapLocation = () => {
    if (mapCoords) {
      const location: LocationData = {
        name: `Selected Location (${mapCoords.lat.toFixed(4)}, ${mapCoords.lon.toFixed(4)})`,
        lat: mapCoords.lat,
        lon: mapCoords.lon
      }
      handleLocationSelect(location)
      setShowMap(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="location-search" className="text-sm font-medium">
          Location
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
          <Input
            id="location-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your location (e.g., Lagos, Kano, Abuja)..."
            className="pl-10 bg-white border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 text-slate-900 placeholder:text-slate-500 shadow-sm"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left p-3 hover:bg-slate-50 hover:border-slate-200 border border-transparent rounded-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-600 group-hover:text-slate-700" />
                    <div>
                      <div className="font-medium text-slate-900 group-hover:text-slate-800">{location.name}</div>
                      {location.state && (
                        <div className="text-sm text-slate-600 group-hover:text-slate-700">
                          {location.state}, {location.country}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex-1 bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 transition-colors shadow-sm"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          Use Current Location
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
          className="flex-1 bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 transition-colors shadow-sm"
        >
          <Globe className="w-4 h-4 mr-2" />
          {showMap ? 'Hide Map' : 'Show Map'}
        </Button>
      </div>

      {/* Map Selector */}
      {showMap && (
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="text-sm text-gray-600 font-medium">
                Click on a city marker to select your location
              </div>
              
              {/* Interactive Map with Real Cities */}
              <div
                ref={mapRef}
                className="w-full h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-gray-200 cursor-pointer relative overflow-hidden"
                onClick={handleMapClick}
              >
                {/* Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50"></div>
                
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-12 grid-rows-8 h-full">
                    {Array.from({ length: 96 }).map((_, i) => (
                      <div key={i} className="border border-gray-300"></div>
                    ))}
                  </div>
                </div>

                {/* City Markers - Positioned roughly where they are in Nigeria */}
                {nigerianLocations.map((city, index) => {
                  // Convert lat/lon to approximate pixel positions for Nigeria
                  const x = ((city.lon - 2.5) / 15) * 100 // 2.5 to 17.5 longitude range
                  const y = ((13.5 - city.lat) / 10) * 100 // 3.5 to 13.5 latitude range
                  
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLocationSelect(city)
                      }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform"></div>
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {city.name}
                      </div>
                    </button>
                  )
                })}

                {/* Selected Location Marker */}
                {mapCoords && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${((mapCoords.lon - 2.5) / 15) * 100}%`, 
                      top: `${((13.5 - mapCoords.lat) / 10) * 100}%` 
                    }}
                  >
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Selected: {mapCoords.lat.toFixed(3)}, {mapCoords.lon.toFixed(3)}
                    </div>
                  </div>
                )}

                {/* Map Legend */}
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Major Cities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Selected Location</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600">
                  Hover over red dots to see city names
                </div>
              </div>

              {/* City List for Easy Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {nigerianLocations.slice(0, 8).map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(city)}
                    className="p-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md transition-colors text-gray-700 hover:text-blue-700"
                  >
                    {city.name}
                  </button>
                ))}
              </div>

              {mapCoords && (
                <Button 
                  onClick={confirmMapLocation} 
                  size="sm" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Selected Location
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <Alert className="bg-slate-50 border-slate-200">
          <CheckCircle className="h-4 w-4 text-slate-600" />
          <AlertDescription className="text-slate-800">
            <div className="font-medium">Selected Location:</div>
            <div className="text-slate-900">{selectedLocation.name}</div>
            <div className="text-sm text-slate-600 mt-1">
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lon.toFixed(6)}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3" />
          <span>Location helps us provide accurate weather and regional recommendations</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>Your location data is only used for agricultural analysis and is not stored permanently</span>
        </div>
      </div>
    </div>
  )
}
