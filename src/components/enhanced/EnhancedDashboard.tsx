'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import { BarChart2, RefreshCw, Upload, AlertCircle, Users, ChevronRight, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedButton } from "./EnhancedButton";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "./GlassCard";
import { AnimatedBackground } from "./AnimatedBackground";

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  avgScore: number;
}

export interface EnhancedDashboardProps {
  className?: string;
  stats?: DashboardStats;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClearAll?: () => void;
  onUpload?: () => void;
  children?: React.ReactNode;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  className,
  stats = {
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    avgScore: 0
  },
  loading = false,
  error = null,
  onRefresh,
  onClearAll,
  onUpload,
  children
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <div className="text-blue-400 text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <GlassCard variant="warning" className="max-w-md">
          <GlassCardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <span className="text-red-400">{error}</span>
          </GlassCardContent>
        </GlassCard>
        <EnhancedButton
          variant="outline"
          className="mt-4"
          asChild
        >
          <a href="/debug">
            Troubleshoot Issues
            <ChevronRight className="h-4 w-4 ml-2" />
          </a>
        </EnhancedButton>
      </div>
    );
  }

  if (stats.totalLeads === 0) {
    return (
      <div className={cn("space-y-8 relative", className)}>
        <AnimatedBackground intensity="subtle" variant="particles" />
        
        {/* Enhanced Header */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <BarChart2 className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Contact Dashboard</h1>
          </div>
          <EnhancedButton
            variant="outline"
            size="sm"
            asChild
          >
            <a href="/debug">
              Debug System
              <ChevronRight className="h-4 w-4 ml-2" />
            </a>
          </EnhancedButton>
        </div>

        {/* Enhanced Empty State */}
        <div className="flex justify-center relative z-10">
          <GlassCard 
            variant="prominent" 
            size="xl" 
            className="max-w-2xl text-center"
            glow
          >
            <GlassCardContent className="p-12">
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-full flex items-center justify-center mb-6 relative">
                  <Upload className="h-10 w-10 text-blue-400" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Upload Your Contacts</h2>
                <p className="text-gray-400 max-w-md leading-relaxed">
                  Upload a CSV file with your contacts to start analyzing and tracking them. 
                  We'll help you organize and prioritize your outreach with AI-powered insights.
                </p>
              </div>
              
              <EnhancedButton
                variant="default"
                size="lg"
                onClick={onUpload}
                className="group"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Get Started
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </EnhancedButton>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 relative", className)}>
      <AnimatedBackground intensity="subtle" variant="mixed" />
      
      {/* Enhanced Header with Stats */}
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-xl">
              <BarChart2 className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Contact Scoring Dashboard</h1>
              <p className="text-gray-400 mt-1">AI-powered lead analysis and insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <GlassCard variant="subtle" size="sm" className="px-4 py-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{stats.totalLeads} contacts</span>
              </div>
            </GlassCard>
            
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              loading={refreshing}
            >
              <RefreshCw className="w-4 h-4" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </EnhancedButton>
            
            <EnhancedButton
              variant="destructive"
              size="sm"
              onClick={onClearAll}
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </EnhancedButton>
            
            <EnhancedButton
              variant="ghost"
              size="sm"
              asChild
            >
              <a href="/debug">
                Debug
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </EnhancedButton>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard variant="colored" animation="hover">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Contacts</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalLeads}</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="success" animation="hover">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Qualified Leads</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.qualifiedLeads}</p>
                </div>
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <BarChart2 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="warning" animation="hover">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Conversion Rate</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.conversionRate}%</p>
                </div>
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <ChevronRight className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="prominent" animation="hover">
            <GlassCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.avgScore}</p>
                </div>
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export { EnhancedDashboard };