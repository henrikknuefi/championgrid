import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async () => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  const since = new Date(Date.now() - 24*60*60*1000).toISOString()
  const { data: recents } = await supabase
    .from('champion_positions')
    .select('id, champion_id, company, title, created_at')
    .eq('is_current', true)
    .gte('created_at', since)

  if (!recents?.length) return { statusCode: 200, body: 'no new positions' }

  for (const pos of recents){
    const { data: prev } = await supabase
      .from('champion_positions')
      .select('company')
      .eq('champion_id', pos.champion_id)
      .eq('is_current', false)
      .order('end_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const prevCompany = prev?.company
    if (prevCompany && prevCompany !== pos.company){
      const { data: champ } = await supabase.from('champions').select('org_id').eq('id', pos.champion_id).maybeSingle()
      await supabase.from('events').insert({
        org_id: champ?.org_id,
        champion_id: pos.champion_id,
        type: 'company_change',
        payload: { old_company: prevCompany, new_company: pos.company, title: pos.title },
        occurred_at: new Date().toISOString()
      })
    }
  }

  return { statusCode: 200, body: `checked ${recents.length}` }
}
