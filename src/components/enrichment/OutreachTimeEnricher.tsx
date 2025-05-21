'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, RefreshCw, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from "sonner";

interface OutreachTimeEnricherProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
}

const OutreachTimeEnricher: React.FC<OutreachTimeEnricherProps> = ({ lead, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLocalStorage, setIsLocalStorage] = useState(false);

  const enrichLeadLocation = useDebouncedCallback(async () => {
    // --- START: Check for existing data --- 
    if (lead.location && lead.timezone) {
      console.log('Lead already has location and timezone. Skipping enrichment API call.');
      toast.info("Lead already has location and timezone information.");
      // Optionally, you could reset loading/success states if needed
      // setIsLoading(false); 
      // setSuccess(false);
      // setError(null);
      return; // Stop execution if data exists
    }
    // --- END: Check for existing data --- 

    if (!lead || !lead.company) {
      setError("Missing lead or company name for enrichment.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setIsLocalStorage(false);

    try {
      const response = await fetch(`/api/enrich-lead-location?company=${encodeURIComponent(lead.company)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      const updatedLead: Lead = {
        ...lead,
        location: data.location,
        timezone: data.timezone,
        optimalOutreachTime: data.optimalOutreachTime,
        optimalOutreachTimeEastern: data.optimalOutreachTimeEastern,
        outreachReason: data.outreachReason,
      };

      // Update local state immediately
      onUpdate(updatedLead);
      
      // Then persist to the database
      try {
        const updateResponse = await fetch('/api/update-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: lead.id, 
            location: data.location,
            timezone: data.timezone, 
            optimalOutreachTime: data.optimalOutreachTime,
            optimalOutreachTimeEastern: data.optimalOutreachTimeEastern,
            outreachReason: data.outreachReason
          }),
        });
        
        if (!updateResponse.ok) {
          console.error('Warning: Changes saved locally but database update failed');
          toast.warning('Changes saved locally but database update failed');
          // Save to localStorage as a fallback
          saveToLocalStorage(lead.id, {
            location: data.location,
            timezone: data.timezone, 
            optimalOutreachTime: data.optimalOutreachTime,
            optimalOutreachTimeEastern: data.optimalOutreachTimeEastern,
            outreachReason: data.outreachReason
          });
          setIsLocalStorage(true);
        } else {
          toast.success("Lead time zone and optimal outreach time updated.");
        }
      } catch (updateError) {
        console.error('Error updating database:', updateError);
        toast.error("Error saving updates to database.");
        // Save to localStorage as a fallback
        saveToLocalStorage(lead.id, {
          location: data.location,
          timezone: data.timezone, 
          optimalOutreachTime: data.optimalOutreachTime,
          optimalOutreachTimeEastern: data.optimalOutreachTimeEastern,
          outreachReason: data.outreachReason
        });
        setIsLocalStorage(true);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error("Error enriching lead location:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to detect time zone information.");
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const saveToLocalStorage = (leadId: string, data: any) => {
    try {
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingLeadUpdates') || '{}');
      pendingUpdates[leadId] = data;
      localStorage.setItem('pendingLeadUpdates', JSON.stringify(pendingUpdates));
      console.log('Saved lead data to localStorage as fallback');
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };
  
  // Effect to load from localStorage on initial mount if needed
  useEffect(() => {
    // Only attempt load if essential data is missing
    if (lead && lead.id && !lead.location && !lead.timezone) { 
      try {
        const pendingUpdates = JSON.parse(localStorage.getItem('pendingLeadUpdates') || '{}');
        if (pendingUpdates[lead.id]) {
          console.log('Loading enrichment data from localStorage');
          const storedData = pendingUpdates[lead.id];
          const updatedLead: Lead = {
            ...lead,
            ...storedData
          };
          onUpdate(updatedLead);
          setIsLocalStorage(true); // Indicate data came from storage
          // Optionally remove from storage after loading
          // delete pendingUpdates[lead.id];
          // localStorage.setItem('pendingLeadUpdates', JSON.stringify(pendingUpdates));
        }
      } catch (e) {
        console.error("Failed to load from localStorage:", e);
      }
    }
  }, [lead, onUpdate]);

  // Display logic - shows existing or detected data
  const displayLocation = lead.location || 'Not Detected';
  const displayTimezone = lead.timezone || 'Not Detected';
  const isLocationKnown = displayLocation && displayLocation !== 'Unknown Location' && displayLocation !== 'Not Detected';
  
  // Use the Eastern time if available, otherwise use the local, otherwise 'Not Detected'
  const displayOptimalTime = lead.optimalOutreachTimeEastern || lead.optimalOutreachTime || 'Not Detected';
  const displayReason = lead.outreachReason || 'N/A';

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Optimal Outreach Time Detection</h3>
      <div className="space-y-2 mb-4 text-sm">
        {/* Conditionally render Location and Timezone */}
        {isLocationKnown && (
          <>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Location: {displayLocation}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Time Zone: {displayTimezone}</span>
            </div>
          </>
        )}
        {/* Always render Optimal Time */}
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-semibold text-base">Optimal Time (ET): {displayOptimalTime}</span>
        </div>
        {/* Conditionally render local time only if ET time is shown and different */}
        {lead.optimalOutreachTimeEastern && lead.optimalOutreachTime && lead.optimalOutreachTime !== lead.optimalOutreachTimeEastern && (
           <div className="flex items-center pl-6 text-xs text-muted-foreground">
             <span>(Local Time: {lead.optimalOutreachTime})</span>
           </div>
        )}
        <div className="text-xs text-muted-foreground pl-6 pt-1">
          {displayReason}
        </div>
      </div>
      
      {/* Make button more prominent - use default variant */}
      <Button 
        onClick={enrichLeadLocation} 
        disabled={isLoading || !lead?.company} 
        size="sm"
        variant={isLoading || success ? "outline" : "outline"}
        className={`
          ${success ? "border-green-500 text-green-600 hover:bg-green-500/10" : 
            error ? "border-red-500 text-red-600 hover:bg-red-500/10" : 
            "border-input hover:bg-accent hover:text-accent-foreground"
          }
          ${isLoading ? "cursor-not-allowed" : ""}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Detecting...
          </>
        ) : success ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Updated
          </>
        ) : (
          'Detect Time Zone'
        )}
      </Button>
      
      {/* Keep icons for status, but maybe style differently if needed */}
      {/* {success && !isLoading && <CheckCircle className="h-5 w-5 text-green-500 inline-block ml-2" />} */}
      {error && !isLoading && <span title={error}><AlertTriangle className="h-5 w-5 text-red-500 inline-block ml-2" /></span>}
      {isLocalStorage && <span className="text-xs text-amber-600 ml-2">(Using cached data)</span>}
    </div>
  );
};

export default OutreachTimeEnricher; 