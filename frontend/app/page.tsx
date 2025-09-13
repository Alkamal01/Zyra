"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { ArrowRight, Upload, Brain, Database, Truck } from "lucide-react"
import { useEffect, useState } from "react"
import { getSystemStats, SystemStats } from "@/lib/api"

export default function LandingPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getSystemStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background pt-16 md:pt-20">
      {/* Enhanced Glassmorphic Navbar */}
      <Navigation />

      {/* Hero Section - Enhanced for mobile */}
      <section className="pt-16 md:pt-12 pb-16 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Title and description */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Smart Agriculture
                <span className="text-primary block">Solutions</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                Empowering farmers with AI-driven insights and blockchain-secured data. Report issues, get instant
                recommendations, and optimize your agricultural practices.
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex gap-4">
              <Link href="/report">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  Report an Issue
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-card/50 backdrop-blur-xl border-border/20 px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Enhanced farmer illustration */}
          <div className="relative">
            <div className="bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 shadow-xl animate-pulse">
              <img
                src="/farmer-using-modern-technology-in-agricultural-fie.png"
                alt="Farmer using technology in field"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Features Section - Updated to match green theme */}
      <section id="features" className="py-20 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Key Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the powerful features that make Zyra the ultimate agricultural extension platform
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { 
                icon: Brain, 
                title: "AI Analysis", 
                desc: "Instant crop diagnostics and intelligent problem identification",
                color: "from-primary/20 to-primary/5"
              },
              { 
                icon: Database, 
                title: "Secure Storage", 
                desc: "Blockchain-secured data protection and immutable records",
                color: "from-chart-2/20 to-chart-2/5"
              },
              { 
                icon: Truck, 
                title: "Fast Response", 
                desc: "Quick resource dispatch and emergency response coordination",
                color: "from-chart-3/20 to-chart-3/5"
              },
              { 
                icon: Upload, 
                title: "Easy Reporting", 
                desc: "Simple issue submission with natural language processing",
                color: "from-chart-4/20 to-chart-4/5"
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-card/60 backdrop-blur-xl border border-border/20 shadow-xl transition-all duration-300 hover:bg-card/80 hover:shadow-2xl hover:-translate-y-1"
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-card-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-pretty">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">How Zyra Works</h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Four simple steps to transform your agricultural challenges into solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Report Issue",
              description:
                "Farmers submit crop problems, pest issues, or soil concerns through our intuitive interface",
              icon: Upload,
              color: "from-primary/20 to-primary/5",
            },
            {
              step: "02",
              title: "AI Analysis",
              description: "Advanced AI algorithms analyze the reported data and images to identify the root cause",
              icon: Brain,
              color: "from-chart-2/20 to-chart-2/5",
            },
            {
              step: "03",
              title: "Secure Storage",
              description: "All data is encrypted and stored on the Internet Computer Protocol blockchain",
              icon: Database,
              color: "from-chart-3/20 to-chart-3/5",
            },
            {
              step: "04",
              title: "Get Solutions",
              description: "Receive personalized recommendations and resources delivered directly to your farm",
              icon: Truck,
              color: "from-chart-4/20 to-chart-4/5",
            },
          ].map((step, index) => (
            <Card
              key={index}
              className="bg-card/60 backdrop-blur-xl border border-border/20 shadow-xl transition-all duration-300 hover:bg-card/80 hover:shadow-2xl hover:-translate-y-1"
            >
              <CardContent className="p-8 text-center space-y-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                >
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-bold text-primary tracking-wider">STEP {step.step}</div>
                  <h3 className="text-xl font-bold text-card-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-pretty">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced Stats Section - Updated to match green theme */}
      <section className="py-20 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">System Impact</h2>
            <p className="text-xl text-muted-foreground">Real-time statistics from our agricultural extension network</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="bg-card/60 backdrop-blur-xl border border-border/20 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoading ? "..." : stats?.total_incidents || "0"}
                </div>
                <div className="text-muted-foreground">Total Incidents</div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-xl border border-border/20 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoading ? "..." : stats ? Object.keys(stats.by_lga).length : "0"}
                </div>
                <div className="text-muted-foreground">Active LGAs</div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-xl border border-border/20 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoading ? "..." : stats?.high_severity_count || "0"}
                </div>
                <div className="text-muted-foreground">High Severity</div>
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-xl border border-border/20 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoading ? "..." : stats ? Object.keys(stats.by_category).length : "0"}
                </div>
                <div className="text-muted-foreground">Issue Categories</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-balance">Ready to Transform Your Farm?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Join thousands of farmers already using Zyra to optimize their agricultural practices
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/report">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Get Started Today
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="bg-card/50 backdrop-blur-xl border-border/20 px-12 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-background via-secondary/10 to-background border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-primary">Zyra</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Empowering farmers with AI-driven agricultural solutions and blockchain-secured data management.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-card/50 backdrop-blur-xl border border-border/20 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-card/50 backdrop-blur-xl border border-border/20 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-card/50 backdrop-blur-xl border border-border/20 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/" className="block text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/report" className="block text-muted-foreground hover:text-primary transition-colors">
                  Report Issue
                </Link>
                <Link href="/dashboard" className="block text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Support</h3>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                  Training Videos
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>support@zyra.ng</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>+234 800 ZYRA</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-border/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © 2024 Zyra Agricultural Solutions. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
