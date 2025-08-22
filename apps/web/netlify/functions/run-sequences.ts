import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async () => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { data: enrollments } = await supabase
      .from('sequence_enrollments')
      .select('*')
      .eq('status', 'active')
      .lte('next_at', new Date().toISOString())

    if (!enrollments?.length) return { statusCode: 200, body: 'no sequences to run' }

    let processed = 0
    for (const enrollment of enrollments) {
      // Process sequence steps here
      // This is a placeholder - implement your sequence logic
      console.log('Processing sequence enrollment:', enrollment.id)
      processed++
    }

    return { statusCode: 200, body: `processed ${processed} sequences` }
  } catch (e: any) {
    return { statusCode: 500, body: e.message }
  }
}