import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="container flex max-w-4xl flex-col items-center gap-8 px-4 py-16 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Sistema de Gestão do Bloco Cirúrgico
          </h1>
          <p className="text-xl text-muted-foreground">SurgiScheduler Demo</p>
        </div>

        <div className="space-y-2 text-muted-foreground">
          <p className="text-lg">
            Gerencie agendamentos do bloco cirúrgico de forma eficiente e segura
          </p>
          <p className="text-sm">Performance • Segurança • Confiabilidade</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Acessar Sistema
          </Link>

          <Link
            href="/docs/prd-surgical-scheduler-demo.md"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Documentação
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-foreground">Performance</h3>
            <p className="text-sm text-muted-foreground">
              Respostas em menos de 200ms para operações críticas
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-foreground">Segurança</h3>
            <p className="text-sm text-muted-foreground">
              Proteção completa de dados conforme LGPD e HIPAA
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-foreground">
              Confiabilidade
            </h3>
            <p className="text-sm text-muted-foreground">
              Disponibilidade garantida de 99.9%
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} SurgiScheduler Demo. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  )
}
