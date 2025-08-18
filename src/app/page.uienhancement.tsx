'use client';

import * as React from "react";
import { useState } from "react";
import { EnhancedNavigation } from "@/components/enhanced/EnhancedNavigation";
import { EnhancedHero } from "@/components/enhanced/EnhancedHero";
import { EnhancedDashboard } from "@/components/enhanced/EnhancedDashboard";
import { EnhancedLeadsTable } from "@/components/enhanced/EnhancedLeadsTable";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/enhanced/GlassCard";
import { EnhancedButton } from "@/components/enhanced/EnhancedButton";
import { AnimatedBackground } from "@/components/enhanced/AnimatedBackground";
import { mockData } from "@/mockData";
import { Star, CheckCircle, ArrowRight, Zap, Target, TrendingUp, Users, BarChart3 } from "lucide-react";

export default function UIEnhancementPreview() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const handleRefresh = async () => {
    setDashboardLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDashboardLoading(false);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all contacts?')) {
      // Simulate clearing data
      console.log('Clearing all contacts...');
    }
  };

  const handleExport = () => {
    console.log('Exporting contacts...');
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        {/* Enhanced Navigation */}
        <EnhancedNavigation variant="glass" />
        
        {/* Enhanced Hero Section */}
        <EnhancedHero 
          title="Find Your Best Leads"
          subtitle="with AI Precision"
          description="OptiLeads.ai uses advanced AI to identify, score, and engage high-quality leads that are most likely to convert, saving you time and maximizing your ROI."
          primaryCTA={{
            text: "Get Started for Free",
            href: "#"
          }}
          secondaryCTA={{
            text: "View Dashboard",
            href: "#"
          }}
        />

        {/* Social Proof Section */}
        <section className="relative z-40 py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl font-semibold mb-12 text-gray-300">
              Trusted by innovative companies worldwide
            </h2>
            <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
              {mockData.companies.map((company) => (
                <div 
                  key={company} 
                  className="text-gray-400 text-2xl font-bold hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8" id="features">
          <AnimatedBackground intensity="subtle" variant="orbs" />
          
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold mb-6 animate-fade-in">
                Powerful Features for Lead Generation
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-slide-up">
                Everything you need to find, score, and convert high-quality leads with AI precision.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <GlassCard variant="colored" animation="hover" glow>
                <GlassCardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-indigo-600/20 p-3 rounded-xl">
                      <Target className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">AI Lead Scoring</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Advanced machine learning algorithms analyze multiple data points to score leads based on conversion probability.
                  </p>
                </GlassCardContent>
              </GlassCard>
              
              <GlassCard variant="success" animation="hover" glow>
                <GlassCardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-600/20 p-3 rounded-xl">
                      <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Smart Automation</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Automate your outreach with intelligent sequencing, personalized messaging, and optimal timing.
                  </p>
                </GlassCardContent>
              </GlassCard>
              
              <GlassCard variant="warning" animation="hover" glow>
                <GlassCardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-purple-600/20 p-3 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Analytics & Insights</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Get detailed analytics on lead performance, conversion rates, and campaign effectiveness.
                  </p>
                </GlassCardContent>
              </GlassCard>
              
              <GlassCard variant="prominent" animation="hover" glow>
                <GlassCardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-green-600/20 p-3 rounded-xl">
                      <Users className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Lead Enrichment</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Automatically enrich lead profiles with comprehensive data including company information and contact details.
                  </p>
                </GlassCardContent>
              </GlassCard>
              
              <GlassCard variant="colored" animation="hover" glow>
                <GlassCardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-orange-600/20 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Predictive Analytics</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Leverage predictive models to identify trends, forecast lead quality, and optimize your sales pipeline.
                  </p>
                </GlassCardContent>
              </GlassCard>
              
              <GlassCard variant="default" animation="hover" glow>
                <GlassCardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-cyan-600/20 p-3 rounded-xl">
                      <Star className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Real-time Updates</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Stay informed with real-time notifications about lead activities and new opportunities.
                  </p>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8 bg-white/5" id="testimonials">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 animate-fade-in">
                Real Results from Real Customers
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockData.testimonials.map((testimonial, index) => (
                <GlassCard 
                  key={testimonial.name}
                  variant="subtle" 
                  animation="hover"
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <GlassCardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/20"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                        <p className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 italic leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="relative z-40 py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold animate-fade-in">
                Proven Performance
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {mockData.stats.map((stat, index) => (
                <GlassCard 
                  key={stat.label} 
                  variant="prominent"
                  animation="hover"
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <GlassCardContent className="p-6">
                    <p className="text-5xl font-bold text-indigo-400 mb-2">{stat.value}</p>
                    <p className="text-gray-300">{stat.label}</p>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA to Dashboard */}
        <section className="relative z-40 py-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6 animate-fade-in">
              Ready to see your enhanced dashboard?
            </h2>
            <p className="text-xl text-gray-300 mb-12 animate-slide-up">
              Experience the power of our AI-driven lead management platform with modern UI enhancements.
            </p>
            <EnhancedButton
              variant="default"
              size="xl"
              onClick={() => setCurrentView('dashboard')}
              className="animate-scale-in group"
            >
              View Enhanced Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </EnhancedButton>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Enhanced Navigation */}
      <EnhancedNavigation variant="glass">
        <div className="flex items-center gap-4 ml-auto">
          <EnhancedButton
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('landing')}
          >
            ← Back to Landing
          </EnhancedButton>
        </div>
      </EnhancedNavigation>

      {/* Enhanced Dashboard */}
      <div className="container mx-auto p-6">
        <EnhancedDashboard
          stats={mockData.dashboardStats}
          loading={dashboardLoading}
          onRefresh={handleRefresh}
          onClearAll={handleClearAll}
        >
          <EnhancedLeadsTable
            leads={mockData.leads}
            loading={dashboardLoading}
            onExport={handleExport}
          />
        </EnhancedDashboard>
      </div>
    </div>
  );
}