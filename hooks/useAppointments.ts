'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { SCHEDULING_LIMITS } from '@/components/scheduling/SchedulingTimeSlotPicker/constants'

export interface Appointment {
  id: string
  procedure: string
  start_date_time: string
  end_date_time: string
  status: 'PENDING' | 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'CONCLUIDO'
  special_needs?: string
  patient_id: string
}

export interface Patient {
  id: string
  name: string
  birth_date: string
  phone: string
}

interface UseAppointmentsReturn {
  appointments: Appointment[]
  patients: Map<string, Patient>
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook to fetch appointments and patient data for a selected date
 * Handles data fetching, loading states, and error handling
 *
 * @param date - The selected date to fetch appointments for
 * @param refreshTrigger - Optional trigger to force refetch
 * @returns Appointments, patients map, loading state, and error
 */
export function useAppointments(
  date: Date | undefined,
  refreshTrigger?: number
): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Map<string, Patient>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!date) {
        setAppointments([])
        setPatients(new Map())
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const dateStr = format(date, 'yyyy-MM-dd')

        // Fetch appointments for the selected date
        const appointmentsRes = await fetch(
          `/api/schedules?date=${dateStr}&limit=${SCHEDULING_LIMITS.MAX_APPOINTMENTS_PER_DAY}`
        )

        if (!appointmentsRes.ok) {
          throw new Error('Failed to fetch appointments')
        }

        const appointmentsData = (await appointmentsRes.json()) as {
          appointments: Appointment[]
        }
        const fetchedAppointments = appointmentsData.appointments || []
        setAppointments(fetchedAppointments)

        // Fetch patient details in batch (single query instead of N+1)
        const patientIds: string[] = [
          ...new Set(fetchedAppointments.map((apt) => apt.patient_id)),
        ]

        const patientsMap = new Map<string, Patient>()

        if (patientIds.length > 0) {
          const patientsRes = await fetch('/api/patients/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: patientIds }),
          })

          if (patientsRes.ok) {
            const patientsData = (await patientsRes.json()) as {
              patients: Patient[]
            }

            // Convert array to map for O(1) lookup
            patientsData.patients.forEach((patient) => {
              patientsMap.set(patient.id, patient)
            })
          }
        }

        setPatients(patientsMap)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [date, refreshTrigger])

  return {
    appointments,
    patients,
    isLoading,
    error,
  }
}
