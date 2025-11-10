'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, User } from 'lucide-react'
import * as React from 'react'

interface Appointment {
  id: string
  procedure: string
  start_date_time: string
  end_date_time: string
  status: 'PENDING' | 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'CONCLUIDO'
  special_needs?: string
  patient_id: string
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

interface UpcomingAppointmentsListProps {
  appointments: AppointmentWithPatient[]
  maxItems?: number
}

// Status configuration with colors
const STATUS_CONFIG = {
  PENDING: {
    label: 'Aguardando Aprovação',
    bgClass: 'bg-yellow-50 border-yellow-200',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    dotClass: 'bg-yellow-500',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    bgClass: 'bg-green-50 border-green-200',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    dotClass: 'bg-green-500',
  },
  REJEITADO: {
    label: 'Rejeitado',
    bgClass: 'bg-red-50 border-red-200',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    dotClass: 'bg-red-500',
  },
  CANCELADO: {
    label: 'Cancelado',
    bgClass: 'bg-gray-50 border-gray-200',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
    dotClass: 'bg-gray-500',
  },
  CONCLUIDO: {
    label: 'Concluído',
    bgClass: 'bg-blue-50 border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    dotClass: 'bg-blue-500',
  },
}

export function UpcomingAppointmentsList({
  appointments,
  maxItems = 7,
}: UpcomingAppointmentsListProps) {
  // Filter and sort upcoming appointments, then group by date
  const appointmentsByDate = React.useMemo(() => {
    const now = new Date()
    const filtered = appointments
      .filter((apt) => {
        const startDateTime = new Date(apt.start_date_time)
        // Show appointments from today onwards
        return startDateTime >= now || isToday(startDateTime)
      })
      .sort((a, b) => {
        // Sort by start_date_time ascending
        return (
          new Date(a.start_date_time).getTime() -
          new Date(b.start_date_time).getTime()
        )
      })
      .slice(0, maxItems)

    // Group by date
    const grouped = new Map<string, AppointmentWithPatient[]>()
    filtered.forEach((apt) => {
      const dateKey = format(new Date(apt.start_date_time), 'yyyy-MM-dd')
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(apt)
    })

    return grouped
  }, [appointments, maxItems])

  if (appointmentsByDate.size === 0) {
    return (
      <Card className="flex flex-1 p-6">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Calendar className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum agendamento futuro encontrado
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-1 flex-col p-6">
      <ScrollArea className="flex-1 pr-4">
        <Accordion type="single" collapsible className="w-full">
          {Array.from(appointmentsByDate.entries()).map(
            ([dateKey, dayAppointments]) => {
              const date = new Date(dateKey + 'T12:00:00')
              const isDateToday = isToday(date)

              return (
                <AccordionItem key={dateKey} value={dateKey}>
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex w-full items-center justify-between pr-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {format(date, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        {isDateToday && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                            Hoje
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {dayAppointments.length}{' '}
                        {dayAppointments.length === 1
                          ? 'agendamento'
                          : 'agendamentos'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="space-y-3">
                      {dayAppointments.map((appointment) => {
                        const statusConfig = STATUS_CONFIG[appointment.status]
                        const startDateTime = new Date(
                          appointment.start_date_time
                        )
                        const endDateTime = new Date(appointment.end_date_time)
                        const isPastAppointment = isPast(startDateTime)

                        return (
                          <div
                            key={appointment.id}
                            className={`rounded-lg border p-4 transition-all hover:shadow-md ${statusConfig.bgClass} ${
                              isPastAppointment ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <div
                                    className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`}
                                  />
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {appointment.procedure}
                                  </h4>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                      {format(startDateTime, 'HH:mm')} -{' '}
                                      {format(endDateTime, 'HH:mm')}
                                    </span>
                                  </div>

                                  {appointment.patient && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <User className="h-3.5 w-3.5" />
                                      <span>{appointment.patient.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusConfig.badgeClass}`}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            }
          )}
        </Accordion>
      </ScrollArea>
    </Card>
  )
}
