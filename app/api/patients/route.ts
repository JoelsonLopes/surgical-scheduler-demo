import { createClient } from '@/lib/supabase/server'
import type { PatientInsert } from '@/types/database'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================
// VALIDATION SCHEMA
// ============================================

const patientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\) \d{5}-\d{4}$/,
      'Telefone deve estar no formato (XX) XXXXX-XXXX'
    ),
  cpf: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      'CPF deve estar no formato XXX.XXX.XXX-XX'
    )
    .nullable()
    .optional(),
})

// ============================================
// GET - List or Search Patients
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
    // 3. PARSE QUERY PARAMETERS
    // ============================================
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const search = searchParams.get('search')
    const phone = searchParams.get('phone')
    const cpf = searchParams.get('cpf')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // ============================================
    // 4. BUILD QUERY
    // ============================================
    let query = supabase.from('patients').select('*', { count: 'exact' })

    // Apply filters
    if (id) {
      query = query.eq('id', id)
    } else if (phone) {
      query = query.eq('phone', phone)
    } else if (cpf) {
      query = query.eq('cpf', cpf)
    } else if (search) {
      // Search by name (case-insensitive)
      query = query.ilike('name', `%${search}%`)
    }

    // For doctors, only show their patients (via RLS)
    // For admins, show all patients (via RLS)

    // Apply pagination
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    // ============================================
    // 5. EXECUTE QUERY
    // ============================================
    const { data: patients, error: patientsError, count } = await query

    if (patientsError) {
      console.error('Erro ao buscar pacientes:', patientsError)
      return NextResponse.json(
        { error: 'Falha ao buscar pacientes: ' + patientsError.message },
        { status: 400 }
      )
    }

    // ============================================
    // 6. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        patients: patients || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
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

// ============================================
// POST - Create New Patient
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

    // Only doctors and admins can create patients
    if (
      userData.role !== 'DOCTOR' &&
      userData.role !== 'MEDICO' &&
      userData.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para criar pacientes' },
        { status: 403 }
      )
    }

    // ============================================
    // 3. VALIDATE REQUEST BODY
    // ============================================
    const body = await request.json()
    const validatedData = patientSchema.parse(body)

    // ============================================
    // 4. CHECK FOR EXISTING PATIENT
    // ============================================
    // Check by phone (primary identifier)
    const { data: existingByPhone } = await supabase
      .from('patients')
      .select('id, name, phone')
      .eq('phone', validatedData.phone)
      .single()

    if (existingByPhone) {
      return NextResponse.json(
        {
          error: 'Paciente já existe',
          message: `Já existe um paciente com este telefone: ${existingByPhone.name}`,
          patient: existingByPhone,
        },
        { status: 409 }
      )
    }

    // Check by CPF if provided
    if (validatedData.cpf) {
      const { data: existingByCpf } = await supabase
        .from('patients')
        .select('id, name, cpf')
        .eq('cpf', validatedData.cpf)
        .single()

      if (existingByCpf) {
        return NextResponse.json(
          {
            error: 'Paciente já existe',
            message: `Já existe um paciente com este CPF: ${existingByCpf.name}`,
            patient: existingByCpf,
          },
          { status: 409 }
        )
      }
    }

    // ============================================
    // 5. CREATE PATIENT
    // ============================================
    const patientData: PatientInsert = {
      name: validatedData.name,
      birth_date: validatedData.birth_date,
      phone: validatedData.phone,
      cpf: validatedData.cpf || null,
    }

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert([patientData])
      .select('*')
      .single()

    if (patientError) {
      console.error('Erro ao criar paciente:', patientError)
      return NextResponse.json(
        { error: 'Falha ao criar paciente: ' + patientError.message },
        { status: 400 }
      )
    }

    // ============================================
    // 6. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        patient,
        message: 'Paciente criado com sucesso!',
      },
      { status: 201 }
    )
  } catch (error) {
    // ============================================
    // 7. ERROR HANDLING
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
