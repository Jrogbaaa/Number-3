import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, type } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if it's a LinkedIn URL for type validation
    const isLinkedIn = url.includes('linkedin.com');
    if (type === 'linkedin' && !isLinkedIn) {
      return NextResponse.json({ error: 'Please provide a valid LinkedIn URL' }, { status: 400 });
    }

    console.log(`[API:scrape-website] Scraping ${type} URL: ${url}`);

    // Use Firecrawl to scrape the website
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      return NextResponse.json({ error: 'Firecrawl API key not configured' }, { status: 500 });
    }

    try {
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 2000, // Reduced wait time
          timeout: 45000, // Increased timeout to 45 seconds
        }),
      });

      if (!scrapeResponse.ok) {
        const errorText = await scrapeResponse.text();
        console.error('[API:scrape-website] Firecrawl HTTP error:', errorText);
        
        // Handle specific error cases
        if (scrapeResponse.status === 429) {
          return NextResponse.json({ 
            error: 'Rate limit exceeded. Please try again in a moment.' 
          }, { status: 429 });
        }
        
        return NextResponse.json({ 
          error: 'Failed to scrape website content. Please check the URL and try again.' 
        }, { status: 500 });
      }

      const scrapeData = await scrapeResponse.json();
      console.log('[API:scrape-website] Firecrawl response:', { 
        success: scrapeData.success, 
        hasData: !!scrapeData.data,
        hasMarkdown: !!scrapeData.data?.markdown,
        error: scrapeData.error 
      });
      
      if (!scrapeData.success) {
        console.error('[API:scrape-website] Firecrawl error:', scrapeData.error);
        
        // Handle specific Firecrawl errors
        if (scrapeData.error?.includes('timeout')) {
          return NextResponse.json({ 
            error: 'The website took too long to load. Please try again or use a different URL.' 
          }, { status: 408 });
        }
        
        return NextResponse.json({ 
          error: scrapeData.error || 'Failed to scrape website content' 
        }, { status: 500 });
      }

      if (!scrapeData.data?.markdown) {
        console.error('[API:scrape-website] No content extracted:', scrapeData);
        return NextResponse.json({ 
          error: 'No content could be extracted from the provided URL. The page might be empty or protected.' 
        }, { status: 400 });
      }

      // Extract relevant information from the scraped content
      const content = scrapeData.data.markdown;
      const title = scrapeData.data.metadata?.title || '';
      const description = scrapeData.data.metadata?.description || '';

      // Limit content length to prevent database issues
      const maxContentLength = 10000;
      const truncatedContent = content.length > maxContentLength 
        ? content.substring(0, maxContentLength) + '...' 
        : content;

      const result = {
        url,
        title,
        description,
        content: truncatedContent,
        scrapedAt: new Date().toISOString(),
        type: type || (isLinkedIn ? 'linkedin' : 'website')
      };

      console.log(`[API:scrape-website] Successfully scraped ${result.type}: ${title}`);

      return NextResponse.json({
        success: true,
        data: result
      });

    } catch (fetchError) {
      console.error('[API:scrape-website] Firecrawl fetch error:', fetchError);
      
      // Handle network timeouts and connection errors
      if (fetchError instanceof Error) {
        if (fetchError.message.includes('timeout') || fetchError.message.includes('ETIMEDOUT')) {
          return NextResponse.json({ 
            error: 'The request timed out. Please try again with a different URL or try again later.' 
          }, { status: 408 });
        }
        
        if (fetchError.message.includes('ECONNREFUSED') || fetchError.message.includes('ENOTFOUND')) {
          return NextResponse.json({ 
            error: 'Unable to connect to the scraping service. Please try again later.' 
          }, { status: 503 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to scrape website content. Please check the URL and try again.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[API:scrape-website] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred while scraping the website' 
    }, { status: 500 });
  }
} 