'use client';

import { useState } from 'react';
import { OutreachTimeEnricher } from '@/components/OutreachTimeEnricher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';

export default function OutreachDemo() {
  const [leadId, setLeadId] = useState('demo-lead-123');
  const [companyName, setCompanyName] = useState('');
  const [locationData, setLocationData] = useState({
    location: '',
    timezone: '',
    optimalOutreachTime: '',
    outreachReason: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset any existing data
    setLocationData({
      location: '',
      timezone: '',
      optimalOutreachTime: '',
      outreachReason: '',
    });
  };

  const handleUpdate = (data: {
    location: string;
    timezone: string;
    optimalOutreachTime: string;
    outreachReason: string;
  }) => {
    setLocationData(data);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Outreach Time Optimizer Demo</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Enter a company name to find the optimal outreach time based on their location.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Enter Company Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2">
                  Company Name
                </label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={!companyName}>
                Reset Data
              </Button>
            </form>
          </div>

          {locationData.location && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p className="text-lg">{locationData.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Time Zone</h3>
                  <p className="text-lg">{locationData.timezone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Best Time to Contact</h3>
                  <p className="text-lg font-medium">{locationData.optimalOutreachTime}</p>
                  <p className="text-sm text-muted-foreground mt-1">{locationData.outreachReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <OutreachTimeEnricher
          leadId={leadId}
          companyName={companyName}
          initialLocation={locationData.location}
          initialTimezone={locationData.timezone}
          initialOutreachTime={locationData.optimalOutreachTime}
          onUpdate={handleUpdate}
        />
      </div>
      
      <Toaster />
    </div>
  );
} 