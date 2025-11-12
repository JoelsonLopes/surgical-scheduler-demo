'use client'

import { AppointmentRequestModal } from '@/components/scheduling/AppointmentRequestModal'
import { SchedulingTimeSlotPicker } from '@/components/scheduling/SchedulingTimeSlotPicker'
import { UpcomingAppointmentsList } from '@/components/scheduling/UpcomingAppointmentsList'
import { AdminSchedulingPanel } from '@/components/admin/AdminSchedulingPanel'
import { AppointmentDetailsModal } from '@/components/admin/AppointmentDetailsModal'
import { useAppointmentActions } from '@/hooks/useAppointmentActions'
import { useMonthAppointments } from '@/hooks/useMonthAppointments'
import { AppointmentRequestValues } from '@/lib/validations/schedules'
import { AppointmentWithDetails } from '@/types/admin'
import { format, startOfMonth } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface Appointment {
  id: string
  procedure: string
  start_date_time: string
  end_date_time: string
  status: 'PENDING' | 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'CONCLUIDO'
  special_needs?: string
  patient_id: string
  insurance?: string
}

interface Patient {
  id: string
  name: string
  birth_date: string
  phone: string
}

interface AppointmentWithPatient extends Appointment {
  patient?: Patient
}

export default function SchedulesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentWithPatient | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  // Admin-specific state
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedAdminAppointment, setSelectedAdminAppointment] =
    useState<AppointmentWithDetails | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [adminRefreshTrigger, setAdminRefreshTrigger] = useState(0)

  const { createAppointmentRequest } = useAppointmentActions()

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/user/role')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.role === 'ADMIN')
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      }
    }

    fetchUserRole()
  }, [])

  // Get appointments for the current month
  const currentMonth = useMemo(() => startOfMonth(new Date()), [])
  const { appointments: monthAppointments } = useMonthAppointments(
    currentMonth,
    refreshTrigger
  )

  // Fetch patient data for appointments
  const [appointmentsWithPatients, setAppointmentsWithPatients] = useState<
    AppointmentWithPatient[]
  >([])

  useEffect(() => {
    const fetchPatientsForAppointments = async () => {
      if (monthAppointments.length === 0) {
        setAppointmentsWithPatients([])
        return
      }

      const appointmentsWithPatientData = await Promise.all(
        monthAppointments.map(async (apt) => {
          try {
            const response = await fetch(`/api/patients?id=${apt.patient_id}`)
            if (response.ok) {
              const data = await response.json()
              if (data.patients && data.patients.length > 0) {
                return { ...apt, patient: data.patients[0] }
              }
            }
          } catch (error) {
            console.error('Error fetching patient:', error)
          }
          return apt
        })
      )

      setAppointmentsWithPatients(appointmentsWithPatientData)
    }

    fetchPatientsForAppointments()
  }, [monthAppointments])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = async (
    time: string,
    appointment?: Appointment | null
  ) => {
    setSelectedTime(time)

    if (appointment) {
      // Editing mode - fetch full appointment data with patient
      setIsLoading(true)
      try {
        const response = await fetch(`/api/schedules/${appointment.id}`)
        if (!response.ok) throw new Error('Failed to fetch appointment')

        const data = await response.json()
        setEditingAppointment(data.appointment)
        setModalMode('edit')
      } catch (error) {
        console.error('Error fetching appointment:', error)
        toast.error('Erro ao carregar dados do agendamento')
        return
      } finally {
        setIsLoading(false)
      }
    } else {
      // Creating mode
      setEditingAppointment(null)
      setModalMode('create')
    }

    setIsModalOpen(true)
  }

  const handleSubmit = async (
    values: AppointmentRequestValues,
    documents?: File[]
  ) => {
    setIsLoading(true)

    try {
      if (modalMode === 'edit' && editingAppointment) {
        // Update existing appointment
        const response = await fetch(
          `/api/schedules/${editingAppointment.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...values, selectedDate, selectedTime }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Falha ao atualizar agendamento')
        }

        // Upload documents if provided
        if (documents && documents.length > 0) {
          const formData = new FormData()
          documents.forEach((file) => formData.append('files', file))

          const uploadResponse = await fetch(
            `/api/appointments/${editingAppointment.id}/documents`,
            {
              method: 'POST',
              body: formData,
            }
          )

          if (!uploadResponse.ok) {
            console.error('Failed to upload documents')
            toast.error(
              'Agendamento atualizado, mas falha ao enviar documentos'
            )
          }
        }

        toast.success('Agendamento atualizado com sucesso!')
        setIsModalOpen(false)
        setRefreshTrigger((prev) => prev + 1)
      } else {
        // Create new appointment
        const result = await createAppointmentRequest(
          values,
          selectedDate,
          selectedTime
        )
        if (result && result.appointment) {
          // Upload documents if provided
          if (documents && documents.length > 0) {
            const formData = new FormData()
            documents.forEach((file) => formData.append('files', file))

            const uploadResponse = await fetch(
              `/api/appointments/${result.appointment.id}/documents`,
              {
                method: 'POST',
                body: formData,
              }
            )

            if (!uploadResponse.ok) {
              console.error('Failed to upload documents')
              toast.error('Agendamento criado, mas falha ao enviar documentos')
            }
          }

          setIsModalOpen(false)
          setRefreshTrigger((prev) => prev + 1)
        }
      }
    } catch (error) {
      console.error(error)
      const errorMessage =
        error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingAppointment) return

    if (
      !confirm(
        'Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/schedules/${editingAppointment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao excluir agendamento')
      }

      toast.success('Agendamento excluído com sucesso!')
      setIsModalOpen(false)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error(error)
      const errorMessage =
        error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Admin action handlers
  const handleViewDetails = (appointment: AppointmentWithDetails) => {
    setSelectedAdminAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const handleApprove = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `/api/admin/schedules/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'CONFIRMADO' }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve appointment')
      }

      toast.success('Agendamento aprovado com sucesso!')
      setAdminRefreshTrigger((prev) => prev + 1)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error approving appointment:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao aprovar agendamento'
      toast.error(errorMessage)
    }
  }

  const handleReject = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `/api/admin/schedules/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'REJEITADO' }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject appointment')
      }

      toast.success('Agendamento rejeitado')
      setAdminRefreshTrigger((prev) => prev + 1)
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('Error rejecting appointment:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao rejeitar agendamento'
      toast.error(errorMessage)
    }
  }

  const handleAdminRefresh = () => {
    setAdminRefreshTrigger((prev) => prev + 1)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEdit = () => {
    // TODO: Implement edit functionality
    toast.info('Funcionalidade de edição será implementada em breve')
  }

  // Prepare initial data for edit mode
  const getInitialData = (): Partial<AppointmentRequestValues> | undefined => {
    if (!editingAppointment || !editingAppointment.patient) return undefined

    const patient = editingAppointment.patient
    const endTime = format(new Date(editingAppointment.end_date_time), 'HH:mm')

    // Validate insurance value against allowed enum values
    const validInsuranceValues = [
      'BRADESCO_SAUDE',
      'MEDSENIOR',
      'CABERGS_SAUDE',
      'POSTAL_SAUDE',
      'UNIMED',
      'DANAMED',
      'SUL_AMERICA',
    ] as const

    type InsuranceValue = (typeof validInsuranceValues)[number]

    const insurance = validInsuranceValues.includes(
      editingAppointment.insurance as InsuranceValue
    )
      ? (editingAppointment.insurance as InsuranceValue)
      : undefined

    return {
      patientName: patient.name,
      birthDate: format(new Date(patient.birth_date), 'dd/MM/yyyy'),
      patientPhone: patient.phone,
      procedure: editingAppointment.procedure,
      specialNeeds: editingAppointment.special_needs || '',
      insurance,
      estimatedEndTime: endTime,
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="container mx-auto max-w-7xl space-y-8 p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Agenda Cirúrgica
          </h1>
          <p className="text-muted-foreground">
            Selecione uma data e um horário para criar um novo agendamento.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <SchedulingTimeSlotPicker
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            refreshTrigger={refreshTrigger}
          />

          <div className="flex h-[490px] w-full flex-col lg:w-[380px] lg:flex-shrink-0">
            <h3 className="mb-4 flex-shrink-0 text-lg font-semibold">
              Próximos Agendamentos (
              {
                appointmentsWithPatients.filter((apt) => {
                  const startDateTime = new Date(apt.start_date_time)
                  return (
                    startDateTime >= new Date() ||
                    new Date(startDateTime).toDateString() ===
                      new Date().toDateString()
                  )
                }).length
              }
              )
            </h3>
            <UpcomingAppointmentsList
              appointments={appointmentsWithPatients}
              maxItems={5}
            />
          </div>
        </div>

        <AppointmentRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          initialData={getInitialData()}
          mode={modalMode}
          onDelete={handleDelete}
          canDelete={editingAppointment?.status === 'PENDING'}
        />

        {/* Admin Panel - Only visible for ADMIN users */}
        {isAdmin && (
          <div>
            <AdminSchedulingPanel
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
              refreshTrigger={adminRefreshTrigger}
            />
          </div>
        )}

        {/* Admin Details Modal */}
        {isAdmin && selectedAdminAppointment && (
          <AppointmentDetailsModal
            appointment={selectedAdminAppointment}
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false)
              setSelectedAdminAppointment(null)
            }}
            onRefresh={handleAdminRefresh}
          />
        )}
      </div>
    </div>
  )
}
