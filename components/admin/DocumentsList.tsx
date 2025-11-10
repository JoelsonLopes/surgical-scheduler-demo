'use client'

import { Button } from '@/components/ui/button'
import { AppointmentDocument } from '@/types/database'
import { Download, FileText, Image, Trash2 } from 'lucide-react'
import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DocumentsListProps {
  documents: AppointmentDocument[]
  onDelete?: (documentId: string) => void
  onPreview?: (document: AppointmentDocument) => void
  canDelete?: boolean
}

export function DocumentsList({
  documents,
  onDelete,
  onPreview,
  canDelete = false,
}: DocumentsListProps) {
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5" />

    if (fileType.startsWith('image/')) {
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image className="h-5 w-5" />
    }

    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDownload = async (document: AppointmentDocument) => {
    try {
      const response = await fetch(document.file_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.file_name
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold">Nenhum documento anexado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Este agendamento não possui documentos anexados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between rounded-lg border bg-muted/50 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground">
              {getFileIcon(document.file_type)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{document.file_name}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatFileSize(document.file_size)}</span>
                <span>•</span>
                <span>
                  {format(
                    new Date(document.created_at),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPreview &&
              document.file_type &&
              (document.file_type.startsWith('image/') ||
                document.file_type === 'application/pdf') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPreview(document)}
                  title="Visualizar"
                  aria-label="Visualizar documento"
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="h-4 w-4" />
                </Button>
              )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(document)}
              title="Baixar"
            >
              <Download className="h-4 w-4" />
            </Button>

            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(document.id)}
                title="Excluir"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
