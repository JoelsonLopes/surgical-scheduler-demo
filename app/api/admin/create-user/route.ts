import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'Demo@2024!'

// Create Supabase Admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role, medicalLicense, phone } = body

    // Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, name and role are required' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth with default password
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
          role,
        },
      })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create auth user' },
        { status: 500 }
      )
    }

    // Create user in users table with force_password_change = true
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id, // Use same ID as auth user
          email,
          name,
          role,
          medical_license: medicalLicense || null,
          phone: phone || null,
          is_active: true,
          is_blocked: false,
          force_password_change: true, // Force password change on first login
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error('User table insertion error:', userError)

      // Rollback: delete auth user if table insertion fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        user: userData,
        message: `User created successfully with default password: ${defaultPassword}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
