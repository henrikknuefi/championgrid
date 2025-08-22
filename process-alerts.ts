import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

async function sendSlack(webhookUrl: string, text: string){
  await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
}

export const handler: Handler = async () => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  const { data: pending, error } = await supabase
    .from('alerts')
    .select('id, org_id, champion_id, event_id, channel')
    .eq('status', 'pending')
    .limit(50)
  if (error) return { statusCode: 500, body: error.message }
  if (!pending?.length) return { statusCode: 200, body: 'no work' }

  const alertIds = pending.map(a=>a.id)
  const orgIds = Array.from(new Set(pending.map(a=>a.org_id)))

  const { data: slacks } = await supabase
    .from('integrations')
    .select('org_id, access')
    .in('org_id', orgIds)
    .eq('provider','slack')
  const slackByOrg = new Map((slacks||[]).map((s:any) => [s.org_id, s.access?.webhook_url]))

  const { data: champs } = await supabase.from('champions').select('id, full_name, email')
  const champsById = new Map((champs||[]).map((c:any) => [c.id, c]))
  const { data: events } = await supabase.from('events').select('id, type, payload, occurred_at')
  const eventsById = new Map((events||[]).map((e:any) => [e.id, e]))

  for (const a of pending){
    try {
      if (a.channel === 'slack'){
        const url = slackByOrg.get(a.org_id)
        if (!url) continue
        const champ = champsById.get(a.champion_id)
        const ev = eventsById.get(a.event_id)
        const company = ev?.payload?.new_company || ev?.payload?.company
        const title = ev?.payload?.title
        const text = `🎉 Champion move detected: ${champ?.full_name || champ?.email} → ${company}${title?` (${title})`:''}\nOccurred: ${ev?.occurred_at}`
        await sendSlack(url, text)
      }
      await supabase.from('alerts').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', a.id)
    } catch {
      await supabase.from('alerts').update({ status: 'error' }).eq('id', a.id)
    }
  }

  return { statusCode: 200, body: `processed ${alertIds.length}` }
}
