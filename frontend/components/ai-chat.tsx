"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { processNaturalLanguageQuery, NaturalLanguageQueryResponse } from "@/lib/api"
import { toast } from "sonner"

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  metadata?: {
    query_type?: string
    action_required?: string
  }
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI agricultural assistant. I can help you with reporting incidents, analyzing problems, and providing recommendations. How can I assist you today?",
      timestamp: new Date(),
      metadata: {
        query_type: 'welcome',
        action_required: 'none'
      }
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response: NaturalLanguageQueryResponse = await processNaturalLanguageQuery({
        query: input.trim()
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response.response,
        timestamp: new Date(),
        metadata: {
          query_type: response.response.query_type,
          action_required: response.response.action_required
        }
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error processing query:', error)
      toast.error("Failed to process your query. Please try again.")
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
        metadata: {
          query_type: 'error',
          action_required: 'none'
        }
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getQueryTypeColor = (queryType?: string) => {
    switch (queryType) {
      case 'report_incident':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'query_incidents':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'get_help':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'welcome':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActionRequiredColor = (action?: string) => {
    switch (action) {
      case 'report_incident':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'query_data':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'contact_support':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/20 shadow-xl h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Bot className="w-5 h-5 text-primary" />
          AI Agricultural Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by Groq AI
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    
                    {message.metadata && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.metadata.query_type && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getQueryTypeColor(message.metadata.query_type)}`}
                          >
                            {message.metadata.query_type.replace('_', ' ')}
                          </Badge>
                        )}
                        {message.metadata.action_required && message.metadata.action_required !== 'none' && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getActionRequiredColor(message.metadata.action_required)}`}
                          >
                            Action: {message.metadata.action_required.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary/50 text-secondary-foreground rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="p-6 border-t border-border/20">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about agricultural issues, report problems, or get recommendations..."
              className="flex-1 bg-input/80 backdrop-blur-sm border-border/30"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Try asking:</span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6"
              onClick={() => setInput("I need to report a pest infestation in my maize farm")}
            >
              Report pest issue
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6"
              onClick={() => setInput("Show me incidents in Kano Municipal")}
            >
              Query incidents
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6"
              onClick={() => setInput("How do I prevent crop diseases?")}
            >
              Get help
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

