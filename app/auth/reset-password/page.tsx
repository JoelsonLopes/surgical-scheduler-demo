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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Erro ao resetar senha', {
          description:
            data.error || 'Ocorreu um erro ao tentar resetar a senha.',
        })
        setIsLoading(false)
        return
      }

      // Sucesso - senha resetada
      setPasswordReset(true)
      setSuccessMessage(data.message)
      toast.success('Senha resetada com sucesso!', {
        description: 'Faça login com a senha padrão: Demo@2024!',
      })
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
        <div className="flex flex-col items-center justify-center space-y-4">
          <DemoLogo />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Sistema de Gestão do Bloco Cirúrgico
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Recuperação de senha
            </p>
          </div>
        </div>

        {/* Card de Recuperação */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {passwordReset ? 'Senha Resetada!' : 'Esqueceu sua senha?'}
            </CardTitle>
            <CardDescription>
              {passwordReset
                ? 'Sua senha foi resetada com sucesso'
                : 'Digite seu e-mail para resetar sua senha'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!passwordReset ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                <Button
                  type="submit"
                  className="h-11 w-full font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetando...' : 'Resetar Senha'}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm text-primary hover:underline"
                  >
                    ← Voltar para o login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg bg-primary/10 p-4 text-sm text-foreground">
                  <p className="mb-2 font-semibold">
                    Senha resetada para:{' '}
                    <span className="text-primary">{email}</span>
                  </p>
                  <p className="text-muted-foreground">{successMessage}</p>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="mb-2 text-sm font-medium">
                    Instruções para acessar:
                  </p>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                        1
                      </span>
                      <span>
                        Clique em &quot;Voltar para o login&quot; abaixo
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                        2
                      </span>
                      <span>
                        Use a senha padrão:{' '}
                        <strong className="text-foreground">Demo@2024!</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                        3
                      </span>
                      <span>
                        Você será redirecionado para criar uma nova senha
                        personalizada
                      </span>
                    </li>
                  </ol>
                </div>

                <Button
                  className="h-11 w-full font-semibold"
                  onClick={() => router.push('/auth/login')}
                >
                  Voltar para o Login
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Precisa de ajuda?{' '}
                <Link href="#" className="text-primary hover:underline">
                  Fale com o suporte
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} SurgiScheduler Demo. Todos os direitos
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
