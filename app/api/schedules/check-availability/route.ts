import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMA
// ============================================

const checkAvailabilitySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Hora de início deve estar no formato HH:MM'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Hora de término deve estar no formato HH:MM'),
  doctorId: z.string().uuid('ID do médico inválido').optional(),
})

// ============================================
// POST - Check if time slot is available
// ============================================

export async function POST(request: NextRequest) {
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
    // 2. VALIDATE REQUEST BODY
    // ============================================
    const body = await request.json()
    const validatedData = checkAvailabilitySchema.parse(body)

    // Use provided doctorId or default to authenticated user
    const doctorId = validatedData.doctorId || user.id

    // ============================================
    // 3. CALCULATE DATETIME RANGE
    // ============================================
    const startDateTime = new Date(
      `${validatedData.date}T${validatedData.startTime}:00`
    )
    const endDateTime = new Date(
      `${validatedData.date}T${validatedData.endTime}:00`
    )

    // Validate time range
    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: 'Hora de término deve ser posterior à hora de início' },
        { status: 400 }
      )
    }

    // Check if start time is in the past
    if (startDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Não é possível verificar disponibilidade no passado' },
        { status: 400 }
      )
    }

    // ============================================
    // 4. CHECK FOR CONFLICTS
    // ============================================
    const { data: conflicts, error: conflictsError } = await supabase
      .from('appointments')
      .select('id, start_date_time, end_date_time, procedure, status')
      .eq('doctor_id', doctorId)
      .not('status', 'in', '(CANCELADO,REJEITADO)')
      .or(
        `and(start_date_time.lte.${startDateTime.toISOString()},end_date_time.gt.${startDateTime.toISOString()}),` +
          `and(start_date_time.lt.${endDateTime.toISOString()},end_date_time.gte.${endDateTime.toISOString()}),` +
          `and(start_date_time.gte.${startDateTime.toISOString()},end_date_time.lte.${endDateTime.toISOString()})`
      )

    if (conflictsError) {
      console.error('Erro ao verificar conflitos:', conflictsError)
      return NextResponse.json(
        {
          error:
            'Falha ao verificar disponibilidade: ' + conflictsError.message,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 5. FORMAT RESPONSE
    // ============================================
    const available = !conflicts || conflicts.length === 0

    const formattedConflicts = (conflicts || []).map((conflict) => ({
      start: new Date(conflict.start_date_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      end: new Date(conflict.end_date_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      procedure: conflict.procedure,
      status: conflict.status,
    }))

    return NextResponse.json(
      {
        available,
        conflicts: formattedConflicts,
        message: available
          ? 'Horário disponível'
          : `Conflito encontrado: ${formattedConflicts.length} agendamento(s) neste período`,
      },
      { status: 200 }
    )
  } catch (error) {
    // ============================================
    // 6. ERROR HANDLING
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
