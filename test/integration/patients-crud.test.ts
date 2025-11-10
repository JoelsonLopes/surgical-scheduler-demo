import { describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { server } from './setup'
import { http, HttpResponse } from 'msw'

// Importar setup do MSW
import './setup'

describe('Patients CRUD Integration Tests', () => {
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'

  let supabase: ReturnType<typeof createClient>

  beforeEach(() => {
    // Criar novo cliente antes de cada teste
    supabase = createClient()
    server.resetHandlers()
  })

  describe('Read Operations', () => {
    it('should fetch all patients', async () => {
      const { data, error } = await supabase.from('patients').select('*')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data!)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data![0]).toHaveProperty('id')
      expect(data![0]).toHaveProperty('name')
      expect(data![0]).toHaveProperty('cpf')
    })

    it.skip('should fetch single patient by id', async () => {
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json([
            {
              id: 1,
              name: 'João Silva',
              cpf: '123.456.789-00',
              birth_date: '1980-01-15',
              phone: '(11) 98765-4321',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', 1)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(1)
      expect(data.name).toBe('João Silva')
      expect(data.cpf).toBe('123.456.789-00')
    })

    it.skip('should search patient by CPF', async () => {
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json([
            {
              id: 1,
              name: 'João Silva',
              cpf: '123.456.789-00',
              birth_date: '1980-01-15',
              phone: '(11) 98765-4321',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('cpf', '123.456.789-00')
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.cpf).toBe('123.456.789-00')
    })

    it('should search patients by name pattern', async () => {
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json([
            {
              id: 1,
              name: 'João Silva',
              cpf: '123.456.789-00',
              birth_date: '1980-01-15',
              phone: '(11) 98765-4321',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('name', '%Silva%')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data![0].name).toContain('Silva')
    })

    it('should handle patient not found', async () => {
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json([])
        })
      )

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', 999)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(0)
    })
  })

  describe('Create Operations', () => {
    it('should create new patient', async () => {
      const newPatient = {
        name: 'Carlos Oliveira',
        cpf: '111.222.333-44',
        birth_date: '1990-03-10',
        phone: '(11) 99999-8888',
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(newPatient)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(3)
      expect(data.name).toBe(newPatient.name)
      expect(data.cpf).toBe(newPatient.cpf)
      expect(data).toHaveProperty('created_at')
    })

    it('should handle duplicate CPF error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json(
            {
              code: '23505',
              message:
                'duplicate key value violates unique constraint "patients_cpf_key"',
            },
            { status: 409 }
          )
        })
      )

      const duplicatePatient = {
        name: 'João Silva',
        cpf: '123.456.789-00', // CPF já existente
        birth_date: '1980-01-15',
        phone: '(11) 98765-4321',
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(duplicatePatient)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23505')
      expect(data).toBeNull()
    })

    it('should validate required fields', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json(
            {
              code: '23502',
              message:
                'null value in column "name" violates not-null constraint',
            },
            { status: 400 }
          )
        })
      )

      const invalidPatient = {
        cpf: '111.222.333-44',
        // name faltando (obrigatório)
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(invalidPatient)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23502')
      expect(data).toBeNull()
    })

    it('should create patient with complete information', async () => {
      const completePatient = {
        name: 'Ana Paula Costa',
        cpf: '555.666.777-88',
        birth_date: '1985-07-20',
        phone: '(11) 91111-2222',
        email: 'ana.costa@example.com',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(completePatient)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.name).toBe(completePatient.name)
      expect(data.email).toBe(completePatient.email)
    })
  })

  describe('Update Operations', () => {
    it('should update patient phone number', async () => {
      const { data, error } = await supabase
        .from('patients')
        .update({ phone: '(11) 99999-0000' })
        .eq('id', 1)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.phone).toBe('(11) 99999-0000')
      expect(data).toHaveProperty('updated_at')
    })

    it('should update patient address', async () => {
      const addressUpdate = {
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01310-100',
      }

      const { data, error } = await supabase
        .from('patients')
        .update(addressUpdate)
        .eq('id', 1)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.address).toBe(addressUpdate.address)
      expect(data.city).toBe(addressUpdate.city)
    })

    it('should prevent CPF update to duplicate', async () => {
      server.use(
        http.patch(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json(
            {
              code: '23505',
              message:
                'duplicate key value violates unique constraint "patients_cpf_key"',
            },
            { status: 409 }
          )
        })
      )

      const { data, error } = await supabase
        .from('patients')
        .update({ cpf: '987.654.321-00' }) // CPF já existente
        .eq('id', 1)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23505')
      expect(data).toBeNull()
    })

    it('should update multiple fields at once', async () => {
      const updates = {
        name: 'João Silva Santos',
        phone: '(11) 98888-7777',
        email: 'joao.silva@example.com',
      }

      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', 1)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.name).toBe(updates.name)
      expect(data.phone).toBe(updates.phone)
      expect(data.email).toBe(updates.email)
    })
  })

  describe('Delete Operations', () => {
    it('should delete patient by id', async () => {
      const { error } = await supabase.from('patients').delete().eq('id', 1)

      expect(error).toBeNull()
    })

    it('should prevent deletion with related surgeries', async () => {
      server.use(
        http.delete(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json(
            {
              code: '23503',
              message:
                'update or delete on table "patients" violates foreign key constraint',
            },
            { status: 409 }
          )
        })
      )

      const { error } = await supabase.from('patients').delete().eq('id', 1)

      expect(error).toBeDefined()
      expect(error?.code).toBe('23503')
    })

    it('should handle deletion of non-existent patient', async () => {
      const { error } = await supabase.from('patients').delete().eq('id', 999)

      expect(error).toBeNull()
    })
  })

  describe('Complex Queries', () => {
    it('should fetch patients ordered by name', async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data!)).toBe(true)
    })

    it('should fetch paginated patients', async () => {
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json([
            {
              id: 1,
              name: 'João Silva',
              cpf: '123.456.789-00',
              birth_date: '1980-01-15',
              phone: '(11) 98765-4321',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .range(0, 9)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.length).toBeLessThanOrEqual(10)
    })

    it.skip('should count total patients', async () => {
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json(
            [
              {
                id: 1,
                name: 'João Silva',
                cpf: '123.456.789-00',
              },
              {
                id: 2,
                name: 'Maria Santos',
                cpf: '987.654.321-00',
              },
            ],
            {
              headers: {
                'Content-Range': '0-1/2',
              },
            }
          )
        })
      )

      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

      expect(error).toBeNull()
      expect(count).toBeGreaterThanOrEqual(0)
    })

    it('should filter patients by birth year', async () => {
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json([
            {
              id: 1,
              name: 'João Silva',
              cpf: '123.456.789-00',
              birth_date: '1980-01-15',
              phone: '(11) 98765-4321',
            },
          ])
        })
      )

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .gte('birth_date', '1980-01-01')
        .lt('birth_date', '1981-01-01')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data!)).toBe(true)
    })
  })

  describe('Data Validation', () => {
    it('should validate CPF format', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json(
            {
              code: '22P02',
              message: 'invalid input syntax for type cpf',
            },
            { status: 400 }
          )
        })
      )

      const invalidPatient = {
        name: 'Test User',
        cpf: '123', // CPF inválido
        birth_date: '1990-01-01',
        phone: '(11) 99999-9999',
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(invalidPatient)
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it('should validate birth date format', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/patients`, () => {
          return HttpResponse.json(
            {
              code: '22007',
              message: 'invalid input syntax for type date',
            },
            { status: 400 }
          )
        })
      )

      const invalidPatient = {
        name: 'Test User',
        cpf: '123.456.789-00',
        birth_date: 'invalid-date',
        phone: '(11) 99999-9999',
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(invalidPatient)
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })
  })
})
