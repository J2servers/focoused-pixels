import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const EmailSchema = z.object({
  email: z.string().email().max(255),
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const parsed = EmailSchema.safeParse(body)
    
    if (!parsed.success) {
      // Never reveal validation details - just reject
      return new Response(
        JSON.stringify({ allowed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // 1. Check if user exists in auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Auth lookup error:', userError)
      return new Response(
        JSON.stringify({ allowed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const user = users.users.find(u => u.email === parsed.data.email)
    
    if (!user) {
      // User doesn't exist - reject silently (don't reveal)
      return new Response(
        JSON.stringify({ allowed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. Check if user has admin/editor/support role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ allowed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const allowedRoles = ['admin', 'editor', 'support']
    const isAllowed = allowedRoles.includes(roleData.role)

    return new Response(
      JSON.stringify({ allowed: isAllowed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Gate check error:', error)
    return new Response(
      JSON.stringify({ allowed: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
