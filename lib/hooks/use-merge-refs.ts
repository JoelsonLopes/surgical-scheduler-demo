import * as React from 'react'

export function useMergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return React.useCallback(
    (value: T) => {
      for (const ref of refs) {
        if (typeof ref === 'function') {
          ref(value)
        } else if (ref) {
          ;(ref as React.MutableRefObject<T>).current = value
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  )
}
