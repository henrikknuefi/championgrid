import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { org_id, limit = 100 } = JSON.parse(event.body || '{}')

    const { data: integ } = await supabase
      .from('integrations')
      .select('access')
      .eq('org_id', org_id)
      .eq('provider', 'hubspot')
      .maybeSingle()

    const accessToken = (integ as any)?.access?.access_token
    if (!accessToken) return { statusCode: 400, body: 'missing hubspot access token' }

    const resp = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}&properties=email,firstname,lastname,jobtitle,company`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    const data = await resp.json()
    if (!resp.ok) return { statusCode: resp.status, body: JSON.stringify(data) }

    const contacts = data.results || []
    let imported = 0

    for (const contact of contacts) {
      const props = contact.properties
      if (!props?.email) continue

      const { data: champ } = await supabase
        .from('champions')
        .upsert({
          org_id,
          email: props.email,
          name: `${props.firstname || ''} ${props.lastname || ''}`.trim(),
          external_id: contact.id
        }, { onConflict: 'org_id,email' })
        .select()
        .maybeSingle()

      if (champ && props.jobtitle && props.company) {
        await supabase.from('champion_positions').insert({
          champion_id: champ.id,
          company: props.company,
          title: props.jobtitle,
          is_current: true
        }).onConflict('champion_id,company,title').doNothing()
      }
      imported++
    }

    return { statusCode: 200, body: JSON.stringify({ imported, total: contacts.length }) }
  } catch (e: any) {
    return { statusCode: 500, body: e.message }
  }
}