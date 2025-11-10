'use client'

import { UserFormValues } from '@/components/users/UserForm'
import { AuditAction, logUserAction } from '@/lib/audit-logger'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/types'
import { useState } from 'react'

interface UseUserActionsResult {
  creating: boolean
  updating: boolean
  deleting: boolean
  error: Error | null
  createUser: (data: UserFormValues) => Promise<User | null>
  updateUser: (
    id: string,
    data: Partial<UserFormValues>
  ) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>
  toggleUserStatus: (id: string, isActive: boolean) => Promise<boolean>
  toggleUserBlock: (id: string, isBlocked: boolean) => Promise<boolean>
}

export function useUserActions(): UseUserActionsResult {
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createUser = async (data: UserFormValues): Promise<User | null> => {
    try {
      setCreating(true)
      setError(null)

      // Call API route to create user with default password
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          role: data.role,
          medicalLicense: data.medicalLicense || null,
          phone: data.phone || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creating user')
      }

      const { user: newUser } = await response.json()

      // Log audit event
      await logUserAction(AuditAction.USER_CREATED, newUser.id, newUser.email, {
        role: newUser.role,
        name: newUser.name,
      })

      return newUser
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('Error creating user')
      setError(errorMessage)
      return null
    } finally {
      setCreating(false)
    }
  }

  const updateUser = async (
    id: string,
    data: Partial<UserFormValues>
  ): Promise<User | null> => {
    try {
      setUpdating(true)
      setError(null)

      const supabase = createClient()

      const updateData: Record<string, unknown> = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.email !== undefined) updateData.email = data.email
      if (data.role !== undefined) updateData.role = data.role
      if (data.medicalLicense !== undefined)
        updateData.medical_license = data.medicalLicense || null
      if (data.phone !== undefined) updateData.phone = data.phone || null

      updateData.updated_at = new Date().toISOString()

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Log audit event
      await logUserAction(
        AuditAction.USER_UPDATED,
        updatedUser.id,
        updatedUser.email,
        {
          updates: updateData,
        }
      )

      return updatedUser
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('Error updating user')
      setError(errorMessage)
      return null
    } finally {
      setUpdating(false)
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setDeleting(true)
      setError(null)

      // Call API route to delete user from both Auth and database
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error deleting user')
      }

      const { user: userData } = await response.json()

      // Log audit event
      if (userData) {
        await logUserAction(AuditAction.USER_DELETED, id, userData.email, {
          name: userData.name,
        })
      }

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('Error deleting user')
      setError(errorMessage)
      return false
    } finally {
      setDeleting(false)
    }
  }

  const toggleUserStatus = async (
    id: string,
    isActive: boolean
  ): Promise<boolean> => {
    try {
      setUpdating(true)
      setError(null)

      const supabase = createClient()

      // Get user data for audit log
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', id)
        .single()

      const { error: updateError } = await supabase
        .from('users')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      // Log audit event
      if (userData) {
        await logUserAction(
          isActive ? AuditAction.USER_ACTIVATED : AuditAction.USER_DEACTIVATED,
          id,
          userData.email,
          { isActive }
        )
      }

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('Error changing user status')
      setError(errorMessage)
      return false
    } finally {
      setUpdating(false)
    }
  }

  const toggleUserBlock = async (
    id: string,
    isBlocked: boolean
  ): Promise<boolean> => {
    try {
      setUpdating(true)
      setError(null)

      const supabase = createClient()

      // Get user data for audit log
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', id)
        .single()

      const { error: updateError } = await supabase
        .from('users')
        .update({ is_blocked: isBlocked, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      // Log audit event
      if (userData) {
        await logUserAction(
          isBlocked ? AuditAction.USER_BLOCKED : AuditAction.USER_UNBLOCKED,
          id,
          userData.email,
          { isBlocked }
        )
      }

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('Error blocking/unblocking user')
      setError(errorMessage)
      return false
    } finally {
      setUpdating(false)
    }
  }

  return {
    creating,
    updating,
    deleting,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    toggleUserBlock,
  }
}
