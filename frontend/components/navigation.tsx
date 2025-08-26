"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, FileText, BarChart3, Menu, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Features", href: "/#features", icon: Sparkles },
  { name: "Report Issue", href: "/report", icon: FileText },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
]

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 hidden md:block">
        <div className="bg-card/80 backdrop-blur-2xl border border-border/30 shadow-2xl rounded-full px-10 py-5">
          <div className="flex items-center gap-12">
            {/* Logo - Further increased size */}
            <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <Image 
                  src="/images/zyra-logo.png" 
                  alt="Zyra Logo" 
                  width={56} 
                  height={56} 
                  className="w-14 h-14" 
                />
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-card/80 backdrop-blur-2xl border-b border-border/20 shadow-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Further increased size */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <Image 
                  src="/images/zyra-logo.png" 
                  alt="Zyra Logo" 
                  width={48} 
                  height={48} 
                  className="w-12 h-12" 
                />
              </div>
              <span className="text-2xl font-bold text-primary">Zyra</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-4 pb-4 border-t border-border/20 pt-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

export function PageHeader({
  title,
  description,
  showBackButton = false,
}: {
  title: string
  description?: string
  showBackButton?: boolean
}) {
  return (
    <div className="pt-20 md:pt-24 pb-8 px-4 max-w-7xl mx-auto">
      {showBackButton && (
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">{title}</h1>
        {description && <p className="text-xl text-muted-foreground text-pretty">{description}</p>}
      </div>
    </div>
  )
}
