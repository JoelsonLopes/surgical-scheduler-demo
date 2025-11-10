import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GET - List All Appointments (Admin Only)
// ============================================

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // ============================================
    // 2. AUTHORIZATION - Check if user is admin
    // ============================================
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Erro ao verificar permissões do usuário' },
        { status: 500 }
      )
    }

    if (userData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    // ============================================
    // 3. PARSE QUERY PARAMETERS (FILTERS)
    // ============================================
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const doctorId = searchParams.get('doctorId')
    const patientSearch = searchParams.get('patientSearch')

    // ============================================
    // 4. BUILD QUERY WITH FILTERS
    // ============================================
    let query = supabase
      .from('appointments')
      .select(
        `
        *,
        patient:patients!appointments_patient_id_fkey(id, name, birth_date, phone, cpf),
        doctor:users!appointments_doctor_id_fkey(id, name, email)
      `
      )
      .order('start_date_time', { ascending: false })

    // Apply status filter
    if (status && status !== 'ALL') {
      query = query.eq('status', status)
    }

    // Apply date range filters
    if (dateFrom) {
      query = query.gte('start_date_time', `${dateFrom}T00:00:00`)
    }
    if (dateTo) {
      query = query.lte('start_date_time', `${dateTo}T23:59:59`)
    }

    // Apply doctor filter
    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    // ============================================
    // 5. EXECUTE QUERY
    // ============================================
    const { data: appointments, error: appointmentsError } = await query

    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos:', appointmentsError)
      return NextResponse.json(
        {
          error: 'Falha ao buscar agendamentos: ' + appointmentsError.message,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 6. FILTER BY PATIENT NAME (CLIENT-SIDE)
    // ============================================
    let filteredAppointments = appointments || []

    if (patientSearch && patientSearch.trim()) {
      const searchLower = patientSearch.toLowerCase()
      filteredAppointments = filteredAppointments.filter((apt) => {
        const patientName = (apt.patient as { name?: string })?.name || ''
        return patientName.toLowerCase().includes(searchLower)
      })
    }

    // ============================================
    // 7. FETCH DOCUMENTS FOR EACH APPOINTMENT
    // ============================================
    const appointmentsWithDocuments = await Promise.all(
      filteredAppointments.map(async (appointment) => {
        const { data: documents } = await supabase
          .from('appointment_documents')
          .select('*')
          .eq('appointment_id', appointment.id)

        return {
          ...appointment,
          documents: documents || [],
        }
      })
    )

    // ============================================
    // 8. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        appointments: appointmentsWithDocuments,
        count: appointmentsWithDocuments.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
