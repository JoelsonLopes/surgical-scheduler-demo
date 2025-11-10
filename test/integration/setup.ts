import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { beforeAll, afterEach, afterAll } from 'vitest'

// URL base do Supabase (mockada)
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

// Handlers padrão para APIs do Supabase
export const handlers = [
  // Auth endpoints
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role: 'authenticated',
      },
    })
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@example.com',
      role: 'authenticated',
    })
  }),

  // Database endpoints - Surgeries
  http.get(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
    return HttpResponse.json([
      {
        id: 1,
        patient_name: 'João Silva',
        procedure: 'Cirurgia Cardíaca',
        scheduled_date: '2025-10-20',
        status: 'scheduled',
      },
      {
        id: 2,
        patient_name: 'Maria Santos',
        procedure: 'Cirurgia Ortopédica',
        scheduled_date: '2025-10-21',
        status: 'scheduled',
      },
    ])
  }),

  http.post(`${SUPABASE_URL}/rest/v1/surgeries`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        id: 3,
        ...body,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/surgeries`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      id: 1,
      ...body,
      updated_at: new Date().toISOString(),
    })
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Database endpoints - Patients
  http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'João Silva',
        cpf: '123.456.789-00',
        birth_date: '1980-01-15',
        phone: '(11) 98765-4321',
      },
      {
        id: 2,
        name: 'Maria Santos',
        cpf: '987.654.321-00',
        birth_date: '1975-05-20',
        phone: '(11) 91234-5678',
      },
    ])
  }),

  http.post(`${SUPABASE_URL}/rest/v1/patients`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        id: 3,
        ...body,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/patients`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      id: 1,
      ...body,
      updated_at: new Date().toISOString(),
    })
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/patients`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]

// Configurar servidor MSW
export const server = setupServer(...handlers)

// Configurar hooks do Vitest
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
