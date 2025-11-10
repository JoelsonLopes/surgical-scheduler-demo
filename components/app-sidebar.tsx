'use client'

import { Calendar, Users } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
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
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard/schedules">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <Image
                    src="/logo-header.png"
                    alt="Clínica Lavinsky"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Clínica Lavinsky
                  </span>
                  <span className="truncate text-xs">Bloco Cirúrgico</span>
                </div>
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
