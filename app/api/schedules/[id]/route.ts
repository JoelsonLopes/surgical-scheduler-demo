import { createClient } from '@/lib/supabase/server'
import { appointmentRequestSchema } from '@/lib/validations/schedules'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
function convertBirthDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('/')
  return `${year}-${month}-${day}`
}

// GET - Get appointment details with patient info
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        patient:patients(*)
      `
      )
      .eq('id', id)
      .single()

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar agendamento' },
      { status: 500 }
    )
  }
}

// PUT - Update appointment
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  try {
    const { id } = await context.params

    // ============================================
    // 1. AUTHENTICATION - Get authenticated user
    // ============================================
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // ============================================
    // 2. GET EXISTING APPOINTMENT
    // ============================================
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*, patient:patients(*)')
      .eq('id', id)
      .single()

    if (fetchError || !existingAppointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // ============================================
    // 3. AUTHORIZATION - Only doctor who created can edit
    // ============================================
    if (existingAppointment.doctor_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este agendamento' },
        { status: 403 }
      )
    }

    // ============================================
    // 4. CHECK STATUS - Only PENDING can be edited
    // ============================================
    if (existingAppointment.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: 'Apenas agendamentos pendentes podem ser editados',
          status: existingAppointment.status,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 5. VALIDATE REQUEST DATA
    // ============================================
    const body = await request.json()
    const { selectedDate, selectedTime, ...formData } = body

    if (!selectedDate || !selectedTime) {
      return NextResponse.json(
        { error: 'Data e hora do agendamento são obrigatórias.' },
        { status: 400 }
      )
    }

    // Validate form data with Zod schema
    const validatedData = appointmentRequestSchema.parse(formData)

    // ============================================
    // 6. CALCULATE START AND END DATE/TIME
    // ============================================
    const dateOnly =
      typeof selectedDate === 'string' && selectedDate.includes('T')
        ? selectedDate.split('T')[0]
        : selectedDate

    const startDateTime = new Date(`${dateOnly}T${selectedTime}`)

    let endDateTime: Date
    if (
      validatedData.estimatedEndTime &&
      validatedData.estimatedEndTime.trim() !== ''
    ) {
      endDateTime = new Date(`${dateOnly}T${validatedData.estimatedEndTime}`)
    } else {
      endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)
    }

    // ============================================
    // 7. VALIDATE TIME CONSTRAINTS
    // ============================================
    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: 'Hora de término deve ser posterior à hora de início' },
        { status: 400 }
      )
    }

    const durationMinutes =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)
    if (durationMinutes < 30) {
      return NextResponse.json(
        { error: 'Duração mínima de 30 minutos' },
        { status: 400 }
      )
    }

    // ============================================
    // 8. UPDATE PATIENT INFORMATION
    // ============================================
    const { error: patientError } = await supabase
      .from('patients')
      .update({
        name: validatedData.patientName,
        birth_date: convertBirthDate(validatedData.birthDate),
        phone: validatedData.patientPhone,
      })
      .eq('id', existingAppointment.patient_id)

    if (patientError) {
      console.error('Erro ao atualizar paciente:', patientError)
      return NextResponse.json(
        { error: 'Falha ao atualizar informações do paciente' },
        { status: 400 }
      )
    }

    // ============================================
    // 9. UPDATE APPOINTMENT
    // ============================================
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .update({
        procedure: validatedData.procedure,
        start_date_time: startDateTime.toISOString(),
        end_date_time: endDateTime.toISOString(),
        insurance: validatedData.insurance,
        special_needs: validatedData.specialNeeds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        patient:patients(*),
        doctor:users!appointments_doctor_id_fkey(id, name, email, medical_license)
      `
      )
      .single()

    if (appointmentError) {
      console.error('Erro ao atualizar agendamento:', appointmentError)
      return NextResponse.json(
        {
          error: 'Falha ao atualizar agendamento: ' + appointmentError.message,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 10. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        appointment,
        message: 'Agendamento atualizado com sucesso!',
      },
      { status: 200 }
    )
  } catch (error) {
    // ============================================
    // 11. ERROR HANDLING
    // ============================================
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

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

// DELETE - Delete appointment
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  try {
    const { id } = await context.params

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
    // 2. GET EXISTING APPOINTMENT
    // ============================================
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingAppointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // ============================================
    // 3. AUTHORIZATION
    // ============================================
    if (existingAppointment.doctor_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este agendamento' },
        { status: 403 }
      )
    }

    // ============================================
    // 4. CHECK STATUS - Only PENDING can be deleted
    // ============================================
    if (existingAppointment.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: 'Apenas agendamentos pendentes podem ser excluídos',
          status: existingAppointment.status,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 5. DELETE APPOINTMENT
    // ============================================
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao excluir agendamento:', deleteError)
      return NextResponse.json(
        { error: 'Falha ao excluir agendamento' },
        { status: 400 }
      )
    }

    // ============================================
    // 6. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        message: 'Agendamento excluído com sucesso!',
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
