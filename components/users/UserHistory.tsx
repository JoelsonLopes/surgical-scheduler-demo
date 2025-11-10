'use client'

import { useEffect, useState } from 'react'
import { getAuditLogs, AuditAction } from '@/lib/audit-logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, User, UserPlus, UserMinus, UserCheck } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserHistoryProps {
  userId?: string
  limit?: number
}

const getActionLabel = (action: AuditAction): string => {
  const labels: Record<AuditAction, string> = {
    [AuditAction.USER_CREATED]: 'Usuário criado',
    [AuditAction.USER_UPDATED]: 'Usuário atualizado',
    [AuditAction.USER_DELETED]: 'Usuário deletado',
    [AuditAction.USER_ACTIVATED]: 'Usuário ativado',
    [AuditAction.USER_DEACTIVATED]: 'Usuário desativado',
    [AuditAction.USER_BLOCKED]: 'Usuário bloqueado',
    [AuditAction.USER_UNBLOCKED]: 'Usuário desbloqueado',
    [AuditAction.PASSWORD_RESET]: 'Senha resetada',
    [AuditAction.ROLE_CHANGED]: 'Função alterada',
    [AuditAction.LOGIN_SUCCESS]: 'Login bem-sucedido',
    [AuditAction.LOGIN_FAILED]: 'Falha no login',
    [AuditAction.LOGOUT]: 'Logout',
  }
  return labels[action] || action
}

const getActionIcon = (action: AuditAction) => {
  switch (action) {
    case AuditAction.USER_CREATED:
      return <UserPlus className="h-4 w-4" />
    case AuditAction.USER_DELETED:
      return <UserMinus className="h-4 w-4" />
    case AuditAction.USER_ACTIVATED:
    case AuditAction.USER_UNBLOCKED:
      return <UserCheck className="h-4 w-4" />
    default:
      return <User className="h-4 w-4" />
  }
}

const getActionVariant = (
  action: AuditAction
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (action) {
    case AuditAction.USER_CREATED:
    case AuditAction.USER_ACTIVATED:
    case AuditAction.USER_UNBLOCKED:
      return 'default'
    case AuditAction.USER_DELETED:
    case AuditAction.USER_BLOCKED:
    case AuditAction.USER_DEACTIVATED:
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function UserHistory({ userId, limit = 50 }: UserHistoryProps) {
  const [logs, setLogs] = useState<
    Array<{
      timestamp: string
      action: AuditAction
      actor_email: string
      target_user_email?: string
      details?: Record<string, unknown>
    }>
  >([])

  useEffect(() => {
    const allLogs = getAuditLogs()

    // Filter by userId if provided
    const filteredLogs = userId
      ? allLogs.filter(
          (log) =>
            log.target_user_email?.includes(userId) ||
            log.actor_email?.includes(userId)
        )
      : allLogs

    // Sort by timestamp descending (most recent first)
    const sortedLogs = filteredLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Apply limit
    setLogs(sortedLogs.slice(0, limit))
  }, [userId, limit])

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma ação registrada ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Ações
          <Badge variant="secondary" className="ml-auto">
            {logs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="rounded-full bg-muted p-2">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getActionVariant(log.action)}
                      className="text-xs"
                    >
                      {getActionLabel(log.action)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), 'PPp', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{log.actor_email}</span>
                    {log.target_user_email && (
                      <>
                        {' '}
                        →{' '}
                        <span className="text-muted-foreground">
                          {log.target_user_email}
                        </span>
                      </>
                    )}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
