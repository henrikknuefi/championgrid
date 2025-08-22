import { URLSearchParams } from 'url'

export async function refreshGoogle(refresh_token: string, client_id: string, client_secret: string){
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token, client_id, client_secret })
  const resp = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function refreshMicrosoft(refresh_token: string, client_id: string, client_secret: string){
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token, client_id, client_secret, scope: 'offline_access https://graph.microsoft.com/.default' })
  const resp = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function refreshSalesforce(refresh_token: string, client_id: string, client_secret: string){
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token, client_id, client_secret })
  const resp = await fetch('https://login.salesforce.com/services/oauth2/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function refreshHubSpot(refresh_token: string, client_id: string, client_secret: string){
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token, client_id, client_secret, redirect_uri: process.env.HUBSPOT_REDIRECT_URI! })
  const resp = await fetch('https://api.hubapi.com/oauth/v1/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}