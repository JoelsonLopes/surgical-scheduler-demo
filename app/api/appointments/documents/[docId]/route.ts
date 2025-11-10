import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ============================================
// DELETE - Remove Document (Admin Only)
// ============================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
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
        {
          error:
            'Acesso negado. Apenas administradores podem deletar documentos.',
        },
        { status: 403 }
      )
    }

    // ============================================
    // 3. GET DOCUMENT ID FROM PARAMS
    // ============================================
    const { docId } = await params

    // ============================================
    // 4. GET DOCUMENT FROM DATABASE
    // ============================================
    const { data: document, error: fetchError } = await supabase
      .from('appointment_documents')
      .select('*')
      .eq('id', docId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    // ============================================
    // 5. DELETE FILE FROM STORAGE
    // ============================================
    // Extract file path from URL
    const urlParts = document.file_url.split('/')
    const bucketIndex = urlParts.findIndex(
      (part: string) => part === 'appointment-documents'
    )

    if (bucketIndex === -1) {
      return NextResponse.json(
        { error: 'URL do arquivo inválida' },
        { status: 400 }
      )
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/')

    const { error: storageError } = await supabase.storage
      .from('appointment-documents')
      .remove([filePath])

    if (storageError) {
      console.error('Erro ao deletar arquivo do storage:', storageError)
      // Continue mesmo com erro no storage
    }

    // ============================================
    // 6. DELETE DOCUMENT RECORD FROM DATABASE
    // ============================================
    const { error: deleteError } = await supabase
      .from('appointment_documents')
      .delete()
      .eq('id', docId)

    if (deleteError) {
      console.error('Erro ao deletar documento do banco:', deleteError)
      return NextResponse.json(
        { error: 'Falha ao deletar documento: ' + deleteError.message },
        { status: 400 }
      )
    }

    // ============================================
    // 7. SUCCESS RESPONSE
    // ============================================
    return NextResponse.json(
      {
        message: 'Documento excluído com sucesso',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro inesperado ao deletar documento:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
