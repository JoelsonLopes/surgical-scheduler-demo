'use client'

import { AppointmentRequestValues } from '@/lib/validations/schedules'
import { toast } from 'sonner'

export function useAppointmentActions() {
  const createAppointmentRequest = async (
    values: AppointmentRequestValues,
    selectedDate: Date | null,
    selectedTime: string | null
  ) => {
    try {
      const response = await fetch('/api/schedules/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, selectedDate, selectedTime }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao criar solicitação')
      }

      const data = await response.json()
      toast.success('Solicitação enviada com sucesso!')
      return data
    } catch (error) {
      console.error(error)
      const errorMessage =
        error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'
      toast.error(errorMessage)
      return null
    }
  }

  return { createAppointmentRequest }
}
