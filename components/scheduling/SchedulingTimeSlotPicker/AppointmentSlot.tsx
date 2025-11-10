'use client'

import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { CalendarIcon, Clock, Phone, User } from 'lucide-react'
import { format } from 'date-fns'
import { STATUS_CONFIG, type AppointmentStatus } from './config'
import type { Appointment, Patient } from '@/hooks/useAppointments'

interface AppointmentSlotProps {
  time: string
  appointment: Appointment
  patient: Patient
  onSelect: (time: string, appointment: Appointment) => void
}

/**
 * AppointmentSlot component - Displays an occupied time slot with appointment details
 * Shows a hover card with full appointment information on hover
 */
export function AppointmentSlot({
  time,
  appointment,
  patient,
  onSelect,
}: AppointmentSlotProps) {
  const statusConfig = STATUS_CONFIG[appointment.status as AppointmentStatus]

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          className={`relative justify-start transition-all ${statusConfig.bgClass}`}
          onClick={() => onSelect(time, appointment)}
        >
          <div
            className={`mr-2 h-2 w-2 rounded-full ${statusConfig.dotClass}`}
          />
          <Clock className="mr-2 h-4 w-4" />
          <span className="font-semibold">{time}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {patient.name.split(' ')[0]}
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-semibold">{appointment.procedure}</h4>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Paciente:</span>
              <span className="font-medium">{patient.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Horário:</span>
              <span className="font-medium">
                {format(new Date(appointment.start_date_time), 'HH:mm')} -{' '}
                {format(new Date(appointment.end_date_time), 'HH:mm')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Telefone:</span>
              <span className="font-medium">{patient.phone}</span>
            </div>
          </div>

          {appointment.special_needs && (
            <div className="mt-2 rounded-md bg-muted p-2">
              <span className="text-xs font-medium text-muted-foreground">
                Necessidades Especiais:
              </span>
              <p className="mt-1 text-xs">{appointment.special_needs}</p>
            </div>
          )}

          <div className="pt-2 text-xs text-muted-foreground">
            💡 Clique no horário para editar o agendamento
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
