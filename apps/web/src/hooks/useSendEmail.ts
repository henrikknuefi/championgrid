export async function sendEmail(opts: { provider: 'gmail'|'outlook', org_id: string, to: string, subject: string, body: string }){
  const endpoint = opts.provider === 'gmail' ? '/.netlify/functions/gmail-send' : '/.netlify/functions/outlook-send'
  const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opts) })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}