'use client'

import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMonthAppointments } from '@/hooks/useMonthAppointments'
import { useAppointments, type Appointment } from '@/hooks/useAppointments'
import { generateTimeSlots } from '@/lib/utils/timeSlots'
import { format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as React from 'react'
import { DayButton, type DayButtonProps } from 'react-day-picker'
import { TIME_SLOT_CONFIG } from './constants'
import { AppointmentSlot } from './AppointmentSlot'
import { AvailableSlot } from './AvailableSlot'

// ============================================
// TYPES
// ============================================

interface SchedulingTimeSlotPickerProps {
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string, appointment?: Appointment | null) => void
  refreshTrigger?: number
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SchedulingTimeSlotPicker({
  onDateSelect,
  onTimeSelect,
  refreshTrigger,
}: SchedulingTimeSlotPickerProps) {
  // ============================================
  // STATE
  // ============================================
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // ============================================
  // HOOKS
  // ============================================

  // Generate time slots based on configuration
  const timeSlots = React.useMemo(
    () =>
      generateTimeSlots(
        TIME_SLOT_CONFIG.START_HOUR,
        TIME_SLOT_CONFIG.END_HOUR,
        TIME_SLOT_CONFIG.INTERVAL_MINUTES
      ),
    []
  )

  // Get appointments for current month (for calendar badges)
  const currentMonth = React.useMemo(
    () => startOfMonth(date || new Date()),
    [date]
  )
  const { appointmentsByDay } = useMonthAppointments(
    currentMonth,
    refreshTrigger
  )

  // Get appointments and patients for selected date
  const { appointments, patients, isLoading } = useAppointments(
    date,
    refreshTrigger
  )

  // ============================================
  // HANDLERS
  // ============================================

  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      onDateSelect(selectedDate)
    }
  }

  const handleTimeSelect = (time: string, appointment?: Appointment | null) => {
    onTimeSelect(time, appointment)
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Find appointment for a specific time slot
   * Checks if the slot falls within any appointment's time range
   */
  const getAppointmentForSlot = (timeSlot: string): Appointment | null => {
    if (!date) return null

    return (
      appointments.find((apt) => {
        const startDateTime = new Date(apt.start_date_time)
        const endDateTime = new Date(apt.end_date_time)

        const [hours, minutes] = timeSlot.split(':').map(Number)
        const slotDateTime = new Date(date)
        slotDateTime.setHours(hours, minutes, 0, 0)

        // A slot is occupied if it's >= start and < end
        return slotDateTime >= startDateTime && slotDateTime < endDateTime
      }) || null
    )
  }

  /**
   * Get days with appointments for calendar badge display
   */
  const daysWithAppointments = React.useMemo(() => {
    const days: Date[] = []
    appointmentsByDay.forEach((_, dateKey) => {
      const [year, month, day] = dateKey.split('-').map(Number)
      days.push(new Date(year, month - 1, day))
    })
    return days
  }, [appointmentsByDay])

  // ============================================
  // CALENDAR CUSTOMIZATION
  // ============================================

  /**
   * Custom DayButton component with appointment count badges
   * Uses DayButton instead of Day to avoid hydration errors with table structure
   */
  const CustomDayButton = React.useCallback(
    (props: DayButtonProps) => {
      const dateKey = format(props.day.date, 'yyyy-MM-dd')
      const dayAppointments = appointmentsByDay.get(dateKey)
      const count = dayAppointments?.length || 0

      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <DayButton {...props}>
            <span className="relative inline-flex items-start text-sm font-medium">
              {props.day.date.getDate()}
              {count > 0 && (
                <span className="ml-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                  {count}
                </span>
              )}
            </span>
          </DayButton>
        </div>
      )
    },
    [appointmentsByDay]
  )

  const customComponents = React.useMemo(
    () => ({
      DayButton: CustomDayButton,
    }),
    [CustomDayButton]
  )

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-6">
      {/* Calendar Section */}
      <div className="flex flex-shrink-0 flex-col">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          className="rounded-md border shadow-sm"
          locale={ptBR}
          components={customComponents}
          modifiers={{
            hasAppointments: daysWithAppointments,
          }}
          modifiersClassNames={{
            hasAppointments: 'font-bold',
          }}
        />
        <div className="mt-2 rounded-md border bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Dica:</span> Números em azul indicam
            quantidade de agendamentos do dia
          </p>
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="flex h-[490px] flex-shrink-0 flex-col md:w-[340px]">
        <h3 className="mb-4 flex-shrink-0 text-lg font-semibold">
          {date
            ? `Horários para ${format(date, 'PPP', { locale: ptBR })}`
            : 'Selecione uma data'}
        </h3>
        <ScrollArea className="w-full flex-1 rounded-md border">
          <div className="flex flex-col gap-2 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Carregando horários...
              </div>
            ) : (
              timeSlots.map((time) => {
                const appointment = getAppointmentForSlot(time)
                const patient = appointment
                  ? patients.get(appointment.patient_id)
                  : null

                // Render occupied slot with appointment details
                if (appointment && patient) {
                  return (
                    <AppointmentSlot
                      key={time}
                      time={time}
                      appointment={appointment}
                      patient={patient}
                      onSelect={handleTimeSelect}
                    />
                  )
                }

                // Render available slot
                return (
                  <AvailableSlot
                    key={time}
                    time={time}
                    onSelect={(t) => handleTimeSelect(t, null)}
                  />
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
