'use client'

import * as React from 'react'
import { useMask } from '@react-input/mask'

import { Input } from '@/components/ui/input'
import { useMergeRefs } from '@/lib/hooks/use-merge-refs'

export interface MaskedInputProps extends React.ComponentProps<'input'> {
  mask: string
  replacement: Record<string, RegExp>
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, replacement, ...props }, ref) => {
    const localRef = useMask({ mask, replacement })
    const mergedRef = useMergeRefs(localRef, ref)
    return <Input {...props} ref={mergedRef} />
  }
)

MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }
