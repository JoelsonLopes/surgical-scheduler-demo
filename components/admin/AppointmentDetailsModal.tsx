'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AppointmentWithDetails } from '@/types/admin'
import { AppointmentDocument } from '@/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Cake,
  Stethoscope,
  AlertCircle,
} from 'lucide-react'
import * as React from 'react'
import { DocumentsList } from './DocumentsList'
import { DocumentPreview } from './DocumentPreview'
import { DocumentUpload } from '../scheduling/DocumentUpload'
import { toast } from 'sonner'

interface AppointmentDetailsModalProps {
  appointment: AppointmentWithDetails | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (appointmentId: string) => void
  onReject?: (appointmentId: string) => void
  onRefresh?: () => void
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Aguardando Aprovação',
    color: 'bg-yellow-100 text-yellow-800',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    color: 'bg-green-100 text-green-800',
  },
  REJEITADO: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-800',
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'bg-gray-100 text-gray-800',
  },
  CONCLUIDO: {
    label: 'Concluído',
    color: 'bg-blue-100 text-blue-800',
  },
}

export function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRefresh,
}: AppointmentDetailsModalProps) {
  const [previewDocument, setPreviewDocument] =
    React.useState<AppointmentDocument | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [showUpload, setShowUpload] = React.useState(false)
  const [newDocuments, setNewDocuments] = React.useState<File[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

  if (!appointment) return null

  const statusConfig =
    STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG]

  const handlePreview = (document: AppointmentDocument) => {
    setPreviewDocument(document)
    setIsPreviewOpen(true)
  }

  const handleDelete = async (documentId: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `/api/appointments/documents/${documentId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Falha ao deletar documento')
      }

      toast.success('Documento excluído com sucesso')
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Erro ao excluir documento')
    }
  }

  const handleUpload = async () => {
    if (newDocuments.length === 0) {
      toast.error('Selecione pelo menos um arquivo')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      newDocuments.forEach((file) => formData.append('files', file))

      const response = await fetch(
        `/api/appointments/${appointment.id}/documents`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Falha ao fazer upload')
      }

      toast.success('Documentos enviados com sucesso')
      setNewDocuments([])
      setShowUpload(false)
      onRefresh?.()
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast.error('Erro ao enviar documentos')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  Detalhes do Agendamento
                </DialogTitle>
                <DialogDescription>
                  Visualize e gerencie informações completas do agendamento
                </DialogDescription>
              </div>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Patient Information */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Informações do Paciente
              </h3>
              <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{appointment.patient?.name}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      Telefone
                    </p>
                    <p className="font-medium">{appointment.patient?.phone}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Cake className="h-3 w-3" />
                      Data de Nascimento
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(appointment.patient?.birth_date),
                        'dd/MM/yyyy',
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                  {appointment.patient?.cpf && (
                    <div>
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p className="font-medium">{appointment.patient?.cpf}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Appointment Information */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5" />
                Informações do Agendamento
              </h3>
              <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Data
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(appointment.start_date_time),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Horário
                    </p>
                    <p className="font-medium">
                      {format(new Date(appointment.start_date_time), 'HH:mm')} -{' '}
                      {format(new Date(appointment.end_date_time), 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      Médico Responsável
                    </p>
                    <p className="font-medium">{appointment.doctor?.name}</p>
                  </div>
                  {appointment.insurance && (
                    <div>
                      <p className="text-sm text-muted-foreground">Convênio</p>
                      <p className="font-medium">{appointment.insurance}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Procedimento
                  </p>
                  <p className="font-medium">{appointment.procedure}</p>
                </div>
                {appointment.special_needs && (
                  <div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      Necessidades Especiais
                    </p>
                    <p className="font-medium">{appointment.special_needs}</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Documents Section */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5" />
                  Documentos Anexados ({appointment.documents?.length || 0})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(!showUpload)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {showUpload ? 'Cancelar' : 'Adicionar Documentos'}
                </Button>
              </div>

              {showUpload && (
                <div className="mb-4 rounded-lg border bg-muted/50 p-4">
                  <DocumentUpload
                    files={newDocuments}
                    onFilesChange={setNewDocuments}
                  />
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUpload(false)
                        setNewDocuments([])
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || newDocuments.length === 0}
                    >
                      {isUploading ? 'Enviando...' : 'Enviar Documentos'}
                    </Button>
                  </div>
                </div>
              )}

              <DocumentsList
                documents={appointment.documents || []}
                onDelete={handleDelete}
                onPreview={handlePreview}
                canDelete={true}
              />
            </section>

            {/* Actions */}
            {appointment.status === 'PENDING' && (
              <>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (onReject) {
                        onReject(appointment.id)
                        onClose()
                      }
                    }}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => {
                      if (onApprove) {
                        onApprove(appointment.id)
                        onClose()
                      }
                    }}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprovar Agendamento
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DocumentPreview
        document={previewDocument}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setPreviewDocument(null)
        }}
      />
    </>
  )
}
