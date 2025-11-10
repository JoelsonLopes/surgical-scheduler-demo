'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AdminFilterStatus,
  AdminSchedulingFilters,
  AppointmentWithDetails,
} from '@/types/admin'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckCircle,
  Eye,
  FileText,
  Pencil,
  XCircle,
  Calendar,
  Clock,
  User,
} from 'lucide-react'
import * as React from 'react'

interface AdminSchedulingPanelProps {
  onViewDetails: (appointment: AppointmentWithDetails) => void
  onApprove: (appointmentId: string) => void
  onReject: (appointmentId: string) => void
  onEdit: (appointment: AppointmentWithDetails) => void
  refreshTrigger?: number
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Aguardando',
    variant: 'secondary' as const,
    color: 'bg-yellow-100 text-yellow-800',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    variant: 'default' as const,
    color: 'bg-green-100 text-green-800',
  },
  REJEITADO: {
    label: 'Rejeitado',
    variant: 'destructive' as const,
    color: 'bg-red-100 text-red-800',
  },
  CANCELADO: {
    label: 'Cancelado',
    variant: 'outline' as const,
    color: 'bg-gray-100 text-gray-800',
  },
  CONCLUIDO: {
    label: 'Concluído',
    variant: 'outline' as const,
    color: 'bg-blue-100 text-blue-800',
  },
}

export function AdminSchedulingPanel({
  onViewDetails,
  onApprove,
  onReject,
  onEdit,
  refreshTrigger,
}: AdminSchedulingPanelProps) {
  const [appointments, setAppointments] = React.useState<
    AppointmentWithDetails[]
  >([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [doctors, setDoctors] = React.useState<
    Array<{ id: string; name: string }>
  >([])
  const [filters, setFilters] = React.useState<AdminSchedulingFilters>({
    status: 'ALL',
    dateFrom: null,
    dateTo: null,
    doctorId: null,
    patientSearch: '',
  })

  // Fetch doctors list
  React.useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors')
        if (response.ok) {
          const data = await response.json()
          setDoctors(
            data.doctors.map((user: { id: string; name: string }) => ({
              id: user.id,
              name: user.name,
            }))
          )
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
      }
    }

    fetchDoctors()
  }, [])

  // Fetch appointments based on filters
  React.useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()

        if (filters.status !== 'ALL') {
          params.append('status', filters.status)
        }
        if (filters.dateFrom) {
          params.append('dateFrom', filters.dateFrom)
        }
        if (filters.dateTo) {
          params.append('dateTo', filters.dateTo)
        }
        if (filters.doctorId) {
          params.append('doctorId', filters.doctorId)
        }
        if (filters.patientSearch) {
          params.append('patientSearch', filters.patientSearch)
        }

        const response = await fetch(`/api/admin/schedules?${params}`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments || [])
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [filters, refreshTrigger])

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value as AdminFilterStatus }))
  }

  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, patientSearch: e.target.value }))
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, dateFrom: e.target.value || null }))
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, dateTo: e.target.value || null }))
  }

  const handleDoctorChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      doctorId: value === 'ALL' ? null : value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      dateFrom: null,
      dateTo: null,
      doctorId: null,
      patientSearch: '',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Painel de Administração</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os agendamentos do bloco cirúrgico
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-lg font-semibold">Filtros</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Aguardando Aprovação</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="REJEITADO">Rejeitado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-from">Data Início</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom || ''}
              onChange={handleDateFromChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to">Data Fim</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo || ''}
              onChange={handleDateToChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor-filter">Médico</Label>
            <Select
              value={filters.doctorId || 'ALL'}
              onValueChange={handleDoctorChange}
            >
              <SelectTrigger id="doctor-filter">
                <SelectValue placeholder="Todos os médicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient-search">Buscar Paciente</Label>
            <Input
              id="patient-search"
              placeholder="Nome do paciente..."
              value={filters.patientSearch}
              onChange={handlePatientSearch}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Procedimento</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Documentos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Carregando agendamentos...
                </TableCell>
              </TableRow>
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum agendamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => {
                const statusConfig =
                  STATUS_CONFIG[
                    appointment.status as keyof typeof STATUS_CONFIG
                  ]

                return (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(
                              new Date(appointment.start_date_time),
                              'dd/MM/yyyy',
                              { locale: ptBR }
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(
                              new Date(appointment.start_date_time),
                              'HH:mm'
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {appointment.patient?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.patient?.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {appointment.procedure}
                    </TableCell>
                    <TableCell>{appointment.doctor?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {appointment.documents?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(appointment)}
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {appointment.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onApprove(appointment.id)}
                              title="Aprovar"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onReject(appointment.id)}
                              title="Rejeitar"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(appointment)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
