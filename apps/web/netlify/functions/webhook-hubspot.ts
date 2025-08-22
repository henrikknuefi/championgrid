import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export const handler: Handler = async (event) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const payload = JSON.parse(event.body || '{}')
    
    // Handle HubSpot webhook payload
    console.log('HubSpot webhook received:', payload)
    
    return { statusCode: 200, body: JSON.stringify({ received: true }) }
  } catch (e: any) {
    return { statusCode: 500, body: e.message }
  }
}