import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { refreshGoogle, refreshMicrosoft, refreshSalesforce, refreshHubSpot } from './_lib/oauth'

export const handler: Handler = async () => {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: conns } = await supabase.from('integrations').select('id, org_id, provider, access')
  if (!conns?.length) return { statusCode: 200, body: 'no integrations' }

  for (const c of conns){
    const acc = (c as any).access || {}
    if (!acc.refresh_token) continue
    try {
      let updated: any
      if (c.provider === 'gmail') updated = await refreshGoogle(acc.refresh_token, process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!)
      if (c.provider === 'outlook') updated = await refreshMicrosoft(acc.refresh_token, process.env.MICROSOFT_CLIENT_ID!, process.env.MICROSOFT_CLIENT_SECRET!)
      if (c.provider === 'salesforce') updated = await refreshSalesforce(acc.refresh_token, process.env.SALESFORCE_CLIENT_ID!, process.env.SALESFORCE_CLIENT_SECRET!)
      if (c.provider === 'hubspot') updated = await refreshHubSpot(acc.refresh_token, process.env.HUBSPOT_CLIENT_ID!, process.env.HUBSPOT_CLIENT_SECRET!)
      if (updated){
        const next = { ...acc, ...updated, refreshed_at: new Date().toISOString() }
        await supabase.from('integrations').update({ access: next }).eq('id', c.id)
      }
    } catch (e){ /* ignore */ }
  }
  return { statusCode: 200, body: 'refreshed' }
}