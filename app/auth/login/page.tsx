'use client'

import { DemoLogo } from '@/components/DemoLogo'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro ao fazer login:', error)
        toast.error('Erro ao fazer login', {
          description:
            error.message === 'Invalid login credentials'
              ? 'Email ou senha incorretos.'
              : error.message ||
                'Ocorreu um erro ao tentar fazer login. Tente novamente.',
        })
        return
      }

      // Update last_login in users table
      if (data.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Error updating last_login:', updateError)
        }
      }

      // Login bem-sucedido
      toast.success('Login realizado com sucesso!', {
        description: 'Você será redirecionado para o sistema.',
      })

      // Redirecionar todos os usuários para agendamentos após login
      setTimeout(() => {
        router.push('/dashboard/schedules')
      }, 500)
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast.error('Erro inesperado', {
        description:
          'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <DemoLogo />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Card de Login */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@demo.surgischeduler.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/auth/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Problemas para acessar?{' '}
                <Link href="#" className="text-primary hover:underline">
                  Entre em contato com o suporte
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} SurgiScheduler Demo. Projeto de
            portfólio.
          </p>
          <p className="mt-1">
            Sistema seguro e em conformidade com LGPD/HIPAA
          </p>
        </div>
      </div>
    </div>
  )
}
