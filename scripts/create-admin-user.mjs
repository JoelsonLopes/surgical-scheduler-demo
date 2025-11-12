import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env.local file
const envFile = readFileSync('.env.local', 'utf-8')

const envVars = {}
envFile.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  try {
    // Create user in auth.users using Admin API
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: 'admin@demo.surgischeduler.app',
        password: 'Demo@2024!',
        email_confirm: true,
        user_metadata: {
          name: 'Administrador Demo',
          role: 'ADMIN',
        },
      })

    if (authError) {
      console.error('Error creating auth user:', authError)
      process.exit(1)
    }

    console.log('✅ User created in auth.users:', authData.user.id)

    // Create user in public.users
    const { error: dbError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: 'admin@demo.surgischeduler.app',
      name: 'Administrador Demo',
      role: 'ADMIN',
      is_active: true,
      is_blocked: false,
      force_password_change: false,
    })

    if (dbError) {
      console.error('Error creating public user:', dbError)
      process.exit(1)
    }

    console.log('✅ User created in public.users')
    console.log('\n📧 Email: admin@demo.surgischeduler.app')
    console.log('🔑 Password: Demo@2024!')
    console.log('🆔 User ID:', authData.user.id)
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createAdminUser()
