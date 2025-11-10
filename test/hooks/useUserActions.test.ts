import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUserActions } from '@/hooks/useUserActions'
import { UserRole } from '@/types'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase and audit logger
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/audit-logger', () => ({
  logUserAction: vi.fn(),
  AuditAction: {
    USER_CREATED: 'USER_CREATED',
    USER_UPDATED: 'USER_UPDATED',
    USER_DELETED: 'USER_DELETED',
    USER_ACTIVATED: 'USER_ACTIVATED',
    USER_DEACTIVATED: 'USER_DEACTIVATED',
    USER_BLOCKED: 'USER_BLOCKED',
    USER_UNBLOCKED: 'USER_UNBLOCKED',
  },
}))

describe('useUserActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create user successfully', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.DOCTOR,
      medicalLicense: '12345',
      isActive: true,
      isBlocked: false,
      forcePasswordChange: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    // Mock fetch for API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: mockUser,
        message:
          'User created successfully with default password: Lavinsky@1234',
      }),
    })

    const { result } = renderHook(() => useUserActions())

    let createdUser
    await act(async () => {
      createdUser = await result.current.createUser({
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.DOCTOR,
        medicalLicense: '12345',
      })
    })

    expect(createdUser).toEqual(mockUser)
    expect(result.current.creating).toBe(false)
  })

  it('should update user successfully', async () => {
    const mockUser = {
      id: '1',
      name: 'Updated User',
      email: 'updated@example.com',
      role: UserRole.ADMIN,
      isActive: true,
      isBlocked: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: mockUser, error: null })

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createClient>)

    const { result } = renderHook(() => useUserActions())

    let updatedUser
    await act(async () => {
      updatedUser = await result.current.updateUser('1', {
        name: 'Updated User',
      })
    })

    expect(updatedUser).toEqual(mockUser)
    expect(result.current.updating).toBe(false)
  })

  it('should delete user successfully', async () => {
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { email: 'test@example.com', name: 'Test User' },
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      }),
    } as unknown as ReturnType<typeof createClient>)

    const { result } = renderHook(() => useUserActions())

    let deleteResult
    await act(async () => {
      deleteResult = await result.current.deleteUser('1')
    })

    expect(deleteResult).toBe(true)
    expect(result.current.deleting).toBe(false)
  })

  it('should handle create error', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Database error',
      }),
    })

    const { result } = renderHook(() => useUserActions())

    let createdUser
    await act(async () => {
      createdUser = await result.current.createUser({
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.DOCTOR,
        medicalLicense: '12345',
      })
    })

    expect(createdUser).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('should toggle user status', async () => {
    const mockUserData = {
      data: { email: 'test@example.com' },
      error: null,
    }

    const mockUpdate = vi.fn().mockResolvedValue({ error: null })

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockUserData),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      }),
    } as unknown as ReturnType<typeof createClient>)

    const { result } = renderHook(() => useUserActions())

    let statusResult
    await act(async () => {
      statusResult = await result.current.toggleUserStatus('1', false)
    })

    expect(statusResult).toBe(true)
    expect(result.current.updating).toBe(false)
  })

  it('should toggle user block', async () => {
    const mockUserData = {
      data: { email: 'test@example.com' },
      error: null,
    }

    const mockUpdate = vi.fn().mockResolvedValue({ error: null })

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockUserData),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      }),
    } as unknown as ReturnType<typeof createClient>)

    const { result } = renderHook(() => useUserActions())

    let blockResult
    await act(async () => {
      blockResult = await result.current.toggleUserBlock('1', true)
    })

    expect(blockResult).toBe(true)
    expect(result.current.updating).toBe(false)
  })
})
