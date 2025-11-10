import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// GET - Get Single Appointment with Details (Admin Only)
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    // 3. GET APPOINTMENT ID FROM PARAMS
    // ============================================
    const { id: appointmentId } = await params

    // ============================================
    // 4. FETCH APPOINTMENT WITH DETAILS
    // ============================================
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // ============================================
    // 5. FETCH PATIENT DATA
    // ============================================
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', appointment.patient_id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Dados do paciente não encontrados' },
        { status: 404 }
      )
    }

    // ============================================
    // 6. FETCH DOCTOR DATA
    // ============================================
    const { data: doctor, error: doctorError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', appointment.doctor_id)
      .single()

    if (doctorError || !doctor) {
      return NextResponse.json(
        { error: 'Dados do médico não encontrados' },
        { status: 404 }
      )
    }

    // ============================================
    // 7. FETCH DOCUMENTS
    // ============================================
    const { data: documents, error: documentsError } = await supabase
      .from('appointment_documents')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (documentsError) {
      console.error('Error fetching documents:', documentsError)
    }

    // ============================================
    // 8. BUILD RESPONSE
    // ============================================
    const appointmentWithDetails = {
      ...appointment,
      patient,
      doctor,
      documents: documents || [],
    }

    // ============================================
    // 9. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        appointment: appointmentWithDetails,
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
