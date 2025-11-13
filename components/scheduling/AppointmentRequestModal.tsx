'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppointmentRequestForm } from './AppointmentRequestForm'
import { AppointmentRequestValues } from '@/lib/validations/schedules'

interface AppointmentRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: AppointmentRequestValues, documents?: File[]) => void
  isLoading: boolean
  selectedDate: Date | null
  selectedTime: string | null
  initialData?: Partial<AppointmentRequestValues>
  mode?: 'create' | 'edit'
  onDelete?: () => void
  canDelete?: boolean
}

export function AppointmentRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  selectedDate,
  selectedTime,
  initialData,
  mode = 'create',
  onDelete,
  canDelete = false,
}: AppointmentRequestModalProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !w-auto !max-w-[80vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Agendamento' : 'Solicitar Agendamento'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? `Altere os detalhes do agendamento em ${selectedDate?.toLocaleDateString()} às ${selectedTime}`
              : `Preencha os detalhes para o agendamento em ${selectedDate?.toLocaleDateString()} às ${selectedTime}`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AppointmentRequestForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            initialData={initialData}
            mode={mode}
            onDelete={onDelete}
            canDelete={canDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
