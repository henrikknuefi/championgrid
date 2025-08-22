import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
  const { org_id, limit = 200 } = JSON.parse(event.body || '{}')
  if (!org_id) return { statusCode: 400, body: 'org_id required' }

  const { data: integ } = await supabase
    .from('integrations').select('access')
    .eq('org_id', org_id).eq('provider', 'hubspot').maybeSingle()
  const token = (integ as any)?.access?.access_token
  if (!token) return { statusCode: 400, body: 'missing hubspot token' }

  const url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}&properties=email,firstname,lastname,jobtitle,company`
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const json: any = await resp.json()
  if (!resp.ok) return { statusCode: resp.status, body: JSON.stringify(json) }

  const rows = (json.results || []).map((c:any) => ({
    email: (c.properties?.email || '').toLowerCase(),
    full_name: `${c.properties?.firstname || ''} ${c.properties?.lastname || ''}`.trim(),
    title: c.properties?.jobtitle || null,
    company: c.properties?.company || null,
  })).filter((r:any)=>r.email)

  const { error } = await supabase.from('champions').upsert(
    rows.map((r:any)=>({ org_id, email: r.email, full_name: r.full_name, source: 'crm' })),
    { onConflict: 'org_id,email' }
  )
  if (error) return { statusCode: 500, body: error.message }

  const { data: idx } = await supabase.from('champions').select('id,email').in('email', rows.map((r:any)=>r.email))
  const idByEmail = new Map((idx||[]).map((c:any)=>[c.email, c.id]))
  const positions = rows.filter((r:any)=>r.company || r.title).map((r:any)=>({ champion_id: idByEmail.get(r.email), company: r.company, title: r.title, is_current: true }))
  if (positions.length){
    const { error: posErr } = await supabase.from('champion_positions').insert(positions)
    if (posErr) return { statusCode: 500, body: posErr.message }
  }

  return { statusCode: 200, body: JSON.stringify({ imported: rows.length }) }
}
