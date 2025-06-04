import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    console.log('=== Database Schema Setup ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found'
      }, { status: 500 })
    }
    
    console.log('Running prisma db push...')
    
    // Prisma DB Push 실행
    const { stdout, stderr } = await execAsync('npx prisma db push --force-reset', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      },
      timeout: 30000 // 30초 타임아웃
    })
    
    console.log('Prisma output:', stdout)
    if (stderr) {
      console.log('Prisma stderr:', stderr)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema synchronized successfully',
      output: stdout,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database setup error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Database schema setup endpoint. Use POST to sync schema to Supabase.',
    status: 'ready'
  })
} 