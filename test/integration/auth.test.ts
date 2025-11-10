import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { server } from './setup'
import { http, HttpResponse } from 'msw'

// Importar setup do MSW
import './setup'

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.session?.access_token).toBe('mock-access-token')
      expect(data.user?.email).toBe('test@example.com')
    })

    it('should fail login with invalid credentials', async () => {
      // Override do handler para simular erro
      const SUPABASE_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            {
              error: 'invalid_grant',
              error_description: 'Invalid login credentials',
            },
            { status: 400 }
          )
        })
      )

      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('Invalid login credentials')
      expect(data.session).toBeNull()
      expect(data.user).toBeNull()
    })

    it('should handle network errors during login', async () => {
      // Override do handler para simular erro de rede
      const SUPABASE_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.error()
        })
      )

      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(error).toBeDefined()
      expect(data.session).toBeNull()
      expect(data.user).toBeNull()
    })
  })

  describe('Logout Flow', () => {
    it('should successfully logout authenticated user', async () => {
      const supabase = createClient()

      // Primeiro fazer login
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      // Depois fazer logout
      const { error } = await supabase.auth.signOut()

      expect(error).toBeNull()
    })

    it('should handle logout errors gracefully', async () => {
      // Override do handler para simular erro
      const SUPABASE_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.json(
            {
              error: 'server_error',
              error_description: 'Internal server error',
            },
            { status: 500 }
          )
        })
      )

      const supabase = createClient()

      const { error } = await supabase.auth.signOut()

      expect(error).toBeDefined()
    })
  })

  describe('Session Management', () => {
    it('should retrieve current session', async () => {
      const supabase = createClient()

      // Fazer login primeiro
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      // Buscar sessão atual
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      expect(error).toBeNull()
      expect(session).toBeDefined()
      expect(session?.access_token).toBe('mock-access-token')
    })

    it.skip('should return null session when not authenticated', async () => {
      // Override handler para simular não autenticado
      const SUPABASE_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/session`, () => {
          return HttpResponse.json({
            access_token: null,
            refresh_token: null,
            user: null,
          })
        })
      )

      const supabase = createClient()

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      expect(error).toBeNull()
      // Session pode existir mas sem user autenticado
      expect(session?.user).toBeFalsy()
    })
  })

  describe('User Information', () => {
    it('should retrieve authenticated user data', async () => {
      const supabase = createClient()

      // Fazer login
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      // Buscar dados do usuário
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      expect(error).toBeNull()
      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
      expect(user?.id).toBe('mock-user-id')
    })

    it('should handle unauthorized access when fetching user', async () => {
      // Override do handler para simular não autenticado
      const SUPABASE_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(
            {
              error: 'unauthorized',
              error_description: 'User not authenticated',
            },
            { status: 401 }
          )
        })
      )

      const supabase = createClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      expect(error).toBeDefined()
      expect(user).toBeNull()
    })
  })
})
