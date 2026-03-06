export interface Env {
  RESEND_API_KEY: string
}

const ALLOWED_ORIGIN = 'https://simonreed.co'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    let body: { subject: string; markdown: string; from_name: string; from_email: string }

    try {
      body = await request.json()
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders })
    }

    const { subject, markdown, from_name, from_email } = body

    if (!subject || !markdown || !from_name || !from_email) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders })
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
  <p style="font-size: 14px; color: #71717a; margin-bottom: 24px;">
    Signed off by <strong>${escapeHtml(from_name)}</strong> (${escapeHtml(from_email)})
  </p>
  <pre style="white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 13px; background: #f4f4f5; padding: 20px; border-radius: 8px; line-height: 1.6;">${escapeHtml(markdown)}</pre>
  <p style="font-size: 12px; color: #a1a1aa; margin-top: 24px;">Sent via simonreed.co/spec</p>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Spec Sign-Off <onboarding@resend.dev>',
        to: ['hello@simonreed.co'],
        reply_to: from_email,
        subject,
        html,
        attachments: [
          {
            filename: subject.replace(/[^a-z0-9-]/gi, '-').toLowerCase() + '.md',
            content: btoa(unescape(encodeURIComponent(markdown))),
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response('Email failed', { status: 500, headers: corsHeaders })
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  },
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
