"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  RefreshCw,
  Clock,
  MapPin,
  Droplets
} from "lucide-react"
import { toast } from "sonner"

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: 'incident' | 'weather' | 'system' | 'recommendation'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Severity Incident Detected',
      message: 'Pest infestation reported in Kano Municipal with severity score 85/100',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      category: 'incident',
      priority: 'high',
      location: 'Kano Municipal',
      action: {
        label: 'View Details',
        onClick: () => console.log('View incident details')
      }
    },
    {
      id: '2',
      type: 'info',
      title: 'Weather Alert',
      message: 'Heavy rainfall expected in Lagos Island area. Consider protective measures for crops.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      category: 'weather',
      priority: 'medium',
      location: 'Lagos Island',
      action: {
        label: 'View Forecast',
        onClick: () => console.log('View weather forecast')
      }
    },
    {
      id: '3',
      type: 'success',
      title: 'Recommendation Applied',
      message: 'Farmer ID F001 successfully applied pest control measures. Status: Resolved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      category: 'recommendation',
      priority: 'low'
    },
    {
      id: '4',
      type: 'error',
      title: 'System Alert',
      message: 'High server load detected. Response times may be slower than usual.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      category: 'system',
      priority: 'medium'
    }
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    toast.success("All notifications marked as read")
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success("Notification removed")
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'weather') return <Droplets className="w-4 h-4" />
    if (category === 'incident') return <AlertTriangle className="w-4 h-4" />
    if (category === 'recommendation') return <CheckCircle className="w-4 h-4" />
    if (category === 'system') return <Info className="w-4 h-4" />
    
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <X className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-orange-600'
      case 'error': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-card/50 backdrop-blur-sm border-border/20"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 bg-card/95 backdrop-blur-xl border-border/20 shadow-2xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-2 p-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border transition-all hover:bg-secondary/50 ${
                          !notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-card/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                            {getNotificationIcon(notification.type, notification.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm text-card-foreground">
                                    {notification.title}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(notification.priority)}`}
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimeAgo(notification.timestamp)}</span>
                                  {notification.location && (
                                    <>
                                      <MapPin className="w-3 h-3 ml-2" />
                                      <span>{notification.location}</span>
                                    </>
                                  )}
                                </div>
                                
                                {notification.action && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={notification.action.onClick}
                                    className="mt-2 h-6 px-2 text-xs"
                                  >
                                    {notification.action.label}
                                  </Button>
                                )}
                              </div>
                              
                              <div className="flex gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeNotification(notification.id)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

