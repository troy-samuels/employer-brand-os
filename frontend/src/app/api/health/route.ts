import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    message: 'Rankwell API server is running',
    timestamp: new Date().toISOString()
  })
}