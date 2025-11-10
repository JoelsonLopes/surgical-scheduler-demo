import { useUsers } from '@/hooks/useUsers'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useUsers', () => {
  const mockUsersFromDb = [
    {
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      is_active: true,
      is_blocked: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'doctor@test.com',
      name: 'Doctor User',
      role: UserRole.DOCTOR,
      medical_license: '12345',
      specialty: 'Cardiology',
      is_active: true,
      is_blocked: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ]

  const mockUsers = [
    {
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      is_active: true,
      is_blocked: false,
      isActive: true,
      isBlocked: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'doctor@test.com',
      name: 'Doctor User',
      role: UserRole.DOCTOR,
      medical_license: '12345',
      specialty: 'Cardiology',
      is_active: true,
      is_blocked: false,
      isActive: true,
      isBlocked: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch users successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: mockUsersFromDb, error: null })

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as unknown as ReturnType<typeof createClient>)

    mockSelect.mockReturnValue({
      order: mockOrder,
    })

    const { result } = renderHook(() => useUsers())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.users).toEqual(mockUsers)
    expect(result.current.error).toBeNull()
  })

  it('should accept filters parameter', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: mockUsersFromDb, error: null })

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    } as unknown as ReturnType<typeof createClient>)

    const { result } = renderHook(() => useUsers({ role: UserRole.ADMIN }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verify hook accepts filters parameter
    expect(result.current.filters.role).toBe(UserRole.ADMIN)
  })

  it('should handle errors', async () => {
    const mockError = new Error('Database error')
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: null, error: mockError })

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    } as unknown as ReturnType<typeof createClient>)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.users).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('should provide refetch function', async () => {
    const mockOrder = vi
      .fn()
      .mockResolvedValue({ data: mockUsersFromDb, error: null })

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    } as unknown as ReturnType<typeof createClient>)

    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verify refetch function exists
    expect(typeof result.current.refetch).toBe('function')
  })
})
