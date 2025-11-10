import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'Dashboard - SurgiScheduler Demo',
  description: 'Sistema de Gestão do Bloco Cirúrgico',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get user data from users table
  let userData = {
    name: authUser?.email?.split('@')[0] || 'Usuário',
    email: authUser?.email || '',
  }

  if (authUser) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', authUser.id)
      .single()

    if (dbUser) {
      userData = dbUser
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
