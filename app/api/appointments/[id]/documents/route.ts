import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// POST - Upload Documents for Appointment
// ============================================

export async function POST(
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
    // 2. GET APPOINTMENT ID FROM PARAMS
    // ============================================
    const { id: appointmentId } = await params

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do agendamento não fornecido' },
        { status: 400 }
      )
    }

    // ============================================
    // 3. VERIFY APPOINTMENT EXISTS AND USER HAS ACCESS
    // ============================================
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, doctor_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Check if user is the doctor or an admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isDoctor = appointment.doctor_id === user.id
    const isAdmin = userData?.role === 'ADMIN'

    if (!isDoctor && !isAdmin) {
      return NextResponse.json(
        { error: 'Sem permissão para adicionar documentos a este agendamento' },
        { status: 403 }
      )
    }

    // ============================================
    // 4. PARSE FORM DATA
    // ============================================
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      )
    }

    // ============================================
    // 5. UPLOAD FILES TO SUPABASE STORAGE
    // ============================================
    const uploadedDocuments = []
    const errors = []

    for (const file of files) {
      try {
        // Generate unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${appointmentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } =
          await supabase.storage
            .from('appointment-documents')
            .upload(fileName, file, {
              contentType: file.type,
              upsert: false,
            })

        if (storageError) {
          errors.push({
            fileName: file.name,
            error: storageError.message,
          })
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage
          .from('appointment-documents')
          .getPublicUrl(storageData.path)

        // Save metadata to database
        const { data: documentData, error: documentError } = await supabase
          .from('appointment_documents')
          .insert([
            {
              appointment_id: appointmentId,
              file_name: file.name,
              file_url: publicUrl,
              file_type: file.type,
              file_size: file.size,
              uploaded_by: user.id,
            },
          ])
          .select()
          .single()

        if (documentError) {
          errors.push({
            fileName: file.name,
            error: documentError.message,
          })
          // Try to clean up uploaded file
          await supabase.storage
            .from('appointment-documents')
            .remove([storageData.path])
          continue
        }

        uploadedDocuments.push(documentData)
      } catch (error) {
        errors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    }

    // ============================================
    // 6. RETURN RESULTS
    // ============================================
    if (uploadedDocuments.length === 0) {
      return NextResponse.json(
        {
          error: 'Nenhum arquivo foi enviado com sucesso',
          details: errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        documents: uploadedDocuments,
        uploadedCount: uploadedDocuments.length,
        totalCount: files.length,
        errors: errors.length > 0 ? errors : undefined,
        message:
          errors.length > 0
            ? `${uploadedDocuments.length} de ${files.length} arquivos enviados com sucesso`
            : 'Todos os arquivos foram enviados com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado ao fazer upload de documentos:', error)
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
// GET - List Documents for Appointment
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
    // 2. GET APPOINTMENT ID FROM PARAMS
    // ============================================
    const { id: appointmentId } = await params

    // ============================================
    // 3. VERIFY ACCESS TO APPOINTMENT
    // ============================================
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, doctor_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Check if user is the doctor or an admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isDoctor = appointment.doctor_id === user.id
    const isAdmin = userData?.role === 'ADMIN'

    if (!isDoctor && !isAdmin) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar documentos deste agendamento' },
        { status: 403 }
      )
    }

    // ============================================
    // 4. GET DOCUMENTS FROM DATABASE
    // ============================================
    const { data: documents, error: documentsError } = await supabase
      .from('appointment_documents')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (documentsError) {
      return NextResponse.json(
        { error: 'Falha ao buscar documentos: ' + documentsError.message },
        { status: 400 }
      )
    }

    // ============================================
    // 5. RETURN DOCUMENTS
    // ============================================
    return NextResponse.json(
      {
        documents: documents || [],
        count: documents?.length || 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro inesperado ao buscar documentos:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
