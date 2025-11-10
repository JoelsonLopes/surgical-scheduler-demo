import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/reset-password',
    '/api/admin/reset-password',
  ]
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith('/auth')
  )

  // Allow change-password page for authenticated users
  const isChangePasswordPage = request.nextUrl.pathname === '/change-password'

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Check if user needs to change password (first login)
  if (user && !isPublicRoute && !isChangePasswordPage) {
    const { data: userData } = await supabase
      .from('users')
      .select('force_password_change')
      .eq('id', user.id)
      .single()

    if (userData?.force_password_change) {
      const url = request.nextUrl.clone()
      url.pathname = '/change-password'
      return NextResponse.redirect(url)
    }
  }

  const adminRoutes = ['/dashboard/users']
  const isAdminRoute = adminRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (user && isAdminRoute) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, is_active, is_blocked, force_password_change')
      .eq('email', user.email)
      .single()

    if (userError || !userData) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/schedules'
      return NextResponse.redirect(url)
    }

    // If user needs to change password, redirect to change-password page
    if (userData.force_password_change) {
      const url = request.nextUrl.clone()
      url.pathname = '/change-password'
      return NextResponse.redirect(url)
    }

    if (
      !userData.is_active ||
      userData.is_blocked ||
      userData.role !== 'ADMIN'
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/schedules'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
