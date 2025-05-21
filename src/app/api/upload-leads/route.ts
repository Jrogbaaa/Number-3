import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { Lead, LeadStatus, LeadSource } from '@/types/lead';

export async function POST(request: Request) {
  try {
    // Create a Supabase client with the service role key (server-side only)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials',
        credentialsPresent: {
          supabaseUrl: !!supabaseUrl,
          serviceRoleKey: !!serviceRoleKey
        }
      }, { status: 500 });
    }
    
    // Get the leads from the request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { leads } = requestBody;
    
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 });
    }

    console.log(`API: Uploading ${leads.length} leads to Supabase`);
    
    // Initialize the client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Process in batches to handle files of any size
    const batchSize = 20;
    const errors: any[] = [];
    let processedCount = 0;
    let successCount = 0;
    let duplicateCount = 0;
    
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      processedCount += batch.length;
      console.log(`API: Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(leads.length/batchSize)} (${processedCount}/${leads.length})`);
      
      try {
        // Prepare leads data with required fields and proper types
        const preparedLeads = batch.map((lead: Lead) => {
          // Basic preparation without enrichment for now
          const leadToUpsert: Record<string, any> = {
            ...lead,
            id: lead.id || uuidv4(), // Use existing ID or generate new
            name: (lead.name || 'Unknown Contact').trim(),
            email: (lead.email || `lead_${Date.now()}_${Math.random().toString(36).slice(2)}@placeholder.com`).trim().toLowerCase(),
            company: (lead.company || '').trim(),
            title: (lead.title || '').trim(),
            source: (lead.source || 'Other').trim() as LeadSource,
            status: (lead.status || 'New').trim() as LeadStatus,
            created_at: lead.created_at || new Date().toISOString(),
            score: typeof lead.score === 'number' ? lead.score : 0,
            value: typeof lead.value === 'number' ? lead.value : 0,
            insights: lead.insights ? (typeof lead.insights === 'string' ? lead.insights : JSON.stringify(lead.insights)) : null,
          };

          // Trim linkedinUrl if it exists
          if (lead.linkedinUrl) {
            leadToUpsert.linkedinUrl = lead.linkedinUrl.trim();
          }

          // Remove undefined properties
          Object.keys(leadToUpsert).forEach(key => {
            if (leadToUpsert[key] === undefined) {
              delete leadToUpsert[key];
            }
          });

          return leadToUpsert;
        });

        // De-duplicate within the batch based on email
        const uniqueLeadsMap = new Map<string, Record<string, any>>();
        preparedLeads.forEach(lead => {
          const emailKey = lead.email?.toLowerCase();
          if (emailKey) {
            uniqueLeadsMap.set(emailKey, lead);
          } else {
            const uniqueKey = lead.id || `no-email-${uuidv4()}`;
            uniqueLeadsMap.set(uniqueKey, lead);
          }
        });
        
        const uniquePreparedLeads = Array.from(uniqueLeadsMap.values());
        const duplicatesRemovedInBatch = preparedLeads.length - uniquePreparedLeads.length;
        
        if (duplicatesRemovedInBatch > 0) {
          console.log(`API: Batch ${Math.floor(i/batchSize) + 1} pre-upsert: Removed ${duplicatesRemovedInBatch} duplicate emails within the batch.`);
          duplicateCount += duplicatesRemovedInBatch;
        }

        // Upsert the de-duplicated batch
        const { data: upsertData, error: upsertError, count: upsertCount } = await supabase
          .from('leads')
          .upsert(uniquePreparedLeads, {
            onConflict: 'email',
            ignoreDuplicates: false,
            count: 'exact'
          })
          .select('id, email');

        if (upsertError) {
          console.error(`API: Error upserting batch ${Math.floor(i/batchSize) + 1}:`, upsertError);
          errors.push(upsertError);
        } else {
          const upsertedCount = upsertData?.length || 0;
          const dbConflictCount = uniquePreparedLeads.length - upsertedCount;
          
          successCount += upsertedCount;
          duplicateCount += dbConflictCount;
          
          console.log(`API: Batch ${Math.floor(i/batchSize) + 1} results: ${upsertedCount} rows upserted. ${dbConflictCount} conflicts with existing rows.`);
        }
      } catch (batchError: any) {
        console.error('API: Batch processing error:', batchError);
        errors.push(batchError);
      }
    }

    // Return the results
    return NextResponse.json({
      success: successCount > 0 || errors.length === 0,
      count: leads.length,
      successCount,
      duplicateCount,
      errorsCount: errors.length,
      errors: errors.length > 0 ? errors.map(e => e.message || String(e)).slice(0, 5) : undefined
    });
  } catch (error) {
    console.error('API: Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to upload leads: ${errorMessage}`,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 