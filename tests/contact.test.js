const handler = require('../api/contact.js');

const ENV = {
  TURNSTILE_SECRET: 'test-secret',
  TURNSTILE_HOSTNAMES: 'www.alicemillage.cv, alicemillage.cv',
  RESEND_API_KEY: 're_test',
};

const goodBody = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello there',
  'cf-turnstile-response': 'tok',
};

function mockRes() {
  const res = { statusCode: 0, body: undefined, headers: {} };
  res.status = jest.fn((c) => { res.statusCode = c; return res; });
  res.json = jest.fn((b) => { res.body = b; return res; });
  res.setHeader = jest.fn((k, v) => { res.headers[k] = v; });
  return res;
}

const req = (body, extra) => ({
  method: 'POST',
  headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
  body,
  ...extra,
});

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const verified = (over) => json(200, { success: true, action: 'contact', hostname: 'www.alicemillage.cv', ...over });

let savedEnv;
beforeEach(() => {
  savedEnv = { ...process.env };
  Object.assign(process.env, ENV);
  delete process.env.CONTACT_TO;
  delete process.env.CONTACT_FROM;
  global.fetch = jest.fn();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = savedEnv;
  jest.restoreAllMocks();
});

test('rejects non-POST requests with 405', async () => {
  const res = mockRes();
  await handler(req(undefined, { method: 'GET' }), res);
  expect(res.statusCode).toBe(405);
  expect(res.headers.Allow).toBe('POST');
  expect(fetch).not.toHaveBeenCalled();
});

test('verifies the token, then emails the message via Resend', async () => {
  fetch.mockResolvedValueOnce(verified()).mockResolvedValueOnce(json(200, { id: 'e1' }));
  const res = mockRes();
  await handler(req(goodBody), res);

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ ok: true });

  const [vUrl, vInit] = fetch.mock.calls[0];
  expect(vUrl).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  const params = new URLSearchParams(vInit.body);
  expect(params.get('secret')).toBe('test-secret');
  expect(params.get('response')).toBe('tok');
  expect(params.get('remoteip')).toBe('203.0.113.7');

  const [eUrl, eInit] = fetch.mock.calls[1];
  expect(eUrl).toBe('https://api.resend.com/emails');
  expect(eInit.headers.Authorization).toBe('Bearer re_test');
  const email = JSON.parse(eInit.body);
  expect(email.to).toEqual(['alice.millage@gmail.com']);
  expect(email.reply_to).toBe('ada@example.com');
  expect(email.subject).toBe('Portfolio inquiry from Ada Lovelace');
  expect(email.text).toContain('Hello there');
});

test('honours CONTACT_TO and CONTACT_FROM', async () => {
  process.env.CONTACT_TO = 'inbox@example.com';
  process.env.CONTACT_FROM = 'Site <hi@example.com>';
  fetch.mockResolvedValueOnce(verified()).mockResolvedValueOnce(json(200, {}));
  await handler(req(goodBody), mockRes());
  const email = JSON.parse(fetch.mock.calls[1][1].body);
  expect(email.to).toEqual(['inbox@example.com']);
  expect(email.from).toBe('Site <hi@example.com>');
});

test.each([
  ['siteverify says no', verified({ success: false })],
  ['wrong action', verified({ action: 'signup' })],
  ['hostname not allowed', verified({ hostname: 'localhost' })],
  ['siteverify HTTP error', json(500, {})],
])('returns 403 and sends nothing when %s', async (_label, verifyResponse) => {
  fetch.mockResolvedValueOnce(verifyResponse);
  const res = mockRes();
  await handler(req(goodBody), res);
  expect(res.statusCode).toBe(403);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('fails closed when siteverify is unreachable', async () => {
  fetch.mockRejectedValueOnce(new Error('network down'));
  const res = mockRes();
  await handler(req(goodBody), res);
  expect(res.statusCode).toBe(403);
});

test.each([
  ['the token is missing', { ...goodBody, 'cf-turnstile-response': undefined }, ENV],
  ['the token is too long', { ...goodBody, 'cf-turnstile-response': 'x'.repeat(2049) }, ENV],
  ['TURNSTILE_HOSTNAMES is empty', goodBody, { ...ENV, TURNSTILE_HOSTNAMES: ' ' }],
])('returns 403 without calling siteverify when %s', async (_label, body, env) => {
  Object.assign(process.env, env);
  const res = mockRes();
  await handler(req(body), res);
  expect(res.statusCode).toBe(403);
  expect(fetch).not.toHaveBeenCalled();
});

test.each([
  ['a bad email', { email: 'not-an-email' }],
  ['an empty message', { message: '   ' }],
  ['an overlong message', { message: 'x'.repeat(5001) }],
])('returns 400 for %s after verification', async (_label, over) => {
  fetch.mockResolvedValueOnce(verified());
  const res = mockRes();
  await handler(req({ ...goodBody, ...over }), res);
  expect(res.statusCode).toBe(400);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('strips line breaks from the name used in the subject', async () => {
  fetch.mockResolvedValueOnce(verified()).mockResolvedValueOnce(json(200, {}));
  await handler(req({ ...goodBody, name: 'Eve\r\nBcc: x@example.com' }), mockRes());
  expect(JSON.parse(fetch.mock.calls[1][1].body).subject).toBe('Portfolio inquiry from Eve Bcc: x@example.com');
});

test('returns 502 when Resend rejects the email', async () => {
  fetch.mockResolvedValueOnce(verified()).mockResolvedValueOnce(json(403, { message: 'nope' }));
  const res = mockRes();
  await handler(req(goodBody), res);
  expect(res.statusCode).toBe(502);
  expect(res.body).toEqual({ ok: false, error: 'send_failed' });
});

test('returns 500 when RESEND_API_KEY is missing', async () => {
  delete process.env.RESEND_API_KEY;
  fetch.mockResolvedValueOnce(verified());
  const res = mockRes();
  await handler(req(goodBody), res);
  expect(res.statusCode).toBe(500);
});
