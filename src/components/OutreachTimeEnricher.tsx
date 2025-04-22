"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Send, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/lead';
import { toast } from "@/components/ui/use-toast";

interface OutreachTimeEnricherProps {
  leadId: string;
  companyName: string;
  initialLocation?: string;
  initialTimezone?: string;
  initialOutreachTime?: string;
  onUpdate?: (data: {
    location: string;
    timezone: string;
    optimalOutreachTime: string;
    outreachReason: string;
  }) => void;
}

export const OutreachTimeEnricher = ({
  leadId,
  companyName,
  initialLocation = "",
  initialTimezone = "",
  initialOutreachTime = "",
  onUpdate,
}: OutreachTimeEnricherProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(initialLocation);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [optimalOutreachTime, setOptimalOutreachTime] = useState(initialOutreachTime);
  const [outreachReason, setOutreachReason] = useState("");

  const handleEnrichLocation = async () => {
    if (!companyName) {
      setError("Company name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/enrich-lead-location?company=${encodeURIComponent(companyName)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setLocation(data.location || "");
      setTimezone(data.timezone || "");
      setOptimalOutreachTime(data.optimalOutreachTime || "");
      setOutreachReason(data.outreachReason || "");
      
      // Update the database if we found something
      if (data.location && onUpdate) {
        onUpdate({
          location: data.location,
          timezone: data.timezone,
          optimalOutreachTime: data.optimalOutreachTime,
          outreachReason: data.outreachReason,
        });
      }
      
      // Also update the lead in the database
      if (leadId && data.location) {
        const updateResponse = await fetch("/api/leads/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: leadId,
            location: data.location,
            timezone: data.timezone,
            optimalOutreachTime: data.optimalOutreachTime,
            outreachReason: data.outreachReason,
          }),
        });
        
        if (!updateResponse.ok) {
          console.error("Warning: Changes saved locally but database update failed");
        }
      }
      
      toast({
        title: "Location Enriched",
        description: "Successfully found company location information",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Optimal Outreach Time
        </CardTitle>
        <CardDescription>
          Find the best time to reach out based on company location and time zone
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Outreach Time Optimizer</h3>
          <Button 
            onClick={handleEnrichLocation} 
            disabled={isLoading || !companyName}
            size="sm"
          >
            {isLoading ? "Processing..." : "Enrich Location"}
          </Button>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-sm">{location || "No location data yet"}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Timezone</p>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-sm">{timezone || "No timezone data yet"}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Optimal Outreach Time</p>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <div>
                  <p className="text-sm font-medium">{optimalOutreachTime || "No data yet"}</p>
                  {outreachReason && <p className="text-xs text-muted-foreground">{outreachReason}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 