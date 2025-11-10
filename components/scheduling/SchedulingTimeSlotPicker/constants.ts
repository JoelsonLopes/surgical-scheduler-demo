/**
 * Constants for SchedulingTimeSlotPicker component
 * Centralized configuration for time slots and scheduling limits
 */

export const TIME_SLOT_CONFIG = {
  /** Start hour for available time slots (7:00 AM) */
  START_HOUR: 7,

  /** End hour for available time slots (2:00 PM / 14:00) */
  END_HOUR: 14,

  /** Interval between time slots in minutes */
  INTERVAL_MINUTES: 30,
} as const

export const SCHEDULING_LIMITS = {
  /** Maximum number of appointments to fetch per day */
  MAX_APPOINTMENTS_PER_DAY: 100,
} as const
