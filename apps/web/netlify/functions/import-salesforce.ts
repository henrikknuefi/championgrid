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
      .eq('provider', 'salesforce')
      .maybeSingle()

    const accessToken = (integ as any)?.access?.access_token
    const instanceUrl = (integ as any)?.access?.instance_url
    if (!accessToken || !instanceUrl) return { statusCode: 400, body: 'missing salesforce credentials' }

    const query = `SELECT Id,Email,FirstName,LastName,Title,Account.Name FROM Contact LIMIT ${limit}`
    const resp = await fetch(`${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    const data = await resp.json()
    if (!resp.ok) return { statusCode: resp.status, body: JSON.stringify(data) }

    const contacts = data.records || []
    let imported = 0

    for (const contact of contacts) {
      if (!contact.Email) continue

      const { data: champ } = await supabase
        .from('champions')
        .upsert({
          org_id,
          email: contact.Email,
          name: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim(),
          external_id: contact.Id
        }, { onConflict: 'org_id,email' })
        .select()
        .maybeSingle()

      if (champ && contact.Title && contact.Account?.Name) {
        await supabase.from('champion_positions').insert({
          champion_id: champ.id,
          company: contact.Account.Name,
          title: contact.Title,
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