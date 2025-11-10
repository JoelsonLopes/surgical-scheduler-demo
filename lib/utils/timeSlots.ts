/**
 * Utility functions for generating and managing time slots
 */

/**
 * Generates an array of time slots between start and end hours
 *
 * @param start - Starting hour (0-23)
 * @param end - Ending hour (0-23)
 * @param interval - Interval in minutes between slots
 * @returns Array of time strings in HH:mm format
 *
 * @example
 * generateTimeSlots(7, 14, 30)
 * // Returns: ['07:00', '07:30', '08:00', ..., '13:30']
 */
export const generateTimeSlots = (
  start: number,
  end: number,
  interval: number
): string[] => {
  const slots: string[] = []

  for (let hour = start; hour < end; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
  }

  return slots
}
