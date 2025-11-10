import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// POST - Batch Fetch Patients by IDs
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
    // 2. AUTHORIZATION - Check user role
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

    // Only doctors and admins can view patients
    if (
      userData.role !== 'DOCTOR' &&
      userData.role !== 'MEDICO' &&
      userData.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar pacientes' },
        { status: 403 }
      )
    }

    // ============================================
    // 3. PARSE REQUEST BODY
    // ============================================
    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs de pacientes são obrigatórios' },
        { status: 400 }
      )
    }

    // Limit to 100 IDs per request to prevent abuse
    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Máximo de 100 IDs por requisição' },
        { status: 400 }
      )
    }

    // ============================================
    // 4. FETCH PATIENTS IN BATCH
    // ============================================
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .in('id', ids)

    if (patientsError) {
      console.error('Erro ao buscar pacientes:', patientsError)
      return NextResponse.json(
        { error: 'Falha ao buscar pacientes: ' + patientsError.message },
        { status: 400 }
      )
    }

    // ============================================
    // 5. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        patients: patients || [],
        count: patients?.length || 0,
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
