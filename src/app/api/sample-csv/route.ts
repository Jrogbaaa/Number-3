import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'sample-leads.csv');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="sample-leads.csv"'
      }
    });
  } catch (error) {
    console.error('Error serving sample CSV file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
} 