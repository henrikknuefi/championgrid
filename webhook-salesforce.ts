import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event) => {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const body = JSON.parse(event.body || '{}')
  const org_id = body.org_id
  const contacts = body.contacts || []
  if (!org_id) return { statusCode: 400, body: 'org_id required' }

  const rows = contacts.map((c:any) => ({
    email: (c.email||'').toLowerCase(),
    full_name: `${c.firstName||''} ${c.lastName||''}`.trim(),
    title: c.title || null,
    company: c.accountName || null,
  })).filter((r:any)=>r.email)

  if (!rows.length) return { statusCode: 200, body: 'ok' }
  const { error } = await supabase.from('champions').upsert(rows.map((r:any)=>({ org_id, email: r.email, full_name: r.full_name, source: 'crm' })), { onConflict: 'org_id,email' })
  if (error) return { statusCode: 500, body: error.message }

  const { data: idx } = await supabase.from('champions').select('id,email').in('email', rows.map((r:any)=>r.email))
  const map = new Map((idx||[]).map((c:any)=>[c.email,c.id]))
  const positions = rows.filter((r:any)=>r.company||r.title).map((r:any)=>({ champion_id: map.get(r.email), company: r.company, title: r.title, is_current: true }))
  if (positions.length){ await supabase.from('champion_positions').insert(positions) }

  return { statusCode: 200, body: 'ingested' }
}
