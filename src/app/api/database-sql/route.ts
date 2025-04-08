import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'setup-database.sql');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': 'attachment; filename="setup-database.sql"'
      }
    });
  } catch (error) {
    console.error('Error serving SQL file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
} 