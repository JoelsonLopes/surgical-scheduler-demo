'use client'

import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface AvailableSlotProps {
  time: string
  onSelect: (time: string) => void
}

/**
 * AvailableSlot component - Displays an available (unoccupied) time slot
 * Simple button that triggers selection callback when clicked
 */
export function AvailableSlot({ time, onSelect }: AvailableSlotProps) {
  return (
    <Button
      variant="outline"
      className="justify-start transition-colors hover:bg-accent"
      onClick={() => onSelect(time)}
    >
      <Clock className="mr-2 h-4 w-4" />
      {time}
    </Button>
  )
}
