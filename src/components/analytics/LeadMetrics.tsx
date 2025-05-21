import { useState, useEffect } from 'react';
import { getLeads } from '@/lib/supabase';
import { Lead } from '@/types/lead';

export default function LeadMetrics() {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    averageScore: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        setLoading(true);
        const leads = await getLeads();
        
        if (leads.length === 0) {
          setLoading(false);
          return;
        }
        
        // Calculate total leads
        const totalLeads = leads.length;
        
        // Calculate average score
        const totalScore = leads.reduce((sum, lead) => sum + lead.score, 0);
        const averageScore = Math.round(totalScore / totalLeads);
        
        // Calculate qualified leads
        const qualifiedLeads = leads.filter(
          lead => lead.status === 'Qualified' || lead.status === 'Converted'
        ).length;
        
        // Calculate conversion rate (Converted leads / Total leads)
        const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
        const conversionRate = Math.round((convertedLeads / totalLeads) * 100);
        
        setMetrics({
          totalLeads,
          averageScore,
          qualifiedLeads,
          conversionRate,
        });
      } catch (error) {
        console.error('Error calculating lead metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    calculateMetrics();
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse h-24"></div>
        ))
      ) : (
        <>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total Leads</div>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Average Score</div>
            <div className="text-2xl font-bold">{metrics.averageScore}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Qualified Leads</div>
            <div className="text-2xl font-bold">{metrics.qualifiedLeads}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
          </div>
        </>
      )}
    </div>
  );
} 