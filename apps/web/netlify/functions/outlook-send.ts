import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { org_id, to, subject, body } = JSON.parse(event.body || '{}')
    if (!org_id || !to || !subject || !body) return { statusCode: 400, body: 'missing fields' }

    const { data: integ } = await supabase
      .from('integrations')
      .select('access')
      .eq('org_id', org_id)
      .eq('provider', 'outlook')
      .maybeSingle()

    const accessToken = (integ as any)?.access?.access_token
    if (!accessToken) return { statusCode: 400, body: 'missing outlook oauth token' }

    const resp = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: 'HTML', content: body },
          toRecipients: [{ emailAddress: { address: to } }]
        },
        saveToSentItems: true
      })
    })
    const json = await resp.json().catch(()=>({}))
    if (!resp.ok) return { statusCode: resp.status, body: JSON.stringify(json) }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (e: any) { return { statusCode: 500, body: e.message } }
}