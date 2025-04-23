import { NextRequest, NextResponse } from 'next/server';
import { Lead } from '@/types/lead';
// import prisma from '@/lib/prisma'; // Temporarily comment out Prisma import

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
    
    // Fetch lead from database - Temporarily comment out DB call
    // const lead = await prisma.lead.findUnique({
    //   where: { id },
    // });
    
    // Return mock data instead
    const lead: Lead | null = { 
      id: id, 
      name: "Mock Lead", 
      email: "mock@example.com", 
      company: "Mock Inc.", 
      title: "Mock Title", 
      source: "Website", 
      status: "New", 
      score: 50, 
      value: 1000, 
      created_at: new Date().toISOString(), 
      // Add other necessary fields from your Lead type with default values
    }; 

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