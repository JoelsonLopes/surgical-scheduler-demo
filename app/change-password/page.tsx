'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export default function ChangePasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Check if user needs to change password
      const { data: userData } = await supabase
        .from('users')
        .select('force_password_change')
        .eq('id', user.id)
        .single()

      if (userData && !userData.force_password_change) {
        // User doesn't need to change password, redirect to dashboard
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [router, supabase])

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'A senha deve ter no mínimo 8 caracteres'
    }
    if (!/[A-Z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula'
    }
    if (!/[a-z]/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula'
    }
    if (!/[0-9]/.test(password)) {
      return 'A senha deve conter pelo menos um número'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'A senha deve conter pelo menos um caractere especial'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        toast.error('As senhas não coincidem')
        return
      }

      // Validate password strength
      const validationError = validatePassword(newPassword)
      if (validationError) {
        toast.error(validationError)
        return
      }

      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw updateError
      }

      // Update force_password_change flag in users table
      if (userId) {
        const { error: dbError } = await supabase
          .from('users')
          .update({
            force_password_change: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (dbError) {
          console.error('Error updating user flag:', dbError)
          toast.error(
            'Senha atualizada, mas houve um erro ao atualizar o perfil'
          )
          throw dbError
        }
      }

      toast.success('Senha alterada com sucesso!')

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Erro ao alterar senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative h-24 w-full overflow-hidden rounded-lg">
            <Image
              src="/logo-lavinsky.jpg"
              alt="Clínica Lavinsky"
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="w-full rounded-lg"
              priority
            />
          </div>
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Alteração de Senha Obrigatória
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Por segurança, você precisa alterar sua senha padrão antes de
              continuar
            </p>
          </div>
        </div>

        {/* Card de Troca de Senha */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
            <CardDescription>
              Crie uma senha forte para proteger sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    disabled={loading}
                    className="h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    disabled={loading}
                    className="h-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="mb-2 font-medium">Requisitos da senha:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-current" />
                    Mínimo 8 caracteres
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-current" />
                    Pelo menos uma letra maiúscula
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-current" />
                    Pelo menos uma letra minúscula
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-current" />
                    Pelo menos um número
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-current" />
                    Pelo menos um caractere especial (!@#$%^&*)
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="h-11 w-full font-semibold"
                disabled={loading}
              >
                {loading ? 'Alterando Senha...' : 'Alterar Senha e Continuar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Clínica Lavinsky. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">
            Sistema seguro e em conformidade com LGPD/HIPAA
          </p>
        </div>
      </div>
    </div>
  )
}
