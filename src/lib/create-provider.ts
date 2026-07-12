import { createServerFn } from '@tanstack/react-start'

type CreateProviderInput = {
  email: string
  businessName: string
  categoryId: string | null
  city: string
  phone: string
  whatsapp: string
  website: string
  bio: string
  tier: number
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const createProviderFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateProviderInput) => data)
  .handler(async (ctx) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const data = ctx.data
    const tempPassword = generateTempPassword()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
    })
    if (authError) throw new Error(authError.message)
    const userId = authData.user.id

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role: 'service_provider' as const })
    if (roleError) throw new Error(roleError.message)

    const { error: profileError } = await supabaseAdmin
      .from('provider_profiles')
      .insert({
        user_id: userId,
        business_name: data.businessName,
        category_id: data.categoryId || null,
        city: data.city || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        bio: data.bio || null,
        tier: data.tier,
        verified: data.tier > 1,
      })
    if (profileError) throw new Error(profileError.message)

    return { userId, tempPassword, email: data.email }
  })
