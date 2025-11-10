'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppointmentDocument } from '@/types/database'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import * as React from 'react'

interface DocumentPreviewProps {
  document: AppointmentDocument | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentPreview({
  document,
  isOpen,
  onClose,
}: DocumentPreviewProps) {
  if (!document) return null

  const isPDF = document.file_type === 'application/pdf'
  const isImage = document.file_type?.startsWith('image/')

  const handleDownload = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{document.file_name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {isPDF && (
            <iframe
              src={document.file_url}
              className="h-[600px] w-full rounded-lg border"
              title={document.file_name}
            />
          )}

          {isImage && (
            <div className="relative flex h-[600px] items-center justify-center rounded-lg border bg-muted p-4">
              <Image
                src={document.file_url}
                alt={document.file_name}
                fill
                className="object-contain"
              />
            </div>
          )}

          {!isPDF && !isImage && (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-muted p-12">
              <p className="text-center text-muted-foreground">
                Visualização não disponível para este tipo de arquivo
              </p>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="mt-4 gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
