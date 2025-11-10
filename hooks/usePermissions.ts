'use client'

import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types'
import { useCallback, useEffect, useState } from 'react'

interface UserPermissions {
  isAdmin: boolean
  isDoctor: boolean
  canManageUsers: boolean
  canManageSurgeries: boolean
  canManagePatients: boolean
  canViewReports: boolean
  isActive: boolean
  isBlocked: boolean
}

interface UsePermissionsResult {
  permissions: UserPermissions
  loading: boolean
  error: Error | null
  hasPermission: (permission: keyof UserPermissions) => boolean
  hasRole: (role: UserRole) => boolean
  refetch: () => Promise<void>
}

const defaultPermissions: UserPermissions = {
  isAdmin: false,
  isDoctor: false,
  canManageUsers: false,
  canManageSurgeries: false,
  canManagePatients: false,
  canViewReports: false,
  isActive: false,
  isBlocked: true,
}

export function usePermissions(): UsePermissionsResult {
  const [permissions, setPermissions] =
    useState<UserPermissions>(defaultPermissions)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      // Get current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, is_active, is_blocked')
        .eq('email', user.email)
        .single()

      if (userError || !userData) {
        throw new Error('User data not found')
      }

      const isAdmin = userData.role === UserRole.ADMIN
      const isDoctor = userData.role === UserRole.DOCTOR
      const isActive = userData.is_active
      const isBlocked = userData.is_blocked

      setUserRole(userData.role)

      // Define permissions based on role and status
      setPermissions({
        isAdmin,
        isDoctor,
        canManageUsers: isAdmin && isActive && !isBlocked,
        canManageSurgeries: (isAdmin || isDoctor) && isActive && !isBlocked,
        canManagePatients: (isAdmin || isDoctor) && isActive && !isBlocked,
        canViewReports: (isAdmin || isDoctor) && isActive && !isBlocked,
        isActive,
        isBlocked,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Error loading permissions')
      )
      setPermissions(defaultPermissions)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const hasPermission = useCallback(
    (permission: keyof UserPermissions): boolean => {
      return permissions[permission] === true
    },
    [permissions]
  )

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return userRole === role
    },
    [userRole]
  )

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasRole,
    refetch: fetchPermissions,
  }
}
