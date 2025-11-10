'use client'

import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, format } from 'date-fns'

interface Appointment {
  id: string
  procedure: string
  start_date_time: string
  end_date_time: string
  status: 'PENDING' | 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'CONCLUIDO'
  special_needs?: string
  patient_id: string
}

interface UseMonthAppointmentsReturn {
  appointments: Appointment[]
  appointmentsByDay: Map<string, Appointment[]>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook para buscar todos os agendamentos de um mês
 * Retorna um Map com agendamentos agrupados por dia (formato YYYY-MM-DD)
 */
export function useMonthAppointments(
  currentMonth: Date,
  refreshTrigger?: number
): UseMonthAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [appointmentsByDay, setAppointmentsByDay] = useState<
    Map<string, Appointment[]>
  >(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchMonthAppointments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Calcular primeiro e último dia do mês
        const firstDay = startOfMonth(currentMonth)
        const lastDay = endOfMonth(currentMonth)

        const startDate = format(firstDay, 'yyyy-MM-dd')
        const endDate = format(lastDay, 'yyyy-MM-dd')

        // Buscar todos os agendamentos do mês
        const response = await fetch(
          `/api/schedules?startDate=${startDate}&endDate=${endDate}&limit=1000`
        )

        if (!response.ok) {
          throw new Error('Falha ao buscar agendamentos do mês')
        }

        const data = await response.json()
        const fetchedAppointments = data.appointments || []
        setAppointments(fetchedAppointments)

        // Agrupar por dia
        const byDay = new Map<string, Appointment[]>()

        fetchedAppointments.forEach((apt: Appointment) => {
          const aptDate = new Date(apt.start_date_time)
          const dateKey = format(aptDate, 'yyyy-MM-dd')

          if (!byDay.has(dateKey)) {
            byDay.set(dateKey, [])
          }
          byDay.get(dateKey)!.push(apt)
        })

        setAppointmentsByDay(byDay)
      } catch (err) {
        console.error('Error fetching month appointments:', err)
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthAppointments()
  }, [currentMonth, refreshTrigger])

  return {
    appointments,
    appointmentsByDay,
    isLoading,
    error,
  }
}
