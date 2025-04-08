import DashboardLayout from '@/components/layout/DashboardLayout';
import HeygenTools from '@/components/heygen/HeygenTools';
import PodcastScriptGenerator from '@/components/heygen/PodcastScriptGenerator';

export default function HeygenIntegrationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Heygen Integration</h1>
          <div className="text-blue-300">Using data from 10 leads</div>
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">Heygen Tools</h2>
          <HeygenTools />
        </div>

        <div className="card">
          <h2 className="text-xl font-medium mb-4">Podcast Script Generator</h2>
          <PodcastScriptGenerator />
        </div>
      </div>
    </DashboardLayout>
  );
} 