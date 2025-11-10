# TODO - Refatoração Clean Code

## ✅ Bugs Corrigidos Recentemente

### 1. ✅ Correção de Timezone UTC (Commit: 1bd52a9)

**Problema:** `getAppointmentForSlot` usava data do primeiro agendamento ao invés da data selecionada pelo usuário.
**Solução:** Alterada linha 175 para usar `new Date(date)` ao invés de `new Date(startDateTime)`.

### 2. ✅ API de Pacientes - Suporte ao Parâmetro ID (Commit: 8e3b4f8)

**Problema:** `/api/patients` não aceitava parâmetro `id`, sempre retornava primeiro paciente alfabeticamente.
**Solução:** Adicionado filtro `if (id) { query = query.eq('id', id) }` na API route.
**Resultado:** Agora cada slot mostra o nome correto do paciente.

---

## 📋 SchedulingTimeSlotPicker - Refatoração para Boas Práticas

### Status: 🔴 Pendente

**Objetivo:** Refatorar componente seguindo Clean Code mantendo funcionalidade 100% idêntica.

---

## 1. Separar Configurações e Constantes

### 1.1 Criar arquivo de constantes

**Arquivo:** `components/scheduling/SchedulingTimeSlotPicker/constants.ts`

```typescript
// Horários de funcionamento do bloco cirúrgico
export const WORK_START_HOUR = 7
export const WORK_END_HOUR = 14
export const TIME_SLOT_INTERVAL_MINUTES = 30

// Limites de busca
export const DEFAULT_APPOINTMENTS_LIMIT = 100
```

**Motivo:** Eliminar "magic numbers" (7, 14, 30, 100)
**Impacto:** Nenhum - apenas organização

---

### 1.2 Mover STATUS_CONFIG para arquivo separado

**Arquivo:** `components/scheduling/SchedulingTimeSlotPicker/config.ts`

```typescript
export const STATUS_CONFIG = {
  PENDING: {
    label: 'Aguardando Aprovação',
    bgClass: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    dotClass: 'bg-yellow-500',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    bgClass: 'bg-green-50 border-green-200 hover:bg-green-100',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    dotClass: 'bg-green-500',
  },
  REJEITADO: {
    label: 'Rejeitado',
    bgClass: 'bg-red-50 border-red-200 hover:bg-red-100',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    dotClass: 'bg-red-500',
  },
  CANCELADO: {
    label: 'Cancelado',
    bgClass: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
    dotClass: 'bg-gray-500',
  },
  CONCLUIDO: {
    label: 'Concluído',
    bgClass: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    dotClass: 'bg-blue-500',
  },
} as const

export type AppointmentStatus = keyof typeof STATUS_CONFIG
```

**Motivo:** Configuração não deve estar no componente
**Impacto:** Nenhum - apenas organização

---

## 2. Extrair Utilitários

### 2.1 Criar utilitário de time slots

**Arquivo:** `lib/utils/timeSlots.ts`

```typescript
/**
 * Gera lista de horários disponíveis em intervalos regulares
 * @param startHour - Hora inicial (0-23)
 * @param endHour - Hora final (0-23)
 * @param intervalMinutes - Intervalo entre slots em minutos
 * @returns Array de strings no formato "HH:MM"
 *
 * @example
 * generateTimeSlots(7, 14, 30)
 * // ['07:00', '07:30', '08:00', ..., '13:30']
 */
export function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number
): string[] {
  const slots: string[] = []

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
  }

  return slots
}
```

**Motivo:** Funções helper devem estar em `lib/utils/`
**Impacto:** Nenhum - apenas organização

---

## 3. Criar Custom Hook para Lógica de Dados

### 3.1 Hook useAppointments

**Arquivo:** `hooks/useAppointments.ts`

```typescript
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

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

interface UseAppointmentsReturn {
  appointments: Appointment[]
  patients: Map<string, Patient>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook para buscar agendamentos e pacientes de uma data específica
 * @param date - Data para buscar agendamentos
 * @param refreshTrigger - Contador para forçar atualização
 * @returns Agendamentos, pacientes e estado de loading
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
      if (!date) return

      setIsLoading(true)
      setError(null)

      try {
        const dateStr = format(date, 'yyyy-MM-dd')

        // 1. Buscar agendamentos
        const appointmentsRes = await fetch(
          `/api/schedules?date=${dateStr}&limit=100`
        )

        if (!appointmentsRes.ok) {
          throw new Error('Falha ao buscar agendamentos')
        }

        const appointmentsData = await appointmentsRes.json()
        const fetchedAppointments = appointmentsData.appointments || []
        setAppointments(fetchedAppointments)

        // 2. Buscar pacientes (TODO: otimizar para buscar todos de uma vez)
        const patientIds = [
          ...new Set(
            fetchedAppointments.map((apt: Appointment) => apt.patient_id)
          ),
        ]

        const patientsMap = new Map<string, Patient>()

        for (const patientId of patientIds) {
          const patientRes = await fetch(`/api/patients?id=${patientId}`)

          if (patientRes.ok) {
            const patientData = await patientRes.json()
            if (patientData.patients && patientData.patients.length > 0) {
              patientsMap.set(patientId, patientData.patients[0])
            }
          }
        }

        setPatients(patientsMap)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
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
```

**Motivo:** Separar lógica de dados da UI (Single Responsibility)
**Impacto:** Nenhum - funcionalidade idêntica, mais testável

---

## 4. Criar Componentes Menores

### 4.1 Componente AppointmentSlot (slot ocupado)

**Arquivo:** `components/scheduling/SchedulingTimeSlotPicker/AppointmentSlot.tsx`

```typescript
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Phone, User } from 'lucide-react'
import { STATUS_CONFIG } from './config'

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

interface AppointmentSlotProps {
  time: string
  appointment: Appointment
  patient: Patient
  onClick: () => void
}

export function AppointmentSlot({
  time,
  appointment,
  patient,
  onClick,
}: AppointmentSlotProps) {
  const statusConfig = STATUS_CONFIG[appointment.status]

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          className={`relative justify-start transition-all ${statusConfig.bgClass}`}
          onClick={onClick}
        >
          <div className={`mr-2 h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
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
```

**Motivo:** Componentes pequenos e focados (Single Responsibility)
**Impacto:** Nenhum - funcionalidade idêntica

---

### 4.2 Componente AvailableSlot (slot livre)

**Arquivo:** `components/scheduling/SchedulingTimeSlotPicker/AvailableSlot.tsx`

```typescript
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface AvailableSlotProps {
  time: string
  onClick: () => void
}

export function AvailableSlot({ time, onClick }: AvailableSlotProps) {
  return (
    <Button
      variant="outline"
      className="justify-start transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <Clock className="mr-2 h-4 w-4" />
      {time}
    </Button>
  )
}
```

**Motivo:** Separar lógica de slot livre vs ocupado
**Impacto:** Nenhum - funcionalidade idêntica

---

### 4.3 Componente Principal Refatorado

**Arquivo:** `components/scheduling/SchedulingTimeSlotPicker/index.tsx`

```typescript
'use client'

import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as React from 'react'
import { AppointmentSlot } from './AppointmentSlot'
import { AvailableSlot } from './AvailableSlot'
import { WORK_START_HOUR, WORK_END_HOUR, TIME_SLOT_INTERVAL_MINUTES } from './constants'
import { generateTimeSlots } from '@/lib/utils/timeSlots'
import { useAppointments } from '@/hooks/useAppointments'

// Props for the component
interface SchedulingTimeSlotPickerProps {
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string, appointment?: Appointment | null) => void
  refreshTrigger?: number
}

interface Appointment {
  id: string
  procedure: string
  start_date_time: string
  end_date_time: string
  status: 'PENDING' | 'CONFIRMADO' | 'REJEITADO' | 'CANCELADO' | 'CONCLUIDO'
  special_needs?: string
  patient_id: string
}

export function SchedulingTimeSlotPicker({
  onDateSelect,
  onTimeSelect,
  refreshTrigger,
}: SchedulingTimeSlotPickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // Custom hook para gerenciar dados
  const { appointments, patients, isLoading } = useAppointments(date, refreshTrigger)

  // Gerar slots de horário (memoizado)
  const timeSlots = React.useMemo(
    () => generateTimeSlots(WORK_START_HOUR, WORK_END_HOUR, TIME_SLOT_INTERVAL_MINUTES),
    []
  )

  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      onDateSelect(selectedDate)
    }
  }

  // Find appointment for a specific time slot
  const getAppointmentForSlot = (timeSlot: string): Appointment | null => {
    return (
      appointments.find((apt) => {
        const startDateTime = new Date(apt.start_date_time)
        const endDateTime = new Date(apt.end_date_time)

        const [hours, minutes] = timeSlot.split(':').map(Number)
        const slotDateTime = new Date(startDateTime)
        slotDateTime.setHours(hours, minutes, 0, 0)

        return slotDateTime >= startDateTime && slotDateTime < endDateTime
      }) || null
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          className="rounded-md border shadow-sm"
          locale={ptBR}
        />
      </div>

      <div className="md:col-span-2">
        <h3 className="mb-4 text-lg font-semibold">
          {date
            ? `Horários para ${format(date, 'PPP', { locale: ptBR })}`
            : 'Selecione uma data'}
        </h3>

        <ScrollArea className="h-[355px] w-[300px] rounded-md border">
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

                // Slot ocupado
                if (appointment && patient) {
                  return (
                    <AppointmentSlot
                      key={time}
                      time={time}
                      appointment={appointment}
                      patient={patient}
                      onClick={() => onTimeSelect(time, appointment)}
                    />
                  )
                }

                // Slot disponível
                return (
                  <AvailableSlot
                    key={time}
                    time={time}
                    onClick={() => onTimeSelect(time, null)}
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
```

**Motivo:** Componente principal menor e mais legível
**Impacto:** Nenhum - funcionalidade 100% idêntica

---

## 5. Otimizar Performance

### 5.1 Criar endpoint para buscar múltiplos pacientes

**Arquivo:** `app/api/patients/batch/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ids = searchParams.get('ids')?.split(',') || []

    if (ids.length === 0) {
      return NextResponse.json({ patients: [] })
    }

    const supabase = await createClient()

    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .in('id', ids)

    if (error) {
      console.error('Error fetching patients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch patients' },
        { status: 500 }
      )
    }

    return NextResponse.json({ patients: patients || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Motivo:** Eliminar N+1 queries (problema de performance)
**Impacto:** Melhoria de performance (1 requisição ao invés de N)

---

### 5.2 Atualizar useAppointments para usar batch endpoint

```typescript
// Em hooks/useAppointments.ts

// ANTES (N requisições):
for (const patientId of patientIds) {
  const patientRes = await fetch(`/api/patients?id=${patientId}`)
  // ...
}

// DEPOIS (1 requisição):
const patientsRes = await fetch(
  `/api/patients/batch?ids=${patientIds.join(',')}`
)
const patientsData = await patientsRes.json()

const patientsMap = new Map<string, Patient>()
patientsData.patients.forEach((patient: Patient) => {
  patientsMap.set(patient.id, patient)
})
```

**Motivo:** Reduzir chamadas à API
**Impacto:** Melhoria significativa de performance

---

## 6. Estrutura Final do Projeto

```
components/scheduling/
├── SchedulingTimeSlotPicker/
│   ├── index.tsx                    # Componente principal (~100 linhas)
│   ├── AppointmentSlot.tsx          # Slot ocupado (~100 linhas)
│   ├── AvailableSlot.tsx            # Slot livre (~20 linhas)
│   ├── config.ts                    # STATUS_CONFIG
│   └── constants.ts                 # Constantes
│
hooks/
└── useAppointments.ts               # Lógica de fetch
│
lib/utils/
└── timeSlots.ts                     # generateTimeSlots
│
app/api/patients/
├── route.ts                         # Endpoint único paciente
└── batch/
    └── route.ts                     # Endpoint múltiplos pacientes (NOVO)
```

---

## 7. Checklist de Implementação

- [ ] 1.1 Criar `constants.ts`
- [ ] 1.2 Criar `config.ts` e mover STATUS_CONFIG
- [ ] 2.1 Criar `lib/utils/timeSlots.ts`
- [ ] 3.1 Criar hook `useAppointments.ts`
- [ ] 4.1 Criar componente `AppointmentSlot.tsx`
- [ ] 4.2 Criar componente `AvailableSlot.tsx`
- [ ] 4.3 Refatorar componente principal `index.tsx`
- [ ] 5.1 Criar endpoint `app/api/patients/batch/route.ts`
- [ ] 5.2 Atualizar `useAppointments.ts` para usar batch
- [ ] ✅ Testar funcionalidade completa
- [ ] ✅ Verificar que comportamento é idêntico
- [ ] ✅ Commit com mensagem clara

---

## 8. Benefícios da Refatoração

### Antes:

- ❌ 1 arquivo com 328 linhas
- ❌ Múltiplas responsabilidades
- ❌ Difícil de testar
- ❌ N+1 queries (problema de performance)
- ❌ Magic numbers
- ❌ Lógica misturada com UI

### Depois:

- ✅ 7 arquivos pequenos e focados
- ✅ Cada arquivo com uma responsabilidade
- ✅ Fácil de testar (hooks e componentes isolados)
- ✅ 1 query ao invés de N (melhor performance)
- ✅ Constantes nomeadas
- ✅ Lógica separada da UI
- ✅ **Funcionalidade 100% idêntica**

---

## Notas Importantes

⚠️ **MANTER FUNCIONALIDADE IDÊNTICA**

- Não mudar comportamento
- Não alterar UI
- Não modificar lógica de negócio
- Apenas reorganizar código

✅ **Testar Após Cada Etapa**

- Testar após criar cada componente
- Verificar que tudo continua funcionando
- Fazer commits pequenos e incrementais

📝 **Commits Sugeridos**

```bash
git commit -m "refactor: extract timeSlots utility to lib/utils"
git commit -m "refactor: extract STATUS_CONFIG to separate config file"
git commit -m "refactor: create useAppointments custom hook"
git commit -m "refactor: extract AppointmentSlot component"
git commit -m "refactor: extract AvailableSlot component"
git commit -m "feat: add batch endpoint for patients API"
git commit -m "refactor: optimize useAppointments to use batch API"
```

---

**Prioridade:** 🟡 Média (melhoria de código, não bug)
**Esforço estimado:** 2-3 horas
**Risco:** 🟢 Baixo (refatoração sem mudanças de comportamento)
