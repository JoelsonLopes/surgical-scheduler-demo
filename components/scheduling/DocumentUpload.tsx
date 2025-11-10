'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Upload, X } from 'lucide-react'
import * as React from 'react'

interface DocumentUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
}

/**
 * DocumentUpload - Componente para upload de documentos de pacientes
 * Suporta múltiplos arquivos com preview e validação
 */
export function DocumentUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
}: DocumentUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setError(null)

    // Validar número de arquivos
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    // Validar cada arquivo
    const validFiles: File[] = []
    for (const file of selectedFiles) {
      // Validar tipo
      if (!acceptedTypes.includes(file.type)) {
        setError(
          `Tipo de arquivo não permitido: ${file.name}. Tipos aceitos: PDF, JPG, PNG, DOC, DOCX`
        )
        continue
      }

      // Validar tamanho (converter MB para bytes)
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        setError(
          `Arquivo muito grande: ${file.name}. Máximo permitido: ${maxSizeMB}MB`
        )
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
    setError(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="document-upload">
          Documentos do Paciente
          <span className="ml-2 text-xs text-muted-foreground">
            (Opcional - até {maxFiles} arquivos, máx. {maxSizeMB}MB cada)
          </span>
        </Label>
        <div className="mt-2">
          <Input
            ref={inputRef}
            id="document-upload"
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={files.length >= maxFiles}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {files.length === 0
              ? 'Selecionar Documentos'
              : `Adicionar Mais (${files.length}/${maxFiles})`}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Formatos aceitos: PDF, JPG, PNG, DOC, DOCX
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Arquivos Selecionados ({files.length})
          </Label>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
