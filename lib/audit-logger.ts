'use client'

import { createClient } from '@/lib/supabase/client'

export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_BLOCKED = 'USER_BLOCKED',
  USER_UNBLOCKED = 'USER_UNBLOCKED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ROLE_CHANGED = 'ROLE_CHANGED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
}

interface AuditLogEntry {
  action: AuditAction
  actor_id: string
  actor_email: string
  target_user_id?: string
  target_user_email?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}

/**
 * Log audit events to console or external service
 * For production, consider sending to a dedicated logging service
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString()

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[AUDIT LOG]', {
      timestamp,
      ...entry,
    })
  }

  // In production, you could send to:
  // - Supabase table (requires creating audit_logs table)
  // - External logging service (e.g., LogRocket, Sentry)
  // - File system
  // - Analytics platform

  // Example: Store in localStorage for development
  try {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]')
    logs.push({ timestamp, ...entry })

    // Keep only last 100 logs
    const recentLogs = logs.slice(-100)
    localStorage.setItem('audit_logs', JSON.stringify(recentLogs))
  } catch (error) {
    console.error('Failed to store audit log:', error)
  }
}

/**
 * Helper to get current user info for audit logging
 */
export async function getCurrentUserInfo(): Promise<{
  id: string
  email: string
} | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    return {
      id: user.id,
      email: user.email || 'unknown',
    }
  } catch (error) {
    console.error('Failed to get current user info:', error)
    return null
  }
}

/**
 * Helper to log user management actions
 */
export async function logUserAction(
  action: AuditAction,
  targetUserId?: string,
  targetUserEmail?: string,
  details?: Record<string, unknown>
): Promise<void> {
  const currentUser = await getCurrentUserInfo()

  if (!currentUser) {
    console.warn('Cannot log audit event: no authenticated user')
    return
  }

  await logAuditEvent({
    action,
    actor_id: currentUser.id,
    actor_email: currentUser.email,
    target_user_id: targetUserId,
    target_user_email: targetUserEmail,
    details,
  })
}

/**
 * Get audit logs from localStorage (for development)
 */
export function getAuditLogs(): Array<{
  timestamp: string
  action: AuditAction
  actor_email: string
  target_user_email?: string
  details?: Record<string, unknown>
}> {
  try {
    const logs = localStorage.getItem('audit_logs')
    return logs ? JSON.parse(logs) : []
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error)
    return []
  }
}

/**
 * Clear audit logs from localStorage
 */
export function clearAuditLogs(): void {
  try {
    localStorage.removeItem('audit_logs')
  } catch (error) {
    console.error('Failed to clear audit logs:', error)
  }
}
