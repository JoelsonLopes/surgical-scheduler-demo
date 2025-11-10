'use client'

import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Shield, User } from 'lucide-react'

export function UserPermissions() {
  const { permissions, loading, error } = usePermissions()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissões do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Carregando permissões...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissões do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Erro ao carregar permissões
          </p>
        </CardContent>
      </Card>
    )
  }

  const permissionsList = [
    {
      key: 'isAdmin',
      label: 'Administrador',
      value: permissions.isAdmin,
    },
    {
      key: 'isDoctor',
      label: 'Médico',
      value: permissions.isDoctor,
    },
    {
      key: 'canManageUsers',
      label: 'Gerenciar usuários',
      value: permissions.canManageUsers,
    },
    {
      key: 'canManageSurgeries',
      label: 'Gerenciar cirurgias',
      value: permissions.canManageSurgeries,
    },
    {
      key: 'canManagePatients',
      label: 'Gerenciar pacientes',
      value: permissions.canManagePatients,
    },
    {
      key: 'canViewReports',
      label: 'Visualizar relatórios',
      value: permissions.canViewReports,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permissões do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Status */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Status:</span>
          <div className="flex gap-2">
            <Badge
              variant={permissions.isActive ? 'default' : 'secondary'}
              className="text-xs"
            >
              {permissions.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
            {permissions.isBlocked && (
              <Badge variant="destructive" className="text-xs">
                Bloqueado
              </Badge>
            )}
          </div>
        </div>

        {/* Permissions List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Permissões:</p>
          <div className="space-y-1">
            {permissionsList.map((permission) => (
              <div
                key={permission.key}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <span className="text-sm">{permission.label}</span>
                {permission.value ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warning if blocked or inactive */}
        {(permissions.isBlocked || !permissions.isActive) && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {permissions.isBlocked
                ? 'Sua conta está bloqueada. Entre em contato com o administrador.'
                : 'Sua conta está inativa. Entre em contato com o administrador.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
