import { NextRequest, NextResponse } from 'next/server';
import { HeygenClient } from '@/lib/heygen';

// TODO: Replace with a valid Heygen Avatar ID
const DEFAULT_AVATAR_ID = 'YourDefaultHeygenAvatarId'; 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { script, avatarId } = body;

    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 });
    }

    const targetAvatarId = avatarId || DEFAULT_AVATAR_ID;

    // Ensure HEYGEN_API_KEY is configured
    if (!process.env.HEYGEN_API_KEY) {
      console.error('HEYGEN_API_KEY is not configured in .env.local');
      return NextResponse.json({ error: 'Heygen API key is not configured.' }, { status: 500 });
    }
    
    console.log(`Requesting Heygen video with avatar: ${targetAvatarId}`);
    const heygenResponse = await HeygenClient.createVideo(script, targetAvatarId);

    // Log the full response from Heygen for debugging
    console.log('Heygen API Response:', heygenResponse);

    // The response structure from Heygen might vary. 
    // Typically, it might include a video_id or data.video_id if successful,
    // or an error object.
    // If successful, it often means the video generation has started, not completed.
    // You might get a video_id to check status later, or a direct (but possibly not yet ready) URL.

    if (heygenResponse.error) {
        console.error('Heygen API returned an error:', heygenResponse.error);
        return NextResponse.json({ error: 'Heygen API error', details: heygenResponse.error }, { status: 500 });
    }

    // Assuming heygenResponse contains { data: { video_id: 'some_id' } } or similar on success
    // Or directly { video_id: 'some_id' }
    // Or it might return other details like a direct link or job status.
    // Adapt based on actual Heygen API v1 video creation response structure.
    
    // Let's assume for now it returns something like this structure:
    // { "code": 0, "message": "Success", "data": { "video_id": "xxxx" } }
    // Or if it's an older API version it might return video_url more directly, or a task_id

    if (heygenResponse.data && heygenResponse.data.video_id) {
      return NextResponse.json({ 
        message: 'Video generation started successfully', 
        videoId: heygenResponse.data.video_id,
        heygenRawResponse: heygenResponse // For frontend to inspect if needed
      });
    } else if (heygenResponse.video_id) { // Fallback for a flatter response
       return NextResponse.json({ 
        message: 'Video generation started successfully', 
        videoId: heygenResponse.video_id,
        heygenRawResponse: heygenResponse
      });
    }

    // If the structure is different, we might need to adjust.
    // For now, we return the whole response if the structure isn't as expected.
    console.warn('Heygen response structure not fully recognized for video_id extraction:', heygenResponse);
    return NextResponse.json({ 
      message: 'Heygen request processed, but video_id not found in expected location.', 
      heygenRawResponse: heygenResponse 
    });

  } catch (error) {
    console.error('Error in /api/create-heygen-video:', error);
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 