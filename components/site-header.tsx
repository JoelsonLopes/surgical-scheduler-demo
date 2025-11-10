'use client'

import { PanelLeft } from 'lucide-react'
import Image from 'next/image'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import { ThemeToggle } from './theme-toggle'

interface SiteHeaderProps {
  breadcrumbs?: {
    title: string
    href?: string
  }[]
}

export function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Abrir/Fechar Menu</span>
        </Button>

        {/* Logo e nome - visível em todas as telas */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center">
            <Image
              src="/logo-header.png"
              alt="Clínica Lavinsky"
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Clínica Lavinsky</span>
            <span className="text-xs text-muted-foreground">
              Bloco Cirúrgico
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="mr-2 h-4" />
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 || !crumb.href ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
