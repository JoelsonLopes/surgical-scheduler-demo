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
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json(
        { message: 'If this email exists, the password has been reset' },
        { status: 200 }
      )
    }

    // Reset password using Supabase Admin API
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.id,
      {
        password: defaultPassword,
      }
    )

    if (resetError) {
      console.error('Password reset error:', resetError)
      return NextResponse.json({ error: resetError.message }, { status: 400 })
    }

    // Set force_password_change flag to true
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        force_password_change: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Error updating force_password_change flag:', updateError)
      // Don't fail the request if flag update fails
    }

    return NextResponse.json(
      {
        message: `Password has been reset to default password: ${defaultPassword}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
