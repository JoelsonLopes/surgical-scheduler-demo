import { describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { server } from './setup'
import { http, HttpResponse } from 'msw'

// Importar setup do MSW
import './setup'

describe('Surgeries CRUD Integration Tests', () => {
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

  let supabase: ReturnType<typeof createClient>

  beforeEach(() => {
    // Criar novo cliente antes de cada teste
    supabase = createClient()
    // Reset handlers antes de cada teste
    server.resetHandlers()
  })

  describe('Read Operations', () => {
    it('should fetch all surgeries', async () => {
      const { data, error } = await supabase.from('surgeries').select('*')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data![0]).toHaveProperty('id')
      expect(data![0]).toHaveProperty('patient_name')
      expect(data![0]).toHaveProperty('procedure')
    })

    it.skip('should fetch single surgery by id', async () => {
      // Override handler para retornar cirurgia específica
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json([
            {
              id: 1,
              patient_name: 'João Silva',
              procedure: 'Cirurgia Cardíaca',
              scheduled_date: '2025-10-20',
              status: 'scheduled',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('surgeries')
        .select('*')
        .eq('id', 1)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(1)
      expect(data.patient_name).toBe('João Silva')
    })

    it('should filter surgeries by status', async () => {
      // Override handler para retornar cirurgias filtradas
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json([
            {
              id: 1,
              patient_name: 'João Silva',
              procedure: 'Cirurgia Cardíaca',
              scheduled_date: '2025-10-20',
              status: 'scheduled',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('surgeries')
        .select('*')
        .eq('status', 'scheduled')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.every((s) => s.status === 'scheduled')).toBe(true)
    })

    it('should handle empty results', async () => {
      // Override handler para retornar array vazio
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json([])
        })
      )

      const { data, error } = await supabase
        .from('surgeries')
        .select('*')
        .eq('id', 999)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(0)
    })
  })

  describe('Create Operations', () => {
    it('should create new surgery', async () => {
      const newSurgery = {
        patient_name: 'Pedro Costa',
        procedure: 'Cirurgia Geral',
        scheduled_date: '2025-10-25',
        status: 'scheduled',
      }

      const { data, error } = await supabase
        .from('surgeries')
        .insert(newSurgery)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(3)
      expect(data.patient_name).toBe(newSurgery.patient_name)
      expect(data.procedure).toBe(newSurgery.procedure)
      expect(data).toHaveProperty('created_at')
    })

    it('should handle validation errors when creating surgery', async () => {
      // Override handler para simular erro de validação
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json(
            {
              code: '23502',
              message:
                'null value in column "patient_name" violates not-null constraint',
            },
            { status: 400 }
          )
        })
      )

      const invalidSurgery = {
        procedure: 'Cirurgia',
        // patient_name faltando (obrigatório)
      }

      const { data, error } = await supabase
        .from('surgeries')
        .insert(invalidSurgery)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23502')
      expect(data).toBeNull()
    })

    it('should create multiple surgeries', async () => {
      // Override handler para aceitar array
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/surgeries`, async ({ request }) => {
          const body = await request.json()
          const surgeries = Array.isArray(body) ? body : [body]

          return HttpResponse.json(
            surgeries.map((s, index) => ({
              id: 10 + index,
              ...s,
              created_at: new Date().toISOString(),
            })),
            { status: 201 }
          )
        })
      )

      const newSurgeries = [
        {
          patient_name: 'Ana Silva',
          procedure: 'Cirurgia A',
          scheduled_date: '2025-11-01',
          status: 'scheduled',
        },
        {
          patient_name: 'Carlos Souza',
          procedure: 'Cirurgia B',
          scheduled_date: '2025-11-02',
          status: 'scheduled',
        },
      ]

      const { data, error } = await supabase
        .from('surgeries')
        .insert(newSurgeries)
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(2)
    })
  })

  describe('Update Operations', () => {
    it('should update surgery status', async () => {
      const { data, error } = await supabase
        .from('surgeries')
        .update({ status: 'completed' })
        .eq('id', 1)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.status).toBe('completed')
      expect(data).toHaveProperty('updated_at')
    })

    it('should update multiple fields', async () => {
      const updates = {
        status: 'cancelled',
        notes: 'Patient requested cancellation',
      }

      const { data, error } = await supabase
        .from('surgeries')
        .update(updates)
        .eq('id', 1)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.status).toBe(updates.status)
      expect(data.notes).toBe(updates.notes)
    })

    it('should handle update of non-existent record', async () => {
      // Override handler para retornar vazio
      server.use(
        http.patch(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json([])
        })
      )

      const { data, error } = await supabase
        .from('surgeries')
        .update({ status: 'completed' })
        .eq('id', 999)
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(0)
    })
  })

  describe('Delete Operations', () => {
    it('should delete surgery by id', async () => {
      const { error } = await supabase.from('surgeries').delete().eq('id', 1)

      expect(error).toBeNull()
    })

    it('should delete multiple surgeries with filter', async () => {
      const { error } = await supabase
        .from('surgeries')
        .delete()
        .eq('status', 'cancelled')

      expect(error).toBeNull()
    })

    it('should handle deletion of non-existent record', async () => {
      const { error } = await supabase.from('surgeries').delete().eq('id', 999)

      expect(error).toBeNull()
    })

    it('should prevent deletion with foreign key constraint', async () => {
      // Override handler para simular erro de constraint
      server.use(
        http.delete(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json(
            {
              code: '23503',
              message:
                'update or delete on table "surgeries" violates foreign key constraint',
            },
            { status: 409 }
          )
        })
      )

      const { error } = await supabase.from('surgeries').delete().eq('id', 1)

      expect(error).toBeDefined()
      expect(error?.code).toBe('23503')
    })
  })

  describe('Complex Queries', () => {
    it('should fetch surgeries with ordering', async () => {
      const { data, error } = await supabase
        .from('surgeries')
        .select('*')
        .order('scheduled_date', { ascending: true })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data!)).toBe(true)
    })

    it('should fetch paginated results', async () => {
      // Override handler para simular paginação
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json([
            {
              id: 1,
              patient_name: 'João Silva',
              procedure: 'Cirurgia Cardíaca',
              scheduled_date: '2025-10-20',
              status: 'scheduled',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('surgeries')
        .select('*')
        .range(0, 9)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.length).toBeLessThanOrEqual(10)
    })

    it('should search surgeries by patient name', async () => {
      // Override handler para simular busca
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/surgeries`, () => {
          return HttpResponse.json([
            {
              id: 1,
              patient_name: 'João Silva',
              procedure: 'Cirurgia Cardíaca',
              scheduled_date: '2025-10-20',
              status: 'scheduled',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('surgeries')
        .select('*')
        .ilike('patient_name', '%Silva%')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data![0].patient_name).toContain('Silva')
    })
  })
})
