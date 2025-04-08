'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ScriptGenerator from '@/components/outreach/ScriptGenerator';
import ContentCalendar from '@/components/outreach/ContentCalendar';

export default function OutreachPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Lead Outreach</h1>
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">Script Generator</h2>
          <ScriptGenerator />
        </div>

        <div className="card">
          <ContentCalendar />
        </div>
      </div>
    </DashboardLayout>
  );
} 