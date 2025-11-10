/**
 * Types for Admin functionality
 * Used in AdminSchedulingPanel and related components
 */

import { Appointment, Patient, AppointmentDocument } from './database'

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMADO'
  | 'REJEITADO'
  | 'CANCELADO'
  | 'CONCLUIDO'

export type AdminFilterStatus = AppointmentStatus | 'ALL'

export interface AdminSchedulingFilters {
  status: AdminFilterStatus
  dateFrom: string | null // ISO date string
  dateTo: string | null // ISO date string
  doctorId: string | null
  patientSearch: string
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient
  doctor: {
    id: string
    name: string
    email: string
  }
  documents: AppointmentDocument[]
}

export interface AdminAppointmentAction {
  type: 'approve' | 'reject' | 'edit' | 'delete' | 'view'
  appointmentId: string
}
