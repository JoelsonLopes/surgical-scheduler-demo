import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================
// TYPES
// ============================================

interface TimeSlot {
  time_slot: string
  is_available: boolean
}

// ============================================
// VALIDATION SCHEMA
// ============================================

const availableSlotsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  doctorId: z.string().uuid('ID do médico inválido').optional(),
  startHour: z.number().int().min(0).max(23).optional().default(7),
  endHour: z.number().int().min(0).max(23).optional().default(14),
  slotDuration: z.number().int().min(15).max(240).optional().default(30),
})

// ============================================
// POST - Get available time slots for a date
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
    const validatedData = availableSlotsSchema.parse(body)

    // Use provided doctorId or default to authenticated user
    const doctorId = validatedData.doctorId || user.id

    // Validate hour range
    if (validatedData.endHour <= validatedData.startHour) {
      return NextResponse.json(
        { error: 'Hora de término deve ser posterior à hora de início' },
        { status: 400 }
      )
    }

    // ============================================
    // 3. CALL DATABASE FUNCTION
    // ============================================
    const { data: slots, error: slotsError } = await supabase.rpc(
      'get_available_time_slots',
      {
        p_doctor_id: doctorId,
        p_date: validatedData.date,
        p_start_hour: validatedData.startHour,
        p_end_hour: validatedData.endHour,
        p_slot_duration: validatedData.slotDuration,
      }
    )

    if (slotsError) {
      console.error('Erro ao buscar slots disponíveis:', slotsError)
      return NextResponse.json(
        {
          error: 'Falha ao buscar horários disponíveis: ' + slotsError.message,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 4. FILTER OUT PAST SLOTS (if date is today)
    // ============================================
    const requestDate = new Date(validatedData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let filteredSlots: TimeSlot[] = slots || []

    // If the requested date is today, filter out past time slots
    if (requestDate.getTime() === today.getTime()) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      filteredSlots = filteredSlots.filter((slot: TimeSlot) => {
        const [hour, minute] = slot.time_slot.split(':').map(Number)
        return (
          hour > currentHour || (hour === currentHour && minute > currentMinute)
        )
      })
    }

    // ============================================
    // 5. FORMAT RESPONSE WITH STATISTICS
    // ============================================
    const totalSlots = filteredSlots.length
    const availableSlots = filteredSlots.filter(
      (slot: TimeSlot) => slot.is_available
    ).length
    const occupiedSlots = totalSlots - availableSlots

    return NextResponse.json(
      {
        slots: filteredSlots,
        statistics: {
          total: totalSlots,
          available: availableSlots,
          occupied: occupiedSlots,
          occupancyRate:
            totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
        },
        config: {
          date: validatedData.date,
          startHour: validatedData.startHour,
          endHour: validatedData.endHour,
          slotDuration: validatedData.slotDuration,
        },
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
