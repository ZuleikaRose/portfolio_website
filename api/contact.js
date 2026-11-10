'use strict';

// Contact form endpoint (Vercel Function, Node runtime).
// 1. Verifies the Cloudflare Turnstile token with siteverify (fails closed).
// 2. Emails the message to the site owner through Resend.
//
// Env vars:
//   TURNSTILE_SECRET     Turnstile widget secret
//   TURNSTILE_HOSTNAMES  comma-separated frontend hostnames this deployment accepts
//   RESEND_API_KEY       provisioned by the Resend Vercel integration
//   CONTACT_TO           inbox that receives messages (default below)
//   CONTACT_FROM         sender; must be on a domain verified in Resend (default below)

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_URL = 'https://api.resend.com/emails';
const EXPECTED_ACTION = 'contact';
const DEFAULT_TO = 'alice.millage@gmail.com';
const DEFAULT_FROM = 'Portfolio contact form <onboarding@resend.dev>';
const LIMITS = { name: 200, email: 320, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const send = (res, status, body) => res.status(status).json(body);

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || undefined;
}

function readFields(body) {
  const b = body && typeof body === 'object' ? body : {};
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const fields = {
    name: str(b.name).replace(/[\r\n]+/g, ' '),
    email: str(b.email),
    message: str(b.message),
  };
  const valid =
    fields.name && fields.name.length <= LIMITS.name &&
    fields.email.length <= LIMITS.email && EMAIL_RE.test(fields.email) &&
    fields.message && fields.message.length <= LIMITS.message;
  return { fields, token: b['cf-turnstile-response'], valid: Boolean(valid) };
}

async function verifyTurnstile(token, remoteip) {
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES || '').split(',').map((h) => h.trim()).filter(Boolean),
  );
  const secret = process.env.TURNSTILE_SECRET;
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048 ||
      expectedHostnames.size === 0 || !secret) {
    return false;
  }
  try {
    const params = { secret, response: token };
    if (remoteip) params.remoteip = remoteip;
    const r = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams(params),
    });
    if (!r.ok) return false;
    const result = await r.json();
    return result.success === true &&
      result.action === EXPECTED_ACTION &&
      expectedHostnames.has(result.hostname);
  } catch {
    return false; // network error, timeout or bad JSON: fail closed
  }
}

async function sendEmail({ name, email, message }) {
  const r = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || DEFAULT_FROM,
      to: [process.env.CONTACT_TO || DEFAULT_TO],
      reply_to: email,
      subject: 'Portfolio inquiry from ' + name,
      text: message + '\n\n— ' + name + ' (' + email + ')',
    }),
  });
  if (!r.ok) throw new Error('resend ' + r.status);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const { fields, token, valid } = readFields(req.body);

  if (!(await verifyTurnstile(token, clientIp(req)))) {
    return send(res, 403, { ok: false, error: 'verification_failed' });
  }
  if (!valid) {
    return send(res, 400, { ok: false, error: 'invalid_fields' });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('contact: RESEND_API_KEY is not set');
    return send(res, 500, { ok: false, error: 'send_failed' });
  }

  try {
    await sendEmail(fields);
  } catch (err) {
    console.error('contact: email delivery failed:', err.message);
    return send(res, 502, { ok: false, error: 'send_failed' });
  }
  return send(res, 200, { ok: true });
}

module.exports = handler;
module.exports.default = handler;
