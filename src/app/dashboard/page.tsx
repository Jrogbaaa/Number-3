'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';
import ContentCalendar from '@/components/ContentCalendar';
import LeadsTable from '@/components/LeadsTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LeadScoreDistribution from '@/components/dashboard/LeadScoreDistribution';
import HighValueLeadsTable from '@/components/dashboard/HighValueLeadsTable';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Michael Wong',
      email: 'michael@bigcorp.com',
      score: 67,
      source: 'Referral',
      status: 'Converted',
      value: 25000,
      createdAt: '2024-04-01',
    },
    // Add other leads from the screenshot
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Lead Dashboard</h1>
          <div className="text-gray-400">10 leads analyzed</div>
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">Lead Scoring</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeadScoreDistribution />
            <div>
              <h3 className="text-lg font-medium mb-3">High-Value Leads</h3>
              <HighValueLeadsTable />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">All Leads by Score</h2>
          <LeadsTable leads={leads} />
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">Content Calendar</h2>
          <ContentCalendar />
        </div>
      </div>
    </DashboardLayout>
  );
} 