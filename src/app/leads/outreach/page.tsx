'use client';

import { useState, useEffect } from 'react';
import { getLeads } from '@/lib/supabase';
import { MessageGenerator } from '@/components/shared/MessageGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import type { Lead } from '@/types/lead';

export default function OutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const fetchedLeads = await getLeads();
        setLeads(fetchedLeads);
        setFilteredLeads(fetchedLeads);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load leads. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // Filter leads based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLeads(leads);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = leads.filter(lead => 
      lead.name.toLowerCase().includes(query) || 
      (lead.company && lead.company.toLowerCase().includes(query)) ||
      (lead.email && lead.email.toLowerCase().includes(query))
    );
    
    setFilteredLeads(filtered);
  }, [searchQuery, leads]);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLeadId(lead.id);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-blue-400">Loading leads...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/leads" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Leads
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">AI Outreach Message Generator</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Use AI to generate personalized outreach messages for your leads. Select a lead from the list,
          customize your message using prompts, and copy the result to use in your outreach campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead selection panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select a Lead</h2>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search leads..."
                className="pl-9 bg-gray-800 border-gray-700"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leads found matching your search.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {filteredLeads.map(lead => (
                <button
                  key={lead.id}
                  className={`w-full text-left p-3 rounded-md transition-colors
                    ${selectedLeadId === lead.id 
                      ? 'bg-blue-600/20 border border-blue-600/30' 
                      : 'bg-gray-800 border border-gray-700 hover:bg-gray-800/70'}`}
                  onClick={() => handleLeadSelect(lead)}
                >
                  <div className="font-medium">{lead.name}</div>
                  {lead.company && (
                    <div className="text-sm text-gray-400">{lead.company}</div>
                  )}
                  {lead.email && (
                    <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Message generator panel */}
        <div className="lg:col-span-2">
          {selectedLeadId ? (
            <MessageGenerator 
              leads={leads} 
              selectedLeadId={selectedLeadId}
              onMessageGenerated={(message, leadId) => {
                console.log(`Generated message for lead ${leadId}`);
                // You could save the message to a database or state here
              }}
            />
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-10 flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 mb-4">👈 Select a lead to generate a personalized message</div>
              <p className="text-gray-500 text-sm max-w-md">
                Choose a lead from the list to start creating AI-powered outreach messages tailored to their profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 