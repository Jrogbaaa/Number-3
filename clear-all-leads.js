// One-time script to delete all leads from Supabase
// This uses the service role key which has admin privileges

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

async function clearAllLeads() {
  console.log('Starting emergency deletion of all leads...');
  
  try {
    // First, set up the request with admin-level service role key
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal' // Don't need the data back
    };

    // Method 1: Try to delete all leads in one query
    console.log('Attempting direct deletion of all leads...');
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?id=neq.${encodeURIComponent('')}`,
      {
        method: 'DELETE',
        headers
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error(`Direct deletion failed: ${deleteResponse.status} - ${errorText}`);
      
      // Method 2: If direct deletion fails, try to get all IDs and delete in batches
      console.log('Falling back to batch deletion...');
      
      // Get all lead IDs
      const getIdsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/leads?select=id`,
        {
          method: 'GET',
          headers
        }
      );
      
      if (!getIdsResponse.ok) {
        throw new Error(`Failed to fetch lead IDs: ${await getIdsResponse.text()}`);
      }
      
      const leadIds = await getIdsResponse.json();
      
      if (!leadIds.length) {
        console.log('No leads found to delete.');
        return;
      }
      
      console.log(`Found ${leadIds.length} leads to delete in batches.`);
      
      // Delete in batches of 10
      const batchSize = 10;
      let successCount = 0;
      
      for (let i = 0; i < leadIds.length; i += batchSize) {
        const batch = leadIds.slice(i, i + batchSize);
        const idsToDelete = batch.map(item => item.id);
        const idListParam = idsToDelete.map(id => `id=eq.${encodeURIComponent(id)}`).join(',');
        
        const batchDeleteResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/leads?${idListParam}`,
          {
            method: 'DELETE',
            headers
          }
        );
        
        if (batchDeleteResponse.ok) {
          successCount += batch.length;
          console.log(`Deleted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(leadIds.length/batchSize)} (${successCount}/${leadIds.length})`);
        } else {
          console.error(`Error deleting batch: ${await batchDeleteResponse.text()}`);
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`Deleted ${successCount} out of ${leadIds.length} leads.`);
    } else {
      console.log('All leads deleted successfully via direct deletion!');
    }
    
    // Final verification
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?select=count`,
      {
        method: 'HEAD',
        headers: {
          ...headers,
          'Prefer': 'count=exact'
        }
      }
    );
    
    const count = verifyResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
    console.log(`Verification: ${count} leads remaining.`);
    
  } catch (error) {
    console.error('Error clearing leads:', error);
  }
}

clearAllLeads(); 