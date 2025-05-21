import { NextRequest, NextResponse } from 'next/server';
import { Lead } from '@/types/lead';
// No top-level prisma import here

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }
    
    // Dynamically import Prisma client inside the handler
    const { default: prisma } = await import('@/lib/prisma');

    // Fetch lead from database
    const lead = await prisma.lead.findUnique({
      where: { id },
    });
    
    // Remove the mock data
    // const lead: Lead | null = { ... }; 

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
} 