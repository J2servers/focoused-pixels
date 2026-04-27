import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const ResetSchema = z.object({
  target_user_id: z.string().uuid(),
  new_password: z.string().min(8).max(128),
})

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const __pre = handlePreflight(req);
  if (__pre) return __pre;

  try {
    // 1. Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify caller's JWT using anon client
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Sessão inválida' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // 2. Check caller is admin
    const adminClient = createClient(supabaseUrl, serviceKey)
    const { data: callerRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single()

    if (!callerRole || callerRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem redefinir senhas' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // 3. Parse and validate body
    const body = await req.json()
    const parsed = ResetSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { target_user_id, new_password } = parsed.data

    // 4. Prevent admin from resetting their own password via this endpoint
    if (target_user_id === caller.id) {
      return new Response(
        JSON.stringify({ error: 'Não é possível redefinir sua própria senha por aqui. Use o login.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 5. Verify target user has an admin role (only reset admin users)
    const { data: targetRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', target_user_id)
      .single()

    if (!targetRole) {
      return new Response(
        JSON.stringify({ error: 'Usuário alvo não encontrado no sistema' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 6. Reset password using admin API
    const { error: updateError } = await adminClient.auth.admin.updateUserById(target_user_id, {
      password: new_password,
    })

    if (updateError) {
      console.error('Password reset error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao redefinir senha' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Admin reset password error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
