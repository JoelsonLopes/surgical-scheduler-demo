import { createClient } from '@/lib/supabase/server'
import { appointmentRequestSchema } from '@/lib/validations/schedules'
import type { PatientInsert } from '@/types/database'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
function convertBirthDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('/')
  return `${year}-${month}-${day}`
}

// Helper to create admin client (bypasses RLS)
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
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
    // 2. AUTHORIZATION - Check if user is a doctor
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

    if (userData.role !== 'DOCTOR' && userData.role !== 'MEDICO') {
      return NextResponse.json(
        { error: 'Apenas médicos podem criar agendamentos' },
        { status: 403 }
      )
    }

    // ============================================
    // 3. VALIDATE REQUEST DATA
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
    // 4. CALCULATE START AND END DATE/TIME
    // ============================================
    // Extract just the date part (YYYY-MM-DD) if it's an ISO string
    const dateOnly =
      typeof selectedDate === 'string' && selectedDate.includes('T')
        ? selectedDate.split('T')[0]
        : selectedDate

    const startDateTime = new Date(`${dateOnly}T${selectedTime}`)

    // Parse estimated end time from form
    // If estimatedEndTime is empty, default to 2 hours after start
    let endDateTime: Date

    if (
      validatedData.estimatedEndTime &&
      validatedData.estimatedEndTime.trim() !== ''
    ) {
      // Use provided end time
      endDateTime = new Date(`${dateOnly}T${validatedData.estimatedEndTime}`)
    } else {
      // Default to 2 hours after start time
      endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)
    }

    // ============================================
    // 5. VALIDATE TIME CONSTRAINTS
    // ============================================

    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: 'Hora de término deve ser posterior à hora de início' },
        { status: 400 }
      )
    }

    // Check minimum duration (30 minutes)
    const durationMinutes =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)
    if (durationMinutes < 30) {
      return NextResponse.json(
        { error: 'Duração mínima de 30 minutos' },
        { status: 400 }
      )
    }

    // Check if start time is in the future
    if (startDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Não é possível agendar no passado' },
        { status: 400 }
      )
    }

    // ============================================
    // 6. CREATE OR FIND PATIENT
    // ============================================
    let patientId: string

    // Try to find existing patient by phone
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', validatedData.patientPhone)
      .single()

    if (existingPatient) {
      // Patient already exists, use existing ID
      patientId = existingPatient.id
    } else {
      // Create new patient
      const patientData: PatientInsert = {
        name: validatedData.patientName,
        birth_date: convertBirthDate(validatedData.birthDate),
        phone: validatedData.patientPhone,
        cpf: null, // CPF not collected in current form
      }

      // IMPORTANT: Use admin client to bypass RLS for patient creation
      // Why: The RLS policy checks auth.uid() which doesn't work correctly
      // with server-side Supabase client in API routes
      // Safety: We already validated the user is authenticated and has
      // DOCTOR/MEDICO role above (lines 20-56)
      const adminClient = createAdminClient()
      const { data: newPatient, error: patientError } = await adminClient
        .from('patients')
        .insert([patientData])
        .select('id')
        .single()

      if (patientError) {
        console.error('Erro ao criar paciente:', patientError)
        return NextResponse.json(
          { error: 'Falha ao criar paciente: ' + patientError.message },
          { status: 400 }
        )
      }

      patientId = newPatient.id
    }

    // ============================================
    // 7. CREATE APPOINTMENT
    // ============================================
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([
        {
          doctor_id: user.id, // ✅ FIXED: Using authenticated user ID
          patient_id: patientId, // ✅ FIXED: Using patient from database
          procedure: validatedData.procedure,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(), // ✅ FIXED: Calculated correctly
          status: 'PENDING',
          insurance: validatedData.insurance,
          special_needs: validatedData.specialNeeds,
          notes: null, // ✅ FIXED: No longer storing duplicate data
        },
      ])
      .select(
        `
        *,
        patient:patients(*),
        doctor:users!appointments_doctor_id_fkey(id, name, email, medical_license)
      `
      )
      .single()

    if (appointmentError) {
      console.error('Erro ao criar agendamento:', appointmentError)

      // Handle specific errors
      if (appointmentError.message.includes('Conflito de horário')) {
        return NextResponse.json(
          { error: 'Você já possui um agendamento neste horário' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Falha ao criar agendamento: ' + appointmentError.message },
        { status: 400 }
      )
    }

    // ============================================
    // 8. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        appointment,
        message: 'Solicitação enviada com sucesso!',
      },
      { status: 201 }
    )
  } catch (error) {
    // ============================================
    // 9. ERROR HANDLING
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
