import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ============================================
// GET - Get All Doctors (DOCTOR or MEDICO roles)
// ============================================

export async function GET() {
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
    // 2. FETCH DOCTORS (both DOCTOR and MEDICO)
    // ============================================
    const { data: doctors, error: fetchError } = await supabase
      .from('users')
      .select('id, name, role, email')
      .in('role', ['DOCTOR', 'MEDICO'])
      .eq('is_active', true)
      .eq('is_blocked', false)
      .order('name')

    if (fetchError) {
      console.error('Erro ao buscar médicos:', fetchError)
      return NextResponse.json(
        { error: 'Erro ao buscar médicos' },
        { status: 500 }
      )
    }

    // ============================================
    // 3. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        doctors: doctors || [],
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
