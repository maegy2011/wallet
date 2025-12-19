import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET all settings
export async function GET() {
  try {
    const settings = await db.settings.findMany()
    const settingsObj = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
    
    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const setting = await db.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}