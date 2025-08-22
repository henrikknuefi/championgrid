import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

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
      .eq('provider', 'gmail')
      .maybeSingle()

    const accessToken = (integ as any)?.access?.access_token
    if (!accessToken) return { statusCode: 400, body: 'missing gmail oauth token' }

    const raw = [
      `To: ${to}`,
      'Content-Type: text/html; charset="UTF-8"',
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n')

    const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: base64UrlEncode(raw) })
    })
    const json = await resp.json()
    if (!resp.ok) return { statusCode: resp.status, body: JSON.stringify(json) }

    return { statusCode: 200, body: JSON.stringify({ ok: true, id: json.id }) }
  } catch (e: any) { return { statusCode: 500, body: e.message } }
}