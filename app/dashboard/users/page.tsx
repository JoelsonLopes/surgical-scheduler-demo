'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserActions } from '@/components/users/UserActions'
import { UserForm } from '@/components/users/UserForm'
import { UserList } from '@/components/users/UserList'
import { useUserActions } from '@/hooks/useUserActions'
import { useUsers } from '@/hooks/useUsers'
import { User, UserRole } from '@/types'
import { UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [listKey, setListKey] = useState(Date.now())
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

  const { users, loading, refetch, setFilters } = useUsers({
    role: roleFilter === 'all' ? undefined : roleFilter,
    search: searchTerm || undefined,
  })

  // Atualizar filtros do hook quando searchTerm ou roleFilter mudarem
  useEffect(() => {
    setFilters({
      role: roleFilter === 'all' ? undefined : roleFilter,
      search: searchTerm || undefined,
    })
  }, [searchTerm, roleFilter, setFilters])

  const { createUser, updateUser, deleteUser, creating, updating } =
    useUserActions()

  const handleCreateUser = async (data: Parameters<typeof createUser>[0]) => {
    const result = await createUser(data)
    if (result) {
      toast.success('Usuário criado com sucesso!')
      setIsCreateDialogOpen(false)
      refetch()
    } else {
      toast.error('Erro ao criar usuário')
    }
  }

  const handleEditUser = async (data: Parameters<typeof createUser>[0]) => {
    if (!selectedUser) return

    const result = await updateUser(selectedUser.id, data)
    if (result) {
      toast.success('Usuário atualizado com sucesso!')
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      refetch()
    } else {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const handleActionAndRefetch = () => {
    refetch()
    setListKey(Date.now())
    setIsEditDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    const result = await deleteUser(userId)
    if (result) {
      toast.success('Usuário removido com sucesso!')
      refetch()
    } else {
      toast.error('Erro ao remover usuário')
    }
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie usuários do sistema de bloco cirúrgico
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Filtros</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Usuário</Label>
            <Input
              id="search"
              placeholder="Nome do usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário</Label>
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as UserRole | 'all')
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Administradores</SelectItem>
                <SelectItem value={UserRole.DOCTOR}>Médicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="flex-1"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} usuário(s) encontrado(s)
        </p>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* User List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        </div>
      ) : (
        <UserList
          key={listKey}
          users={users}
          onEdit={handleEditClick}
          onDelete={handleDeleteUser}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário do sistema
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreateUser}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize os dados do usuário</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleEditUser}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedUser(null)
              }}
              isLoading={updating}
            />
          )}
          {selectedUser && (
            <div className="mt-6 border-t pt-6">
              <h3 className="mb-4 text-lg font-medium">
                Ações Administrativas
              </h3>
              <UserActions
                user={selectedUser}
                onActionComplete={handleActionAndRefetch}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
