'use client'

import { Calendar, Users } from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { DemoLogo } from '@/components/DemoLogo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usePermissions } from '@/hooks/usePermissions'

const allNavItems = [
  {
    title: 'Agendamentos',
    url: '/dashboard/schedules',
    icon: Calendar,
  },
  {
    title: 'Usuários',
    url: '/dashboard/users',
    icon: Users,
    adminOnly: true,
  },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
  }
}) {
  const { permissions, loading } = usePermissions()

  const filteredNavItems = React.useMemo(() => {
    if (loading) {
      return []
    }
    if (permissions.isAdmin) {
      return allNavItems
    }
    return allNavItems.filter((item) => item.title === 'Agendamentos')
  }, [permissions.isAdmin, loading])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard/schedules">
                <DemoLogo variant="compact" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
