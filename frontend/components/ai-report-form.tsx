"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  Camera, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Brain, 
  Loader2,
  Sparkles,
  MapPin,
  Droplets,
  Bug
} from "lucide-react"
import { 
  submitFarmerReport, 
  analyzeIncidentWithAI, 
  getAIRecommendations,
  FarmerReportRequest, 
  SubmitReportResponse,
  AIAnalysisResponse,
  AIRecommendationResponse
} from "@/lib/api"
import { LocationSelector } from "@/components/location-selector"
import { toast } from "sonner"

interface AIAnalysis {
  severity_score: number
  weather_hint: string
  tags: string[]
  risk_factors: string[]
  urgency_level: string
  affected_area_estimate: string
  potential_spread: string
}

interface AIRecommendations {
  immediate_actions: string[]
  preventive_measures: string[]
  monitoring_steps: string[]
  resource_needs: string[]
  timeline: string
  follow_up_required: boolean
}

interface LocationData {
  name: string
  lat: number
  lon: number
  state?: string
  lga?: string
  country?: string
}

export function AIReportForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [formData, setFormData] = useState<FarmerReportRequest>({
    farmer_id: "",
    lga: "",
    state: "",
    lat: 0,
    lon: 0,
    crop: "",
    category: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmitReportResponse | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null)
  const [analysisStep, setAnalysisStep] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleInputChange = (field: keyof FarmerReportRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location)
    setFormData(prev => ({
      ...prev,
      lat: location.lat,
      lon: location.lon,
      state: location.state || "",
      lga: location.lga || ""
    }))
  }

  const handleAIAnalysis = async () => {
    if (!formData.crop || !formData.category || !formData.description) {
      toast.error("Please fill in crop, category, and description for AI analysis")
      return
    }

    setIsAnalyzing(true)
    setAnalysisStep(0)

    try {
      // Step 1: Analyze incident
      setAnalysisStep(1)
      const analysisResponse: AIAnalysisResponse = await analyzeIncidentWithAI({
        category: formData.category,
        crop: formData.crop,
        description: formData.description,
        lat: formData.lat,
        lon: formData.lon
      })

      setAiAnalysis(analysisResponse.analysis)

      // Step 2: Get recommendations
      setAnalysisStep(2)
      const recommendationsResponse: AIRecommendationResponse = await getAIRecommendations({
        category: formData.category,
        crop: formData.crop,
        severity: analysisResponse.analysis.severity_score,
        analysis: analysisResponse.analysis
      })

      setAiRecommendations(recommendationsResponse.recommendations)
      setAnalysisStep(3)

      toast.success("AI analysis completed successfully!")
    } catch (error) {
      console.error('Error in AI analysis:', error)
      toast.error("AI analysis failed. You can still submit your report.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionResult(null)

    try {
      const result = await submitFarmerReport(formData)
      setSubmissionResult(result)
      
      if (result.success) {
        toast.success("Report submitted successfully!", {
          description: result.message
        })
        
        // Reset form
        setFormData({
          farmer_id: "",
          lga: "",
          state: "",
          lat: 0,
          lon: 0,
          crop: "",
          category: "",
          description: ""
        })
        setSelectedFile(null)
        setAiAnalysis(null)
        setAiRecommendations(null)
        setAnalysisStep(0)
      } else {
        toast.error("Failed to submit report", {
          description: result.message
        })
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error("Error submitting report", {
        description: "Please try again later"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return formData.farmer_id && 
           selectedLocation && 
           formData.crop && 
           formData.category && 
           formData.description
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 70) return 'text-red-600 bg-red-50 border-red-200'
    if (severity >= 50) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Brain className="w-6 h-6 text-primary" />
            AI-Powered Analysis
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              Groq AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!aiAnalysis && !isAnalyzing && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Get instant AI analysis of your agricultural issue
              </p>
              <Button 
                onClick={handleAIAnalysis}
                disabled={!formData.crop || !formData.category || !formData.description}
                className="bg-primary hover:bg-primary/90"
              >
                <Brain className="w-4 h-4 mr-2" />
                Analyze with AI
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">AI is analyzing your issue...</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing incident details</span>
                  <span>{analysisStep >= 1 ? '✓' : '⏳'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Generating recommendations</span>
                  <span>{analysisStep >= 2 ? '✓' : '⏳'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Finalizing analysis</span>
                  <span>{analysisStep >= 3 ? '✓' : '⏳'}</span>
                </div>
              </div>
              
              <Progress value={(analysisStep / 3) * 100} className="w-full" />
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-card-foreground">Severity Assessment</h4>
                  <div className={`p-3 rounded-lg border ${getSeverityColor(aiAnalysis.severity_score)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Severity Score</span>
                      <span className="text-2xl font-bold">{aiAnalysis.severity_score}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-card-foreground">Urgency Level</h4>
                  <div className={`p-3 rounded-lg border ${getUrgencyColor(aiAnalysis.urgency_level)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Urgency</span>
                      <Badge className={getUrgencyColor(aiAnalysis.urgency_level)}>
                        {aiAnalysis.urgency_level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Weather Hint
                  </h4>
                  <p className="text-sm text-muted-foreground">{aiAnalysis.weather_hint}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Affected Area
                  </h4>
                  <p className="text-sm text-muted-foreground capitalize">{aiAnalysis.affected_area_estimate}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Potential Spread
                  </h4>
                  <p className="text-sm text-muted-foreground capitalize">{aiAnalysis.potential_spread}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">Risk Factors</h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.risk_factors.map((factor, index) => (
                    <Badge key={index} variant="outline">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {aiRecommendations && (
            <div className="space-y-4 pt-4 border-t border-border/20">
              <h4 className="font-semibold text-card-foreground">AI Recommendations</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-card-foreground">Immediate Actions</h5>
                  <ul className="space-y-1">
                    {aiRecommendations.immediate_actions.map((action, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-card-foreground">Preventive Measures</h5>
                  <ul className="space-y-1">
                    {aiRecommendations.preventive_measures.map((measure, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {measure}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-card-foreground">Monitoring Steps</h5>
                  <ul className="space-y-1">
                    {aiRecommendations.monitoring_steps.map((step, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-card-foreground">Resource Needs</h5>
                  <ul className="space-y-1">
                    {aiRecommendations.resource_needs.map((resource, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Timeline & Follow-up</span>
                </div>
                <p className="text-sm text-blue-700">
                  <strong>Expected Resolution:</strong> {aiRecommendations.timeline}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Follow-up Required:</strong> {aiRecommendations.follow_up_required ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Form */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Issue Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farmer ID */}
            <div className="space-y-2">
              <Label htmlFor="farmer-id" className="text-card-foreground font-medium">
                Farmer ID
              </Label>
              <Input
                id="farmer-id"
                value={formData.farmer_id}
                onChange={(e) => handleInputChange('farmer_id', e.target.value)}
                placeholder="Enter your farmer ID"
                className="bg-input/80 backdrop-blur-sm border-border/30"
                required
              />
            </div>

            {/* Location Selector */}
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              initialLocation={selectedLocation}
              className="col-span-2"
            />

            {/* Crop and Category */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crop" className="text-card-foreground font-medium">
                  Crop
                </Label>
                <Select value={formData.crop} onValueChange={(value) => handleInputChange('crop', value)} required>
                  <SelectTrigger className="bg-input/80 backdrop-blur-sm border-border/30">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/90 backdrop-blur-xl border-border/20">
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="cassava">Cassava</SelectItem>
                    <SelectItem value="tomato">Tomato</SelectItem>
                    <SelectItem value="sorghum">Sorghum</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-card-foreground font-medium">
                  Issue Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
                  <SelectTrigger className="bg-input/80 backdrop-blur-sm border-border/30">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover/90 backdrop-blur-xl border-border/20">
                    <SelectItem value="pest">Pest Infestation</SelectItem>
                    <SelectItem value="disease">Plant Disease</SelectItem>
                    <SelectItem value="flood">Flood Damage</SelectItem>
                    <SelectItem value="drought">Drought</SelectItem>
                    <SelectItem value="input_need">Input Need</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-card-foreground font-medium">
                Detailed Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the issue in detail. Include when you first noticed it, affected area size, symptoms observed, and any treatments already tried..."
                className="bg-input/80 backdrop-blur-sm border-border/30 min-h-32 resize-none"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">Upload Image (Optional)</Label>
              <div className="border-2 border-dashed border-border/40 rounded-xl p-8 text-center bg-secondary/20 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <Camera className="w-12 h-12 text-primary mx-auto" />
                      <p className="text-card-foreground font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-card-foreground font-medium">Upload a photo of the issue</p>
                      <p className="text-sm text-muted-foreground">
                        Clear images help our AI provide better recommendations
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </form>

          {/* Submission Result */}
          {submissionResult && (
            <Alert className={`mt-6 ${
              submissionResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {submissionResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={
                submissionResult.success ? 'text-green-800' : 'text-red-800'
              }>
                <div className="font-semibold mb-2">
                  {submissionResult.success ? 'Report Submitted Successfully!' : 'Submission Failed'}
                </div>
                <p className="mb-2">{submissionResult.message}</p>
                {submissionResult.success && (
                  <div className="space-y-1 text-sm">
                    <div><strong>Incident ID:</strong> {submissionResult.incident_id}</div>
                    <div><strong>Severity:</strong> {submissionResult.severity}/100</div>
                    <div><strong>Recommendation:</strong> {submissionResult.recommendation}</div>
                    {submissionResult.resource_requested && (
                      <div className="text-orange-600">
                        <strong>⚠️ Resource Request:</strong> High severity incident - resources will be dispatched
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

