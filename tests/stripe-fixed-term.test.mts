import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { enforceFixedTerm, policyVersion } from '../netlify/functions/_shared/fixed-term.mts';
import { handleWebhook } from '../netlify/functions/_shared/webhook-handler.mts';

function fixture(start = Date.UTC(2028, 1, 29, 12) / 1000) {
  const policy = { price: 'price_unit', paymentLink: 'plink_unit', livemode: false };
  const sub: any = {
    id: 'sub_unit', status: 'active', livemode: false, billing_cycle_anchor: start,
    schedule: null, trial_end: null, automatic_tax: { enabled: false },
    discounts: [], default_tax_rates: [], metadata: { sus_fixed_term: policyVersion() },
    items: { data: [{ quantity: 1, tax_rates: [], discounts: [], price: {
      id: policy.price, currency: 'gbp', unit_amount: 14900,
      recurring: { interval: 'month', interval_count: 1 },
    } }] },
  };
  const event: any = { id: 'evt_unit', object: 'event', livemode: false, type: 'checkout.session.completed',
    data: { object: { id: 'cs_unit', mode: 'subscription', status: 'complete', livemode: false,
      payment_link: policy.paymentLink, subscription: sub.id, currency: 'gbp', amount_total: 14900 } } };
  const calls: any[] = [];
  let schedule: any = null;
  let failUpdate = false;
  const client = new Stripe('unit-test-placeholder');
  client.subscriptions.retrieve = async () => structuredClone(sub);
  client.subscriptionSchedules.retrieve = async () => structuredClone(schedule);
  client.subscriptionSchedules.create = async (params: any, options: any) => {
    calls.push({ method: 'create', params, options });
    if (!schedule) {
      schedule = { id: 'sched_unit', metadata: {}, end_behavior: 'release',
        phases: [{ start_date: start, end_date: start + 31 * 86400, items: [{ price: policy.price, quantity: 1 }] }] };
      sub.schedule = schedule.id;
    }
    return structuredClone(schedule);
  };
  client.subscriptionSchedules.update = async (id: string, params: any, options: any) => {
    calls.push({ method: 'update', id, params, options });
    if (failUpdate) { failUpdate = false; throw new Error('Simulated temporary Stripe failure'); }
    assert.deepEqual(params.phases[0].duration, { interval: 'month', interval_count: 12 });
    const date = new Date(start * 1000);
    const lastDay = new Date(Date.UTC(date.getUTCFullYear() + 1, date.getUTCMonth() + 1, 0)).getUTCDate();
    const end = Date.UTC(date.getUTCFullYear() + 1, date.getUTCMonth(),
      Math.min(date.getUTCDate(), lastDay), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()) / 1000;
    schedule = { ...schedule, metadata: params.metadata, end_behavior: params.end_behavior,
      phases: [{ start_date: start, end_date: end, items: [{ price: policy.price, quantity: 1 }] }] };
    return structuredClone(schedule);
  };
  return { policy, sub, event, client, calls, failOnce: () => { failUpdate = true; }, getSchedule: () => schedule };
}

test('applies one 12-month phase and cancellation, with no £49 continuation or proration', async () => {
  for (const start of [Date.UTC(2026, 0, 31, 12) / 1000, Date.UTC(2028, 1, 29, 12) / 1000]) {
    const f = fixture(start);
    assert.equal((await enforceFixedTerm(f.client, f.event, f.policy)).state, 'configured');
    const request = f.calls.find(x => x.method === 'update').params;
    assert.equal(request.end_behavior, 'cancel');
    assert.equal(request.proration_behavior, 'none');
    assert.equal(request.phases.length, 1);
    assert.deepEqual(request.phases[0].items, [{ price: f.policy.price, quantity: 1 }]);
    assert.equal(request.phases[0].automatic_tax.enabled, false);
    assert.equal(request.metadata.sus_total_gbp, '1788');
  }
});

test('duplicate and later successful-payment events do not extend the term', async () => {
  const f = fixture();
  await enforceFixedTerm(f.client, f.event, f.policy);
  const before = structuredClone(f.getSchedule());
  f.event.type = 'checkout.session.async_payment_succeeded';
  assert.equal((await enforceFixedTerm(f.client, f.event, f.policy)).state, 'already_configured');
  assert.equal(f.calls.filter(x => x.method === 'update').length, 1);
  assert.deepEqual(f.getSchedule(), before);
});

test('retry after creation succeeded reuses the same idempotency keys', async () => {
  const f = fixture(); f.failOnce();
  await assert.rejects(enforceFixedTerm(f.client, f.event, f.policy));
  await enforceFixedTerm(f.client, f.event, f.policy);
  const creates = f.calls.filter(x => x.method === 'create');
  assert.equal(creates[0].options.idempotencyKey, creates[1].options.idempotencyKey);
  assert.equal(f.getSchedule().end_behavior, 'cancel');
});

test('unrelated payments are ignored and changed amounts, scope or mode are rejected', async () => {
  const ignored = fixture(); ignored.event.data.object.payment_link = 'other';
  assert.equal((await enforceFixedTerm(ignored.client, ignored.event, ignored.policy)).state, 'ignored');
  assert.equal(ignored.calls.length, 0);
  for (const mutate of [
    (f: any) => { f.event.livemode = true; },
    (f: any) => { f.event.data.object.amount_total = 100; },
    (f: any) => { f.sub.items.data[0].quantity = 2; },
    (f: any) => { f.sub.automatic_tax.enabled = true; },
    (f: any) => { f.sub.discounts = ['discount']; },
    (f: any) => { f.sub.metadata = {}; },
  ]) {
    const f = fixture(); mutate(f);
    await assert.rejects(enforceFixedTerm(f.client, f.event, f.policy));
    assert.equal(f.calls.length, 0);
  }
});

test('a changed existing schedule fails verification rather than silently extending it', async () => {
  const f = fixture();
  await enforceFixedTerm(f.client, f.event, f.policy);
  f.getSchedule().end_behavior = 'release';
  await assert.rejects(enforceFixedTerm(f.client, f.event, f.policy), /FIXED_TERM_NOT_CONFIRMED/);
  assert.equal(f.calls.filter(x => x.method === 'update').length, 1);
});

test('webhook checks real SDK signatures, rejects tampering and expires old signatures', async () => {
  for (const mode of ['valid', 'tampered', 'expired']) {
    const f = fixture();
    const secret = 'local-test-signing-placeholder';
    const body = JSON.stringify(f.event);
    const signature = f.client.webhooks.generateTestHeaderString({
      payload: body, secret, timestamp: Math.floor(Date.now() / 1000) - (mode === 'expired' ? 600 : 0),
    });
    const req = new Request('https://example.test/api/stripe/fixed-term', { method: 'POST',
      headers: { 'stripe-signature': signature }, body: mode === 'tampered' ? body + ' ' : body });
    const response = await handleWebhook(req, { key: 'unit-test-placeholder', secret, policy: f.policy, client: f.client });
    assert.equal(response.status, mode === 'valid' ? 200 : 400);
    if (mode !== 'valid') assert.equal(f.calls.length, 0);
  }
});

test('missing configuration fails closed and API errors request a retry without leaking details', async () => {
  const f = fixture();
  const unconfigured = await handleWebhook(new Request('https://example.test', { method: 'POST' }),
    { key: undefined, secret: undefined, policy: f.policy });
  assert.equal(unconfigured.status, 503);
  f.failOnce();
  const secret = 'local-test-signing-placeholder';
  const body = JSON.stringify(f.event);
  const signature = f.client.webhooks.generateTestHeaderString({ payload: body, secret });
  const response = await handleWebhook(new Request('https://example.test', {
    method: 'POST', headers: { 'stripe-signature': signature }, body,
  }), { key: 'unit-test-placeholder', secret, policy: f.policy, client: f.client });
  assert.equal(response.status, 500);
  assert.equal(await response.text(), 'Billing configuration requires retry or review');
});
