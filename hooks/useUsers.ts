'use client'

import { createClient } from '@/lib/supabase/client'
import { User, UserRole } from '@/types'
import { useCallback, useEffect, useState } from 'react'

interface UseUsersFilters {
  role?: UserRole
  ativo?: boolean
  search?: string
  _timestamp?: number // Adicionado para forçar atualização
}

interface UseUsersResult {
  users: User[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  filters: UseUsersFilters
  setFilters: (filters: UseUsersFilters) => void
}

interface RawUserFromSupabase {
  id: string
  email: string
  name: string
  role: UserRole
  medical_license?: string
  phone?: string
  is_active: boolean
  is_blocked: boolean
  force_password_change: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export function useUsers(initialFilters: UseUsersFilters = {}): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<UseUsersFilters>(initialFilters)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role)
      }

      if (filters.ativo !== undefined) {
        query = query.eq('is_active', filters.ativo)
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,medical_license.ilike.%${filters.search}%`
        )
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      // Transform data from snake_case to camelCase
      const transformedData = data.map((user: RawUserFromSupabase) => ({
        ...user,
        isActive: user.is_active,
        isBlocked: user.is_blocked,
        forcePasswordChange: user.force_password_change,
      }))

      setUsers(transformedData || [])
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Erro ao carregar usuários')
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    filters,
    setFilters,
  }
}
