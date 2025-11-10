/**
 * Status configuration for appointment display
 * Defines colors, labels, and styling for each appointment status
 */

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMADO'
  | 'REJEITADO'
  | 'CANCELADO'
  | 'CONCLUIDO'

interface StatusConfig {
  label: string
  bgClass: string
  badgeClass: string
  dotClass: string
}

export const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
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
