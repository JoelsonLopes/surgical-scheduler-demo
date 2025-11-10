'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { User, UserRole } from '@/types'
import {
  Pencil,
  Trash2,
  Mail,
  User as UserIcon,
  Stethoscope,
} from 'lucide-react'

interface UserListProps {
  users: User[]
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
}

const ROLE_CONFIG = {
  [UserRole.ADMIN]: {
    label: 'Administrador',
    variant: 'default' as const,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  [UserRole.DOCTOR]: {
    label: 'Médico',
    variant: 'secondary' as const,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
}

const STATUS_CONFIG = {
  blocked: {
    label: 'Bloqueado',
    variant: 'destructive' as const,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  active: {
    label: 'Ativo',
    variant: 'default' as const,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  inactive: {
    label: 'Inativo',
    variant: 'secondary' as const,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  },
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  const getStatusKey = (user: User): 'blocked' | 'active' | 'inactive' => {
    if (user.isBlocked) return 'blocked'
    if (user.isActive) return 'active'
    return 'inactive'
  }

  const getRoleIcon = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      return <UserIcon className="h-4 w-4" />
    }
    return <Stethoscope className="h-4 w-4" />
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">CRM</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground"
              >
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const roleConfig = ROLE_CONFIG[user.role]
              const statusKey = getStatusKey(user)
              const statusConfig = STATUS_CONFIG[statusKey]

              return (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <Badge
                        variant={roleConfig.variant}
                        className={roleConfig.color}
                      >
                        {roleConfig.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.medicalLicense || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusConfig.variant}
                      className={statusConfig.color}
                    >
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                          title="Editar usuário"
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(user.id)}
                          title="Remover usuário"
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
