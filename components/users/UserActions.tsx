'use client'

import { useState } from 'react'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { KeyRound, Unlock, Lock, UserCheck, UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { logUserAction, AuditAction } from '@/lib/audit-logger'

interface UserActionsProps {
  user: User
  onActionComplete?: () => void
}

export function UserActions({ user, onActionComplete }: UserActionsProps) {
  const [resettingPassword, setResettingPassword] = useState(false)
  const [togglingBlock, setTogglingBlock] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)

  const handleResetPassword = async () => {
    try {
      setResettingPassword(true)
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      // Log audit event
      await logUserAction(AuditAction.PASSWORD_RESET, user.id, user.email)

      toast.success(
        `Email de reset de senha enviado para ${user.email}. Verifique também a pasta de spam.`,
        { duration: 5000 }
      )
      onActionComplete?.()
    } catch (error) {
      console.error('Reset password error:', error)

      // Provide more detailed error message
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido'

      toast.error(
        `Erro ao enviar email de reset de senha: ${errorMessage}. Verifique se o email está configurado no Supabase.`,
        { duration: 7000 }
      )
    } finally {
      setResettingPassword(false)
    }
  }

  const handleToggleBlock = async () => {
    try {
      setTogglingBlock(true)
      const supabase = createClient()

      const newBlockedStatus = !user.isBlocked

      const { error } = await supabase
        .from('users')
        .update({
          is_blocked: newBlockedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      // Log audit event
      await logUserAction(
        newBlockedStatus
          ? AuditAction.USER_BLOCKED
          : AuditAction.USER_UNBLOCKED,
        user.id,
        user.email,
        { isBlocked: newBlockedStatus }
      )

      toast.success(
        `Usuário ${newBlockedStatus ? 'bloqueado' : 'desbloqueado'} com sucesso!`
      )
      onActionComplete?.()
    } catch (error) {
      console.error('Toggle block error:', error)
      toast.error('Erro ao alterar status de bloqueio')
    } finally {
      setTogglingBlock(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      setTogglingStatus(true)
      const supabase = createClient()

      const newActiveStatus = !user.isActive

      const { error } = await supabase
        .from('users')
        .update({
          is_active: newActiveStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      // Log audit event
      await logUserAction(
        newActiveStatus
          ? AuditAction.USER_ACTIVATED
          : AuditAction.USER_DEACTIVATED,
        user.id,
        user.email,
        { isActive: newActiveStatus }
      )

      toast.success(
        `Usuário ${newActiveStatus ? 'ativado' : 'desativado'} com sucesso!`
      )
      onActionComplete?.()
    } catch (error) {
      console.error('Toggle status error:', error)
      toast.error('Erro ao alterar status do usuário')
    } finally {
      setTogglingStatus(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Reset Password */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={resettingPassword}>
            <KeyRound className="mr-2 h-4 w-4" />
            Reset Senha
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar senha do usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Um email será enviado para {user.email} com instruções para
              redefinir a senha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              Enviar Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Block Status */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={user.isBlocked ? 'default' : 'destructive'}
            size="sm"
            disabled={togglingBlock}
          >
            {user.isBlocked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Desbloquear
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Bloquear
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isBlocked ? 'Desbloquear' : 'Bloquear'} usuário?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.isBlocked
                ? 'O usuário poderá acessar o sistema novamente.'
                : 'O usuário não poderá mais acessar o sistema até ser desbloqueado.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleBlock}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Active Status */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={user.isActive ? 'outline' : 'default'}
            size="sm"
            disabled={togglingStatus}
          >
            {user.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isActive ? 'Desativar' : 'Ativar'} usuário?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.isActive
                ? 'O usuário será marcado como inativo no sistema.'
                : 'O usuário será marcado como ativo no sistema.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
