import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    message: 'BrandOS Demo Server is running!',
    timestamp: new Date().toISOString()
  })
}