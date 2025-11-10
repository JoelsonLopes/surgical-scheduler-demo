// Base types for the surgical block scheduling system

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  medicalLicense?: string // Only for doctors
  phone?: string
  isActive: boolean
  isBlocked: boolean
  forcePasswordChange: boolean // Force password change on first login
  created_at: string
  updated_at: string
  lastLogin?: string
}

export interface Appointment {
  id: string
  doctorId: string
  patientName: string
  procedure: string
  startDateTime: string
  endDateTime: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

export interface CreateAppointmentInput {
  patientName: string
  procedure: string
  startDateTime: string
  endDateTime: string
  notes?: string
}

export interface UpdateAppointmentInput {
  patientName?: string
  procedure?: string
  startDateTime?: string
  endDateTime?: string
  notes?: string
  status?: AppointmentStatus
}
