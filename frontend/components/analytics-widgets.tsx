"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap
} from "lucide-react"
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    precipitation: number
  }>
}

interface PerformanceMetrics {
  responseTime: number
  accuracy: number
  userSatisfaction: number
  systemUptime: number
}

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    condition: 'partly-cloudy',
    forecast: [
      { day: 'Mon', high: 32, low: 24, condition: 'sunny', precipitation: 0 },
      { day: 'Tue', high: 30, low: 22, condition: 'cloudy', precipitation: 20 },
      { day: 'Wed', high: 28, low: 20, condition: 'rainy', precipitation: 80 },
      { day: 'Thu', high: 26, low: 18, condition: 'rainy', precipitation: 90 },
      { day: 'Fri', high: 29, low: 21, condition: 'partly-cloudy', precipitation: 10 },
    ]
  })

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />
      case 'partly-cloudy': return <Cloud className="w-5 h-5 text-gray-400" />
      default: return <Sun className="w-5 h-5 text-yellow-500" />
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cloudy': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'rainy': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'partly-cloudy': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Droplets className="w-5 h-5 text-primary" />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weatherData.condition)}
            <div>
              <div className="text-2xl font-bold text-card-foreground">
                {weatherData.temperature}°C
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {weatherData.condition.replace('-', ' ')}
              </div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Wind className="w-3 h-3" />
              {weatherData.windSpeed} km/h
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Droplets className="w-3 h-3" />
              {weatherData.humidity}%
            </div>
          </div>
        </div>

        {/* Weather Forecast */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-card-foreground">5-Day Forecast</h4>
          <div className="space-y-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-8">{day.day}</span>
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <span className="font-medium">{day.high}°</span>
                    <span className="text-muted-foreground">/{day.low}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{day.precipitation}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0.8,
    accuracy: 94.5,
    userSatisfaction: 87.2,
    systemUptime: 99.8
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading metrics
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const getMetricColor = (value: number, type: 'response' | 'percentage') => {
    if (type === 'response') {
      if (value < 1) return 'text-green-600'
      if (value < 2) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      if (value >= 90) return 'text-green-600'
      if (value >= 70) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const getMetricIcon = (value: number, type: 'response' | 'percentage') => {
    if (type === 'response') {
      return value < 1 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
    } else {
      return value >= 90 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-muted-foreground">Loading metrics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Activity className="w-5 h-5 text-primary" />
          System Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <div className={`flex items-center gap-1 ${getMetricColor(metrics.responseTime, 'response')}`}>
                {getMetricIcon(metrics.responseTime, 'response')}
                <span className="text-sm font-medium">{metrics.responseTime}s</span>
              </div>
            </div>
            <Progress value={Math.max(0, 100 - (metrics.responseTime * 50))} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accuracy</span>
              <div className={`flex items-center gap-1 ${getMetricColor(metrics.accuracy, 'percentage')}`}>
                {getMetricIcon(metrics.accuracy, 'percentage')}
                <span className="text-sm font-medium">{metrics.accuracy}%</span>
              </div>
            </div>
            <Progress value={metrics.accuracy} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User Satisfaction</span>
              <div className={`flex items-center gap-1 ${getMetricColor(metrics.userSatisfaction, 'percentage')}`}>
                {getMetricIcon(metrics.userSatisfaction, 'percentage')}
                <span className="text-sm font-medium">{metrics.userSatisfaction}%</span>
              </div>
            </div>
            <Progress value={metrics.userSatisfaction} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <div className={`flex items-center gap-1 ${getMetricColor(metrics.systemUptime, 'percentage')}`}>
                {getMetricIcon(metrics.systemUptime, 'percentage')}
                <span className="text-sm font-medium">{metrics.systemUptime}%</span>
              </div>
            </div>
            <Progress value={metrics.systemUptime} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function IncidentTrendChart() {
  const data = [
    { month: 'Jan', incidents: 45, resolved: 38, pending: 7 },
    { month: 'Feb', incidents: 52, resolved: 45, pending: 7 },
    { month: 'Mar', incidents: 38, resolved: 35, pending: 3 },
    { month: 'Apr', incidents: 61, resolved: 48, pending: 13 },
    { month: 'May', incidents: 73, resolved: 58, pending: 15 },
    { month: 'Jun', incidents: 68, resolved: 62, pending: 6 },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <BarChart3 className="w-5 h-5 text-primary" />
          Incident Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
            <Bar dataKey="incidents" fill="#3b82f6" name="Total Incidents" />
            <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CategoryDistributionChart() {
  const data = [
    { name: 'Pest', value: 35, color: '#ef4444' },
    { name: 'Disease', value: 28, color: '#f97316' },
    { name: 'Flood', value: 15, color: '#3b82f6' },
    { name: 'Drought', value: 12, color: '#eab308' },
    { name: 'Input Need', value: 10, color: '#10b981' },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <PieChart className="w-5 h-5 text-primary" />
          Issue Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
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
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function QuickActions() {
  const actions = [
    {
      title: 'Report New Issue',
      description: 'Submit agricultural problem',
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/report'
    },
    {
      title: 'View Analytics',
      description: 'Check system metrics',
      icon: BarChart3,
      color: 'bg-blue-500',
      href: '/dashboard'
    },
    {
      title: 'AI Assistant',
      description: 'Get instant help',
      icon: Zap,
      color: 'bg-purple-500',
      href: '#chat'
    },
    {
      title: 'Weather Forecast',
      description: 'Check conditions',
      icon: Droplets,
      color: 'bg-cyan-500',
      href: '#weather'
    }
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Target className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 bg-card/50 backdrop-blur-sm border-border/20 hover:bg-secondary/50"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

