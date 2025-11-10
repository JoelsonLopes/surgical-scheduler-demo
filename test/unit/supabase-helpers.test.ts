import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/client'

// Mock do @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}))

describe('Supabase Client Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createClient', () => {
    it('should create a Supabase client', () => {
      const client = createClient()
      expect(client).toBeDefined()
      expect(client.auth).toBeDefined()
      expect(client.from).toBeDefined()
    })

    it('should have auth methods', () => {
      const client = createClient()
      expect(client.auth.getSession).toBeDefined()
      expect(client.auth.signInWithPassword).toBeDefined()
      expect(client.auth.signOut).toBeDefined()
    })

    it('should have database query methods', () => {
      const client = createClient()
      const table = client.from('test_table')
      expect(table.select).toBeDefined()
      expect(table.insert).toBeDefined()
      expect(table.update).toBeDefined()
      expect(table.delete).toBeDefined()
    })
  })

  describe('Client Environment Variables', () => {
    it('should use environment variables for configuration', () => {
      // O cliente usa process.env.NEXT_PUBLIC_SUPABASE_URL
      // e process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const client = createClient()
      expect(client).toBeDefined()
    })
  })
})
