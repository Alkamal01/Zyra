"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation, PageHeader } from "@/components/navigation"
import { Upload, Camera, Send, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { submitFarmerReport, FarmerReportRequest, SubmitReportResponse } from "@/lib/api"
import { toast } from "sonner"

export default function ReportDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
  const [submissionResult, setSubmissionResult] = useState<SubmitReportResponse | null>(null)

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
           formData.lga && 
           formData.state && 
           formData.lat && 
           formData.lon && 
           formData.crop && 
           formData.category && 
           formData.description
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background pt-16 md:pt-20">
      <Navigation />

      <PageHeader
        title="Report Agricultural Issue"
        description="Describe your farming challenge and get AI-powered recommendations"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Report Form */}
          <div className="lg:col-span-2">
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

                  {/* Location Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lga" className="text-card-foreground font-medium">
                        Local Government Area (LGA)
                      </Label>
                      <Input
                        id="lga"
                        value={formData.lga}
                        onChange={(e) => handleInputChange('lga', e.target.value)}
                        placeholder="e.g., Kano Municipal"
                        className="bg-input/80 backdrop-blur-sm border-border/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-card-foreground font-medium">
                        State
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="e.g., Kano"
                        className="bg-input/80 backdrop-blur-sm border-border/30"
                        required
                      />
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lat" className="text-card-foreground font-medium">
                        Latitude
                      </Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.001"
                        value={formData.lat || ''}
                        onChange={(e) => handleInputChange('lat', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 12.002"
                        className="bg-input/80 backdrop-blur-sm border-border/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lon" className="text-card-foreground font-medium">
                        Longitude
                      </Label>
                      <Input
                        id="lon"
                        type="number"
                        step="0.001"
                        value={formData.lon || ''}
                        onChange={(e) => handleInputChange('lon', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 8.523"
                        className="bg-input/80 backdrop-blur-sm border-border/30"
                        required
                      />
                    </div>
                  </div>

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
                        Analyzing Issue...
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
                  <div className={`mt-6 p-4 rounded-lg border ${
                    submissionResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {submissionResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          submissionResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {submissionResult.success ? 'Report Submitted Successfully!' : 'Submission Failed'}
                        </h3>
                        <p className={`mt-1 ${
                          submissionResult.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {submissionResult.message}
                        </p>
                        {submissionResult.success && (
                          <div className="mt-3 space-y-1 text-sm text-green-600">
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
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Tips */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-card-foreground">Reporting Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    {
                      title: "Be Specific",
                      desc: "Include exact symptoms, affected area size, and timeline",
                    },
                    {
                      title: "Clear Photos",
                      desc: "Take well-lit photos showing the problem clearly",
                    },
                    {
                      title: "Environmental Context",
                      desc: "Mention recent weather, treatments, or changes",
                    },
                    {
                      title: "Previous Actions",
                      desc: "List any treatments or solutions already attempted",
                    },
                  ].map((tip, index) => (
                    <div key={index} className="bg-secondary/30 rounded-lg p-3 backdrop-blur-sm">
                      <h4 className="font-medium text-card-foreground text-sm">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border-border/20 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-card-foreground mb-2">Emergency Issues?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For urgent agricultural emergencies, contact your local extension office immediately.
                </p>
                <Button variant="outline" size="sm" className="bg-card/50 backdrop-blur-sm">
                  Find Local Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
