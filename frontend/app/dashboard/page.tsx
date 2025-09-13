"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation, PageHeader } from "@/components/navigation"
import { AIChat } from "@/components/ai-chat"
import { 
  WeatherWidget, 
  PerformanceMetrics, 
  IncidentTrendChart, 
  CategoryDistributionChart, 
  QuickActions 
} from "@/components/analytics-widgets"
import { TrendingUp, AlertTriangle, CheckCircle, Clock, BarChart3, Droplets, Bug, Sprout, MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { 
  getSystemStats, 
  getAllIncidents, 
  queryIncidentsByLGA, 
  Incident, 
  SystemStats, 
  LGAQueryResponse,
  getSeverityColor,
  getStatusColor,
  getCategoryColor
} from "@/lib/api"
import { toast } from "sonner"

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("farmer")
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [lgaQuery, setLgaQuery] = useState("")
  const [lgaResults, setLgaResults] = useState<LGAQueryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isQuerying, setIsQuerying] = useState(false)

  // Load initial data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsData, incidentsData] = await Promise.all([
        getSystemStats(),
        getAllIncidents()
      ])
      setStats(statsData)
      setIncidents(incidentsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLGAQuery = async () => {
    if (!lgaQuery.trim()) {
      toast.error("Please enter an LGA name")
      return
    }

    setIsQuerying(true)
    try {
      const result = await queryIncidentsByLGA(lgaQuery.trim())
      setLgaResults(result)
      toast.success(`Found ${result.total_incidents} incidents in ${result.lga}`)
    } catch (error) {
      console.error('Error querying LGA:', error)
      toast.error("Failed to query LGA")
    } finally {
      setIsQuerying(false)
    }
  }

  // Transform data for charts
  const getCategoryChartData = () => {
    if (!stats) return []
    return Object.entries(stats.by_category).map(([category, count]) => ({
      name: category.replace('_', ' ').toUpperCase(),
      value: count,
      color: getCategoryColor(category)
    }))
  }

  const getLGAChartData = () => {
    if (!stats) return []
    return Object.entries(stats.by_lga)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([lga, count]) => ({
        name: lga,
        incidents: count
      }))
  }

  const getTrendData = () => {
    // Mock trend data - in a real app, this would come from historical data
    return [
      { month: "Jan", pestReports: 12, diseaseReports: 8, soilIssues: 5, weatherDamage: 3 },
      { month: "Feb", pestReports: 15, diseaseReports: 12, soilIssues: 7, weatherDamage: 2 },
      { month: "Mar", pestReports: 8, diseaseReports: 6, soilIssues: 4, weatherDamage: 8 },
      { month: "Apr", pestReports: 10, diseaseReports: 9, soilIssues: 6, weatherDamage: 1 },
      { month: "May", pestReports: 18, diseaseReports: 14, soilIssues: 8, weatherDamage: 4 },
      { month: "Jun", pestReports: 22, diseaseReports: 16, soilIssues: 10, weatherDamage: 6 },
    ]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background pt-16 md:pt-20">
        <Navigation />
        <PageHeader
          title="Analytics Dashboard"
          description="Monitor your farm's health and track agricultural insights"
        />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background pt-16 md:pt-20">
      <Navigation />

      <PageHeader
        title="Analytics Dashboard"
        description="Monitor your farm's health and track agricultural insights"
      />

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* AI Chat Section */}
        <div className="mb-8">
          <AIChat />
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-card/50 backdrop-blur-xl border border-border/20 shadow-lg">
              <TabsTrigger
                value="farmer"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Farmer View
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Admin View
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Farmer Dashboard */}
          <TabsContent value="farmer" className="space-y-8">
            {/* Quick Actions and Weather */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickActions />
              </div>
              <div>
                <WeatherWidget />
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: "Total Incidents", 
                  value: stats?.total_incidents.toString() || "0", 
                  icon: BarChart3, 
                  change: "+12%", 
                  color: "text-blue-600" 
                },
                { 
                  title: "High Severity", 
                  value: stats?.high_severity_count.toString() || "0", 
                  icon: AlertTriangle, 
                  change: "+2", 
                  color: "text-red-600" 
                },
                { 
                  title: "Active LGAs", 
                  value: stats ? Object.keys(stats.by_lga).length.toString() : "0", 
                  icon: MapPin, 
                  change: "+3", 
                  color: "text-green-600" 
                },
                { 
                  title: "Categories", 
                  value: stats ? Object.keys(stats.by_category).length.toString() : "0", 
                  icon: Bug, 
                  change: "+1", 
                  color: "text-purple-600" 
                },
              ].map((stat, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                        <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
                      </div>
                      <stat.icon className={`w-12 h-12 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* LGA Query Section */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Search className="w-5 h-5 text-primary" />
                  Query Incidents by LGA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Enter LGA name (e.g., Kano Municipal)"
                    value={lgaQuery}
                    onChange={(e) => setLgaQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleLGAQuery} 
                    disabled={isQuerying}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isQuerying ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>

                {lgaResults && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-blue-800 font-semibold text-lg mb-4">Results for {lgaResults.lga}</h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{lgaResults.total_incidents}</div>
                        <div className="text-sm text-gray-600">Total Incidents</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{lgaResults.high_severity_count}</div>
                        <div className="text-sm text-gray-600">High Severity</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{Object.keys(lgaResults.category_breakdown).length}</div>
                        <div className="text-sm text-gray-600">Categories</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Category Breakdown:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(lgaResults.category_breakdown).map(([category, count]) => (
                          <Badge key={category} variant="secondary">
                            {category}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {lgaResults.high_severity_count > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-red-800 mb-2">⚠️ High Severity Incidents:</h4>
                        <ul className="list-disc list-inside text-red-700 text-sm">
                          {lgaResults.top_high_severity.map((incident, index) => (
                            <li key={index}>{incident}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Incidents */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.slice(0, 5).map((incident, index) => (
                    <div
                      key={`${incident.incident_id}-${index}`}
                      className="bg-secondary/30 backdrop-blur-sm rounded-xl p-4 border border-border/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-card-foreground">{incident.category.replace('_', ' ').toUpperCase()}</h3>
                          <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                          <Badge className={getSeverityColor(incident.enriched.severity_score)}>
                            Severity: {incident.enriched.severity_score}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(incident.reported_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Farmer:</strong> {incident.farmer_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Location:</strong> {incident.lga}, {incident.state}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Crop:</strong> {incident.crop}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Description:</strong> {incident.description.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                      {incident.recommendations.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <strong>Recommendation:</strong> {incident.recommendations[0].step}
                          </p>
                        </div>
                      )}
                      {incident.resource_request.requested && (
                        <div className="bg-red-50 rounded-lg p-3 mt-2">
                          <p className="text-sm text-red-800">
                            <strong>🚨 Resource Request:</strong> {incident.resource_request.type} - {incident.resource_request.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Bug className="w-5 h-5 text-primary" />
                    Issue Distribution by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategoryChartData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {getCategoryChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.9)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top LGAs */}
              <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    Top LGAs by Incident Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getLGAChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.9)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="incidents" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Dashboard */}
          <TabsContent value="admin" className="space-y-8">
            {/* Performance Metrics and Weather */}
            <div className="grid lg:grid-cols-2 gap-6">
              <PerformanceMetrics />
              <WeatherWidget />
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: "Total Incidents", 
                  value: stats?.total_incidents.toString() || "0", 
                  icon: BarChart3, 
                  change: "+23%", 
                  color: "text-blue-600" 
                },
                { 
                  title: "High Severity", 
                  value: stats?.high_severity_count.toString() || "0", 
                  icon: AlertTriangle, 
                  change: "+2", 
                  color: "text-red-600" 
                },
                { 
                  title: "Active LGAs", 
                  value: stats ? Object.keys(stats.by_lga).length.toString() : "0", 
                  icon: MapPin, 
                  change: "+3", 
                  color: "text-green-600" 
                },
                { 
                  title: "Categories", 
                  value: stats ? Object.keys(stats.by_category).length.toString() : "0", 
                  icon: Bug, 
                  change: "+1", 
                  color: "text-purple-600" 
                },
              ].map((stat, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                        <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
                      </div>
                      <stat.icon className={`w-12 h-12 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <IncidentTrendChart />
              <CategoryDistributionChart />
            </div>

            {/* Trend Analysis */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-card-foreground">Agricultural Issue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="pestReports" stroke="#ef4444" strokeWidth={3} />
                    <Line type="monotone" dataKey="diseaseReports" stroke="#f97316" strokeWidth={3} />
                    <Line type="monotone" dataKey="soilIssues" stroke="#eab308" strokeWidth={3} />
                    <Line type="monotone" dataKey="weatherDamage" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* All Incidents Table */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-card-foreground">All Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {incidents.map((incident, index) => (
                    <div
                      key={`${incident.incident_id}-${index}`}
                      className="bg-secondary/30 backdrop-blur-sm rounded-xl p-4 border border-border/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-card-foreground">{incident.incident_id}</h3>
                          <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                          <Badge className={getSeverityColor(incident.enriched.severity_score)}>
                            {incident.enriched.severity_score}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(incident.reported_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            <strong>Farmer:</strong> {incident.farmer_id}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Location:</strong> {incident.lga}, {incident.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            <strong>Crop:</strong> {incident.crop}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Category:</strong> {incident.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            <strong>Description:</strong> {incident.description.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
