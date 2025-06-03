import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateMediaFeatures from '@/components/heygen/CreateMediaFeatures';

export default function CreateMediaPage() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Create Media</h1>
          <p className="text-gray-400 text-lg">
            Generate professional content with AI-powered tools for podcasts, videos, and scripts
          </p>
        </div>

        <CreateMediaFeatures />
      </div>
    </DashboardLayout>
  );
} 