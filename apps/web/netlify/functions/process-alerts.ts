import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

async function sendSlack(webhookUrl: string, text: string) {
  await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
}

export const handler: Handler = async () => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { data: alerts } = await supabase
      .from('alerts')
      .select(`
        id, org_id, event_id, champion_id, type, created_at,
        champions (name, email),
        events (type, payload, occurred_at)
      `)
      .eq('status', 'pending')

    if (!alerts?.length) return { statusCode: 200, body: 'no pending alerts' }

    for (const alert of alerts) {
      try {
        const { data: org } = await supabase
          .from('integrations')
          .select('webhook_url')
          .eq('org_id', alert.org_id)
          .eq('provider', 'slack')
          .maybeSingle()

        if (org?.webhook_url) {
          const champion = (alert as any).champions
          const event = (alert as any).events
          
          let message = `🚨 Champion Alert: ${champion?.name || 'Unknown'}`
          if (event?.type === 'company_change') {
            message += ` moved from ${event.payload?.old_company} to ${event.payload?.new_company}`
          }
          message += ` - ${new Date(event?.occurred_at).toLocaleDateString()}`

          await sendSlack(org.webhook_url, message)
          await supabase.from('alerts').update({ status: 'sent' }).eq('id', alert.id)
        } else {
          await supabase.from('alerts').update({ status: 'error', error: 'no slack webhook' }).eq('id', alert.id)
        }
      } catch (e) {
        await supabase.from('alerts').update({ status: 'error', error: String(e) }).eq('id', alert.id)
      }
    }

    return { statusCode: 200, body: `processed ${alerts.length} alerts` }
  } catch (e: any) {
    return { statusCode: 500, body: e.message }
  }
}