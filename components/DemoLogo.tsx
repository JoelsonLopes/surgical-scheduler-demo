import React from 'react'

interface DemoLogoProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function DemoLogo({ variant = 'default', className = '' }: DemoLogoProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none">SurgiScheduler</span>
          <span className="text-xs text-muted-foreground leading-none">DEMO</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 shadow-lg">
        <svg
          className="h-12 w-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-2xl font-bold tracking-tight">SurgiScheduler</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
            DEMO VERSION
          </span>
        </div>
      </div>
    </div>
  )
}
