import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// PATCH - Update Appointment Status (Admin Only)
// ============================================

export async function PATCH(
  request: NextRequest,
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
    // 4. PARSE REQUEST BODY
    // ============================================
    const body = await request.json()
    const { status, notes } = body as {
      status: 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'CONCLUIDO'
      notes?: string
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      )
    }

    const validStatuses = ['CONFIRMADO', 'REJEITADO', 'CANCELADO', 'CONCLUIDO']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    // ============================================
    // 5. GET CURRENT APPOINTMENT
    // ============================================
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // ============================================
    // 6. UPDATE APPOINTMENT STATUS
    // ============================================
    const updateData: {
      status: string
      updated_at: string
      approved_by?: string
      approved_at?: string
      rejection_reason?: string
    } = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Se está aprovando ou rejeitando, adicionar approved_by e approved_at
    if (status === 'CONFIRMADO' || status === 'REJEITADO') {
      updateData.approved_by = user.id
      updateData.approved_at = new Date().toISOString()
    }

    // Se está rejeitando, adicionar motivo (usar notes se fornecido, senão usar padrão)
    if (status === 'REJEITADO') {
      updateData.rejection_reason =
        notes || 'Rejeitado pelo administrador sem motivo especificado'
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
      return NextResponse.json(
        { error: 'Falha ao atualizar status: ' + updateError.message },
        { status: 400 }
      )
    }

    // ============================================
    // 7. CREATE HISTORY RECORD
    // ============================================
    const action =
      status === 'CONFIRMADO'
        ? 'STATUS_CHANGED'
        : status === 'REJEITADO'
          ? 'STATUS_CHANGED'
          : status === 'CANCELADO'
            ? 'CANCELLED'
            : 'COMPLETED'

    await supabase.from('appointment_history').insert([
      {
        appointment_id: appointmentId,
        changed_by: user.id,
        action,
        old_status: appointment.status,
        new_status: status,
        notes: notes || `Status alterado para ${status} pelo administrador`,
      },
    ])

    // ============================================
    // 8. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        appointment: updatedAppointment,
        message: `Status atualizado para ${status}`,
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
