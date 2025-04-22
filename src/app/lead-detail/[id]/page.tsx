'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, Building2, Mail, Phone, Tag, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { Lead } from '@/types/lead';
import { OutreachTimeEnricher } from '@/components/OutreachTimeEnricher';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

export default function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLead() {
      try {
        // Fetch lead data
        const response = await fetch(`/api/leads/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch lead: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLead(data.lead);
      } catch (err) {
        console.error("Error fetching lead:", err);
        setError(err instanceof Error ? err.message : "Failed to load lead details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchLead();
    }
  }, [id]);

  const handleLeadUpdate = (data: any) => {
    if (lead) {
      setLead({
        ...lead,
        location: data.location,
        timezone: data.timezone,
        optimalOutreachTime: data.optimalOutreachTime,
        outreachReason: data.outreachReason,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-primary/10 rounded-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-primary/10 rounded-md"></div>
            <div className="h-64 bg-primary/10 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-medium">Error</h2>
          <p>{error || "Lead not found"}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            asChild
          >
            <Link href="/leads">Back to Leads</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="mb-4"
          asChild
        >
          <Link href="/leads" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <p className="text-muted-foreground">{lead.title} at {lead.company}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Lead Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-muted-foreground">{lead.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Company</p>
                  <p className="text-muted-foreground">{lead.company}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{lead.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{lead.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                      lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                      lead.status === 'Lost' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {lead.last_contacted_at && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Last Contacted</p>
                    <p className="text-muted-foreground">
                      {new Date(lead.last_contacted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {lead.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{lead.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <OutreachTimeEnricher
          leadId={lead.id}
          companyName={lead.company}
          initialLocation={lead.location || ""}
          initialTimezone={lead.timezone || ""}
          initialOutreachTime={lead.optimalOutreachTime || ""}
          onUpdate={handleLeadUpdate}
        />
      </div>
      
      <Toaster />
    </div>
  );
} 