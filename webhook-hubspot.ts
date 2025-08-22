import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event) => {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const body = JSON.parse(event.body || '[]')
  for (const ev of body){
    const org_id = ev.orgId || ev.org_id
    if (!org_id) continue
    const email = (ev.object?.email || ev.email || '').toLowerCase()
    if (!email) continue
    const full_name = `${ev.object?.firstname||''} ${ev.object?.lastname||''}`.trim()
    const title = ev.object?.jobtitle || null
    const company = ev.object?.company || null
    await supabase.from('champions').upsert({ org_id, email, full_name, source: 'crm' }, { onConflict: 'org_id,email' })
    if (company || title){
      const { data: c } = await supabase.from('champions').select('id').eq('org_id', org_id).eq('email', email).maybeSingle()
      if (c?.id){ await supabase.from('champion_positions').insert({ champion_id: c.id, company, title, is_current: true }) }
    }
  }
  return { statusCode: 200, body: 'ok' }
}
