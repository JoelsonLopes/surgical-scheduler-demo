// ============================================
// Database Types - Lavinsky Bloco Cirúrgico
// Auto-generated from Supabase schema
// ============================================

// ============================================
// ENUM Types
// ============================================

export type InsuranceType =
  | 'BRADESCO_SAUDE'
  | 'MEDSENIOR'
  | 'CABERGS_SAUDE'
  | 'POSTAL_SAUDE'
  | 'UNIMED'
  | 'DANAMED'
  | 'SUL_AMERICA'

export type AppointmentStatus =
  | 'PENDENTE'
  | 'PENDING'
  | 'CONFIRMADO'
  | 'REJEITADO'
  | 'CANCELADO'
  | 'CONCLUIDO'

export type HistoryAction =
  | 'CREATED'
  | 'UPDATED'
  | 'STATUS_CHANGED'
  | 'CANCELLED'
  | 'COMPLETED'

export type UserRole = 'ADMIN' | 'MEDICO' | 'DOCTOR'

// ============================================
// Table Types
// ============================================

export interface Patient {
  id: string
  name: string
  birth_date: string // DATE stored as ISO string
  phone: string // Format: (XX) XXXXX-XXXX
  cpf: string | null // Format: XXX.XXX.XXX-XX
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  procedure: string
  start_date_time: string // TIMESTAMPTZ as ISO string
  end_date_time: string // TIMESTAMPTZ as ISO string
  estimated_duration: string // INTERVAL as PostgreSQL interval string
  insurance: InsuranceType
  special_needs: string | null
  status: AppointmentStatus
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentHistory {
  id: string
  appointment_id: string
  changed_by: string | null
  action: HistoryAction
  old_status: AppointmentStatus | null
  new_status: AppointmentStatus | null
  notes: string | null
  created_at: string
}

export interface AppointmentDocument {
  id: string
  appointment_id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  uploaded_by: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  medical_license: string | null
  phone: string | null
  is_active: boolean
  is_blocked: boolean
  created_at: string
  updated_at: string
  last_login: string | null
  force_password_change: boolean | null
}

// ============================================
// Extended Types with Relations
// ============================================

export interface AppointmentWithDetails extends Appointment {
  patient: Patient
  doctor: Pick<User, 'id' | 'name' | 'email' | 'medical_license'>
  approved_by_user?: Pick<User, 'id' | 'name' | 'email'> | null
}

export interface AppointmentWithHistory extends AppointmentWithDetails {
  history: AppointmentHistory[]
}

export interface AppointmentWithDocuments extends AppointmentWithDetails {
  documents: AppointmentDocument[]
}

export interface AppointmentComplete extends AppointmentWithDetails {
  history: AppointmentHistory[]
  documents: AppointmentDocument[]
}

// ============================================
// View Types
// ============================================

export interface PendingAppointmentSummary {
  id: string
  start_date_time: string
  end_date_time: string
  procedure: string
  status: AppointmentStatus
  doctor_name: string
  doctor_email: string
  patient_name: string
  patient_phone: string
  insurance: InsuranceType
  created_at: string
}

export interface ConfirmedAppointmentCalendar {
  id: string
  start_date_time: string
  end_date_time: string
  procedure: string
  doctor_name: string
  patient_name: string
  special_needs: string | null
  appointment_date: string // DATE as ISO string
}

// ============================================
// Function Return Types
// ============================================

export interface TimeSlot {
  time_slot: string // Format: HH:MM
  is_available: boolean
}

// ============================================
// Insert Types (for creating new records)
// ============================================

export type PatientInsert = Omit<Patient, 'id' | 'created_at' | 'updated_at'>

export type AppointmentInsert = Omit<
  Appointment,
  'id' | 'created_at' | 'updated_at' | 'estimated_duration'
>

export type AppointmentDocumentInsert = Omit<
  AppointmentDocument,
  'id' | 'created_at'
>

// ============================================
// Update Types (for updating existing records)
// ============================================

export type PatientUpdate = Partial<PatientInsert>

export type AppointmentUpdate = Partial<
  Omit<AppointmentInsert, 'doctor_id' | 'patient_id'>
>

// ============================================
// API Request/Response Types
// ============================================

export interface CreateAppointmentRequest {
  // Patient info
  patientName: string
  birthDate: string // DD/MM/YYYY
  patientPhone: string // (XX) XXXXX-XXXX

  // Appointment details
  procedure: string
  selectedDate: string // ISO date
  selectedTime: string // HH:MM
  estimatedEndTime: string // HH:MM

  // Additional info
  insurance: InsuranceType
  specialNeeds: string

  // Optional
  documents?: File[]
}

export interface CreateAppointmentResponse {
  appointment: AppointmentWithDetails
  message: string
}

export interface CheckAvailabilityRequest {
  date: string // ISO date
  startTime: string // HH:MM
  endTime: string // HH:MM
}

export interface CheckAvailabilityResponse {
  available: boolean
  conflicts: {
    start: string
    end: string
    procedure: string
  }[]
}

export interface AvailableSlotsRequest {
  date: string // ISO date
  startHour?: number // Default: 7
  endHour?: number // Default: 14
  slotDuration?: number // Default: 30
}

export interface AvailableSlotsResponse {
  slots: TimeSlot[]
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null

export type WithTimestamps<T> = T & {
  created_at: string
  updated_at: string
}

// Insurance display names
export const INSURANCE_LABELS: Record<InsuranceType, string> = {
  BRADESCO_SAUDE: 'Bradesco Saúde',
  MEDSENIOR: 'MedSênior',
  CABERGS_SAUDE: 'Cabergs Saúde',
  POSTAL_SAUDE: 'Postal Saúde',
  UNIMED: 'Unimed',
  DANAMED: 'Danamed',
  SUL_AMERICA: 'Sul América',
}

// Status display names
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDENTE: 'Pendente',
  PENDING: 'Pendente',
  CONFIRMADO: 'Confirmado',
  REJEITADO: 'Rejeitado',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluído',
}

// Status colors for UI
export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDENTE: 'yellow',
  PENDING: 'yellow',
  CONFIRMADO: 'green',
  REJEITADO: 'red',
  CANCELADO: 'gray',
  CONCLUIDO: 'blue',
}
