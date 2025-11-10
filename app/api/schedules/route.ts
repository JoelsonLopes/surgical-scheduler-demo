import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await createClient()

    let query = supabase
      .from('appointments')
      .select('*')
      .order('start_date_time', { ascending: true })
      .limit(limit)

    // Filtro por data específica (um dia)
    if (date) {
      const startOfDay = `${date}T00:00:00Z`
      const endOfDay = `${date}T23:59:59Z`

      query = query
        .gte('start_date_time', startOfDay)
        .lte('start_date_time', endOfDay)
    }
    // Filtro por período (startDate e endDate)
    else if (startDate && endDate) {
      const start = `${startDate}T00:00:00Z`
      const end = `${endDate}T23:59:59Z`

      query = query.gte('start_date_time', start).lte('start_date_time', end)
    }
    // Nenhum filtro fornecido
    else {
      return NextResponse.json(
        { error: 'Date or date range (startDate and endDate) is required' },
        { status: 400 }
      )
    }

    const { data: appointments, error } = await query

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ appointments: appointments || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
